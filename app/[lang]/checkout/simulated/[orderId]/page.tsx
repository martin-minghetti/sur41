import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  getBookingByToken,
  simulatePaymentAction,
} from "@/lib/server/bookings";
import { getDb, schema } from "@/lib/server/db";
import {
  formatPrice,
  LANGS,
  type Lang,
} from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export const dynamic = "force-dynamic";

export default async function SimulatedCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang, orderId } = await params;
  const { token } = await searchParams;
  if (!LANGS.includes(lang as Lang)) notFound();
  const t = getDictionary(lang as Lang);

  if (!token) redirect(`/${lang}/checkout/error?reason=token`);
  const result = await getBookingByToken(orderId, token);
  if (!result) redirect(`/${lang}/checkout/error?reason=token`);
  const { booking } = result;

  if (booking.status === "paid") {
    redirect(
      `/${lang}/checkout/exito?orderId=${orderId}&token=${encodeURIComponent(token)}`,
    );
  }

  return (
    <article className="bg-bg">
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[760px] px-6 lg:px-12 pt-16 pb-10">
          <p className="eyebrow mb-4">{t.simulated.eyebrow}</p>
          <h1 className="display text-[32px] md:text-[44px] text-fg">
            {t.simulated.title}
          </h1>
          <p className="mt-3 text-sm text-muted max-w-md">{t.simulated.sub}</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[760px] px-6 lg:px-12 py-10">
          <div className="border border-hairline bg-bg">
            <div className="px-5 py-4 border-b border-hairline flex items-baseline justify-between">
              <p className="eyebrow">{t.simulated.detail}</p>
              <span className="dp text-[10px] text-muted">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <Row label={t.excursion.from.toUpperCase()} value={booking.excursionTitle} />
            <Row label={t.booking.date.toUpperCase()} value={booking.bookingDate} mono />
            <Row label={t.booking.people.toUpperCase()} value={String(booking.people)} mono />
            <Row label="EMAIL" value={booking.customerEmail} />
            <div className="border-t border-hairline px-5 py-4 flex items-baseline justify-between">
              <span className="eyebrow">{t.simulated.total}</span>
              <span className="dp text-2xl font-semibold">
                {t.excursion.ars} {formatPrice(booking.totalArs)}
              </span>
            </div>

            <form
              action={async () => {
                "use server";
                await simulatePaymentAction(orderId, token);
              }}
              className="border-t border-hairline"
            >
              <button
                type="submit"
                className="w-full bg-fg text-bg py-4 px-4 text-sm uppercase tracking-[0.16em] font-medium hover:bg-accent-strong transition-colors"
              >
                {t.simulated.confirm}
              </button>
            </form>
            <Link
              href={`/${lang}/checkout/error?orderId=${orderId}&reason=cancelled`}
              className="block text-center px-5 py-3 text-xs text-muted hover:text-fg uppercase tracking-[0.16em] border-t border-hairline"
            >
              {t.simulated.cancel}
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted text-center">
            {t.simulated.footnote}
          </p>
        </div>
      </section>
    </article>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="border-t border-hairline px-5 py-3 flex items-baseline justify-between gap-3">
      <span className="eyebrow shrink-0">{label}</span>
      <span
        className={`text-sm text-fg text-right ${mono ? "dp font-semibold" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
