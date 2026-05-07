import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/server/db";
import { signToken } from "@/lib/server/hmac";
import { rateLimit, getClientIp } from "@/lib/server/rate-limit";
import { webhookPayloadSchema } from "@/lib/server/validation";
import { sendBookingConfirmedEmail } from "@/lib/email/booking-confirmed";
import type { Lang } from "@/lib/excursions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIMESTAMP_MAX_AGE_MS = 5 * 60 * 1000;

function verifyMpSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  let ts = "";
  let v1 = "";
  for (const part of xSignature.split(",")) {
    const [k, v] = part.split("=").map((s) => s.trim());
    if (k === "ts") ts = v;
    if (k === "v1") v1 = v;
  }
  if (!ts || !v1) return false;

  const tsMs = Number(ts) * 1000;
  if (!Number.isFinite(tsMs)) return false;
  if (Math.abs(Date.now() - tsMs) > TIMESTAMP_MAX_AGE_MS) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  if (expected.length !== v1.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = rateLimit(`webhook:${ip}`, {
    limit: 60,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return new NextResponse("rate", { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("ok", { status: 200 });
  }

  const parsed = webhookPayloadSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.data?.id) {
    return new NextResponse("ok", { status: 200 });
  }
  const paymentId = String(parsed.data.data.id);

  if (process.env.MP_WEBHOOK_SECRET) {
    if (!verifyMpSignature(req, paymentId)) {
      return new NextResponse("ok", { status: 200 });
    }
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return new NextResponse("ok", { status: 200 });

  let externalReference: string | null = null;
  let mpStatus: string | null = null;
  try {
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return new NextResponse("ok", { status: 200 });
    const data = (await res.json()) as {
      external_reference?: string;
      status?: string;
    };
    externalReference = data.external_reference ?? null;
    mpStatus = data.status ?? null;
  } catch {
    return new NextResponse("ok", { status: 200 });
  }

  if (!externalReference || mpStatus !== "approved") {
    return new NextResponse("ok", { status: 200 });
  }

  const db = getDb();
  const existing = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, externalReference))
    .limit(1);
  const booking = existing[0];
  if (!booking) return new NextResponse("ok", { status: 200 });
  if (booking.status === "paid") return new NextResponse("ok", { status: 200 });

  await db
    .update(schema.bookings)
    .set({
      status: "paid",
      mpPaymentId: paymentId,
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, externalReference));

  void sendBookingConfirmedEmail({
    bookingId: booking.id,
    excursionTitle: booking.excursionTitle,
    bookingDate: booking.bookingDate,
    people: booking.people,
    totalArs: booking.totalArs,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    lang: booking.lang as Lang,
  }).catch(() => {});

  // Token returned for compat; clients use external_reference + token from success URL
  signToken({ kind: "checkout", orderId: booking.id });

  return new NextResponse("ok", { status: 200 });
}
