import { notFound } from "next/navigation";
import Link from "next/link";
import { LANGS, type Lang } from "@/lib/excursions";

export const dynamic = "force-dynamic";

const COPY: Record<
  Lang,
  { title: string; sub: string; reasons: Record<string, string>; back: string }
> = {
  es: {
    title: "No pudimos confirmar la reserva",
    sub: "Tu booking quedó como pendiente. Probá de nuevo o escribinos por mail.",
    reasons: {
      token: "El enlace expiró o no es válido.",
      rate: "Demasiados intentos. Reintenta en unos minutos.",
      missing: "No encontramos esa reserva.",
      cancelled: "Cancelaste el pago.",
    },
    back: "← Volver al catálogo",
  },
  en: {
    title: "We couldn't confirm your booking",
    sub: "Your booking is still pending. Try again or email us.",
    reasons: {
      token: "The link expired or is invalid.",
      rate: "Too many attempts. Try again in a few minutes.",
      missing: "We couldn't find that booking.",
      cancelled: "You cancelled the payment.",
    },
    back: "← Back to catalogue",
  },
  "pt-br": {
    title: "Nao conseguimos confirmar sua reserva",
    sub: "Sua reserva ficou pendente. Tente de novo ou nos escreva por e-mail.",
    reasons: {
      token: "O link expirou ou nao e valido.",
      rate: "Muitas tentativas. Tente novamente em alguns minutos.",
      missing: "Nao encontramos essa reserva.",
      cancelled: "Voce cancelou o pagamento.",
    },
    back: "← Voltar ao catalogo",
  },
};

export default async function ErrorPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ orderId?: string; reason?: string }>;
}) {
  const { lang } = await params;
  const { reason } = await searchParams;
  if (!LANGS.includes(lang as Lang)) notFound();
  const c = COPY[lang as Lang];
  const reasonText = reason ? c.reasons[reason] ?? "" : "";

  return (
    <article className="bg-bg">
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[760px] px-6 lg:px-12 pt-20 pb-16 text-center">
          <p className="eyebrow mb-6 text-warning">ERROR · 41°S</p>
          <h1 className="display text-[32px] md:text-[44px] text-fg">
            {c.title}
          </h1>
          <p className="mt-4 text-base text-muted max-w-md mx-auto">{c.sub}</p>
          {reasonText ? (
            <p className="mt-6 text-sm text-fg max-w-md mx-auto border border-hairline px-4 py-3 bg-bg">
              {reasonText}
            </p>
          ) : null}
          <Link
            href={`/${lang}#catalogo`}
            className="block mt-10 text-sm text-muted hover:text-fg uppercase tracking-[0.16em]"
          >
            {c.back}
          </Link>
        </div>
      </section>
    </article>
  );
}
