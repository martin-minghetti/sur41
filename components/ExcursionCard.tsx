import Link from "next/link";
import Image from "next/image";
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
  const imgSrc = `/images/${excursion.fm.slug}.jpg`;

  return (
    <Link
      href={`/${lang}/excursion/${excursion.fm.slug}`}
      className="group flex flex-col border border-hairline bg-bg hover:border-fg transition-colors"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-hairline bg-fg/5">
        <Image
          src={imgSrc}
          alt={excursion.fm.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover grayscale-[12%] group-hover:grayscale-0 transition-[filter] duration-500"
        />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="dp text-[10px] text-bg bg-black/55 backdrop-blur-sm px-2 py-1 uppercase tracking-[0.16em]">
            {num} · {excursion.fm.slug}
          </span>
          {excursion.fm.promo ? (
            <span className="dp text-[10px] text-bg bg-accent-strong px-2 py-1 uppercase tracking-[0.16em]">
              {excursion.fm.promo}
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-5 py-5 flex-1 flex flex-col">
        <h3 className="text-xl md:text-[22px] font-medium tracking-tight leading-snug text-fg">
          {excursion.fm.title}
        </h3>
        {tagline ? (
          <p className="mt-3 text-sm text-muted leading-relaxed line-clamp-3">
            {tagline}
          </p>
        ) : null}

        <div className="mt-auto pt-5 flex items-end justify-between">
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
