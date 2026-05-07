import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookingByToken } from "@/lib/server/bookings";
import { formatPrice, LANGS, type Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export const dynamic = "force-dynamic";

const COPY: Record<Lang, { title: string; sub: string; back: string }> = {
  es: {
    title: "Reserva confirmada",
    sub: "Te enviamos un mail con el detalle. El equipo te contacta antes de la salida con horario y punto de encuentro.",
    back: "← Volver al catálogo",
  },
  en: {
    title: "Booking confirmed",
    sub: "We sent you an email with the details. The team will reach out before the trip with time and meeting point.",
    back: "← Back to catalogue",
  },
  "pt-br": {
    title: "Reserva confirmada",
    sub: "Te enviamos um e-mail com os detalhes. A equipe entra em contato antes do passeio com horario e ponto de encontro.",
    back: "← Voltar ao catalogo",
  },
};

export default async function ExitoPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ orderId?: string; token?: string }>;
}) {
  const { lang } = await params;
  const { orderId, token } = await searchParams;
  if (!LANGS.includes(lang as Lang)) notFound();
  const t = getDictionary(lang as Lang);
  const c = COPY[lang as Lang];

  if (!orderId || !token) notFound();
  const result = await getBookingByToken(orderId, token);
  if (!result) notFound();
  const { booking } = result;

  return (
    <article className="bg-bg">
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[760px] px-6 lg:px-12 pt-20 pb-12 text-center">
          <p className="eyebrow mb-6 text-accent-strong">CONFIRMED · 41°S</p>
          <h1 className="display text-[36px] md:text-[52px] text-fg">
            {c.title}
          </h1>
          <p className="mt-4 text-base text-muted max-w-md mx-auto">{c.sub}</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[760px] px-6 lg:px-12 py-10">
          <div className="border border-hairline bg-bg">
            <div className="px-5 py-4 border-b border-hairline flex items-baseline justify-between">
              <p className="eyebrow">{t.excursion.details}</p>
              <span className="dp text-[10px] text-muted">
                REF {booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <Row label={t.excursion.from} value={booking.excursionTitle} />
            <Row label={t.booking.date} value={booking.bookingDate} mono />
            <Row label={t.booking.people} value={String(booking.people)} mono />
            <Row label={t.booking.name} value={booking.customerName} />
            <Row label={t.booking.email} value={booking.customerEmail} />
            <div className="border-t border-hairline px-5 py-4 flex items-baseline justify-between">
              <span className="eyebrow">TOTAL</span>
              <span className="dp text-2xl font-semibold">
                {t.excursion.ars} {formatPrice(booking.totalArs)}
              </span>
            </div>
          </div>

          <Link
            href={`/${lang}#catalogo`}
            className="block text-center mt-8 text-sm text-muted hover:text-fg uppercase tracking-[0.16em]"
          >
            {c.back}
          </Link>
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
