"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getDb, schema } from "./db";
import { signToken } from "./hmac";
import { rateLimit, getClientIp } from "./rate-limit";
import { bookingFormSchema } from "./validation";
import { getExcursion, type Lang } from "@/lib/excursions";
import {
  createMpPreference,
  getPaymentMode,
  getSiteUrl,
} from "./payment";
import { sendBookingConfirmedEmail } from "@/lib/email/booking-confirmed";

export type BookingActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; bookingId: string; redirectUrl: string };

export async function createBookingAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const ip = getClientIp(await headers());
  const limit = rateLimit(`booking:${ip}`, { limit: 10, windowMs: 5 * 60_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: `Demasiados intentos. Reintenta en ${Math.ceil(limit.retryAfterMs / 1000)}s.`,
    };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return {
      status: "error",
      message: "Revisá los campos marcados.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const excursion = getExcursion(data.excursionSlug);
  if (!excursion) {
    return { status: "error", message: "Excursión no encontrada." };
  }

  const totalArs = excursion.fm.price_ars * data.people;

  const db = getDb();
  const [created] = await db
    .insert(schema.bookings)
    .values({
      excursionSlug: excursion.fm.slug,
      excursionTitle: excursion.fm.title,
      bookingDate: data.bookingDate,
      people: data.people,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      customerNotes: data.customerNotes || null,
      totalArs,
      status: "pending",
      lang: data.lang,
    })
    .returning();

  const lang = data.lang as Lang;
  const mode = getPaymentMode();

  if (mode === "simulated") {
    const token = signToken({ kind: "checkout", orderId: created.id });
    const url = `/${lang}/checkout/simulated/${created.id}?token=${encodeURIComponent(token)}`;
    return { status: "success", bookingId: created.id, redirectUrl: url };
  }

  const successToken = signToken({ kind: "checkout", orderId: created.id });
  const successUrl = `${getSiteUrl()}/${lang}/checkout/exito?orderId=${created.id}&token=${encodeURIComponent(successToken)}`;
  const failureUrl = `${getSiteUrl()}/${lang}/checkout/error?orderId=${created.id}`;

  try {
    const pref = await createMpPreference({
      bookingId: created.id,
      excursionTitle: excursion.fm.title,
      bookingDate: data.bookingDate,
      people: data.people,
      totalArs,
      customerEmail: data.customerEmail,
      lang,
      successUrl,
      failureUrl,
    });
    await db
      .update(schema.bookings)
      .set({ mpPreferenceId: pref.id, updatedAt: new Date() })
      .where(eq(schema.bookings.id, created.id));
    return {
      status: "success",
      bookingId: created.id,
      redirectUrl: pref.initPoint,
    };
  } catch (err) {
    return {
      status: "error",
      message: `MP error: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
}

export async function simulatePaymentAction(
  bookingId: string,
  token: string,
): Promise<void> {
  const ip = getClientIp(await headers());
  const limit = rateLimit(`simulate:${ip}`, {
    limit: 6,
    windowMs: 5 * 60_000,
  });
  if (!limit.allowed) {
    redirect(`/es/checkout/error?orderId=${bookingId}&reason=rate`);
  }

  const { verifyToken } = await import("./hmac");
  const v = verifyToken(token, { kind: "checkout", orderId: bookingId });
  if (!v.valid) {
    redirect(`/es/checkout/error?orderId=${bookingId}&reason=token`);
  }

  const db = getDb();
  const [updated] = await db
    .update(schema.bookings)
    .set({
      status: "paid",
      mpPaymentId: `simulated-${Date.now()}`,
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, bookingId))
    .returning();

  if (!updated) {
    redirect(`/es/checkout/error?orderId=${bookingId}&reason=missing`);
  }

  const successToken = signToken({
    kind: "checkout",
    orderId: bookingId,
  });

  void sendBookingConfirmedEmail({
    bookingId: updated.id,
    excursionTitle: updated.excursionTitle,
    bookingDate: updated.bookingDate,
    people: updated.people,
    totalArs: updated.totalArs,
    customerName: updated.customerName,
    customerEmail: updated.customerEmail,
    lang: updated.lang as Lang,
  }).catch(() => {});

  redirect(
    `/${updated.lang}/checkout/exito?orderId=${bookingId}&token=${encodeURIComponent(successToken)}`,
  );
}

export async function getBookingByToken(
  bookingId: string,
  token: string,
): Promise<{
  booking: typeof schema.bookings.$inferSelect;
} | null> {
  const { verifyToken } = await import("./hmac");
  const v = verifyToken(token, { kind: "checkout", orderId: bookingId });
  if (!v.valid) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .limit(1);
  const booking = rows[0];
  if (!booking) return null;
  return { booking };
}
