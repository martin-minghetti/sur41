import Link from "next/link";
import type { Excursion, Lang } from "@/lib/excursions";
import { extractTagline, formatPrice } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export function ExcursionCard({
  excursion,
  lang,
  index,
}: {
  excursion: Excursion;
  lang: Lang;
  index: number;
}) {
  const t = getDictionary(lang);
  const tagline = extractTagline(excursion.byLang[lang]);
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/${lang}/excursion/${excursion.fm.slug}`}
      className="group flex flex-col border border-hairline bg-bg hover:border-fg transition-colors"
    >
      <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-hairline">
        <span className="dp text-[11px] text-muted">{num} · {excursion.fm.slug.toUpperCase()}</span>
        {excursion.fm.promo ? (
          <span className="dp text-[10px] text-accent-strong border border-accent-strong px-1.5 py-0.5">
            {excursion.fm.promo.toUpperCase()}
          </span>
        ) : null}
      </div>
      <div className="px-5 py-6 flex-1 flex flex-col">
        <h3 className="text-xl md:text-[22px] font-medium tracking-tight leading-snug text-fg">
          {excursion.fm.title}
        </h3>
        {tagline ? (
          <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
            {tagline}
          </p>
        ) : null}

        <div className="mt-auto pt-6 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="eyebrow">{t.excursion.from}</span>
            <span className="dp text-base font-semibold mt-1">
              {t.excursion.ars} {formatPrice(excursion.fm.price_ars)}
            </span>
          </div>
          <span className="dp text-[11px] text-fg group-hover:text-accent-strong transition-colors uppercase tracking-[0.16em]">
            {t.home.seeMore} →
          </span>
        </div>
      </div>
    </Link>
  );
}
