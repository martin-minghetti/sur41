import type { Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

const COPY: Record<Lang, { eyebrow: string; title: string; sub: string; cta: string }> = {
  es: {
    eyebrow: "+ A MEDIDA",
    title: "¿No encontrás lo que buscás?",
    sub: "Armamos itinerarios privados o combinados de varios días. Decinos qué tenés en mente y te respondemos en 24hs.",
    cta: "Escribinos →",
  },
  en: {
    eyebrow: "+ CUSTOM",
    title: "Don't see what you need?",
    sub: "We design private itineraries and multi-day combos. Tell us what you have in mind, we get back within 24 hours.",
    cta: "Get in touch →",
  },
  "pt-br": {
    eyebrow: "+ SOB MEDIDA",
    title: "Nao encontrou o que procura?",
    sub: "Montamos roteiros privados ou combinados de varios dias. Diga o que voce tem em mente, respondemos em 24h.",
    cta: "Fala com a gente →",
  },
};

export function CustomTripCard({ lang, index }: { lang: Lang; index: number }) {
  const c = COPY[lang];
  const num = String(index + 1).padStart(2, "0");
  return (
    <a
      href="mailto:reservas@sur41.example?subject=Itinerario a medida"
      className="group flex flex-col bg-fg text-bg hover:bg-accent-strong transition-colors"
    >
      <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-bg/20">
        <span className="dp text-[11px] text-bg/60">{num} · CUSTOM</span>
        <span className="dp text-[10px] text-bg border border-bg/40 px-1.5 py-0.5">
          {c.eyebrow}
        </span>
      </div>
      <div className="px-5 py-6 flex-1 flex flex-col">
        <h3 className="text-xl md:text-[22px] font-medium tracking-tight leading-snug">
          {c.title}
        </h3>
        <p className="mt-3 text-sm text-bg/70 leading-relaxed">{c.sub}</p>
        <div className="mt-auto pt-6 flex items-end justify-between">
          <span className="dp text-[11px] uppercase tracking-[0.16em] text-bg">
            {c.cta}
          </span>
        </div>
      </div>
    </a>
  );
}
