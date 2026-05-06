import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Excursion, Lang } from "@/lib/excursions";
import { formatPrice } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export function ExcursionDetail({
  excursion,
  lang,
}: {
  excursion: Excursion;
  lang: Lang;
}) {
  const t = getDictionary(lang);
  const fm = excursion.fm;
  const langBody = excursion.byLang[lang] || excursion.byLang.es;
  const bodyMd = stripHero(langBody);

  return (
    <article>
      <DetailHero lang={lang} fm={fm} />

      <section className="bg-bg">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="prose-sur41 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 border border-hairline bg-bg">
              <div className="px-5 py-4 border-b border-hairline flex items-baseline justify-between">
                <span className="eyebrow">{t.excursion.from}</span>
                <span className="dp text-base font-semibold text-fg">
                  {t.excursion.ars} {formatPrice(fm.price_ars)}
                </span>
              </div>
              <FactRow label={t.excursion.duration} value={formatDuration(fm, t)} />
              <FactRow label={t.excursion.difficulty} value={fm.difficulty || t.excursion.consult} />
              <FactRow
                label={t.excursion.minAge}
                value={fm.min_age ? `${fm.min_age}+` : t.excursion.consult}
              />
              {fm.schedule ? <FactRow label={t.excursion.schedule} value={fm.schedule} /> : null}
              {fm.departure_point ? (
                <FactRow label={t.excursion.meetingPoint} value={fm.departure_point} />
              ) : null}
              {fm.payment ? <FactRow label={t.excursion.payment} value={fm.payment} /> : null}
              {fm.promo ? <FactRow label={t.excursion.promo} value={fm.promo} /> : null}

              {fm.optional && fm.optional.length > 0 ? (
                <div className="border-t border-hairline px-5 py-4">
                  <p className="eyebrow mb-2">+ Adicional</p>
                  {fm.optional.map((o) => (
                    <div key={o.name} className="flex justify-between text-sm">
                      <span>{o.name}</span>
                      <span className="dp">
                        {t.excursion.ars} {formatPrice(o.price_ars)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-hairline p-5">
                <a
                  href={`mailto:reservas@sur41.example?subject=${encodeURIComponent(`Consulta · ${fm.title}`)}`}
                  className="block text-center bg-fg text-bg py-3 px-4 text-sm hover:bg-accent-strong transition-colors uppercase tracking-[0.16em] font-medium"
                >
                  {t.excursion.reserve}
                </a>
                <Link
                  href={`/${lang}#catalogo`}
                  className="block text-center mt-3 text-xs text-muted hover:text-fg uppercase tracking-[0.16em]"
                >
                  ← {t.excursion.back}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {fm.sources && fm.sources.length > 0 ? (
        <section className="border-t border-hairline bg-bg">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-10">
            <p className="eyebrow mb-4">{t.excursion.sources}</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {fm.sources.map((s) => (
                <li key={s} className="text-xs text-muted truncate">
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-fg underline decoration-hairline underline-offset-2"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}

function DetailHero({ lang, fm }: { lang: Lang; fm: Excursion["fm"] }) {
  const t = getDictionary(lang);
  return (
    <section className="border-b border-hairline bg-bg">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 pt-16 pb-12 md:pt-20 md:pb-16">
        <Link
          href={`/${lang}#catalogo`}
          className="eyebrow hover:text-fg transition-colors inline-block mb-6"
        >
          ← {t.excursion.back}
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <p className="eyebrow mb-4 dp">{fm.slug.toUpperCase()} · 41°S</p>
            <h1 className="display text-[36px] md:text-[56px] lg:text-[64px] text-fg">
              {fm.title}
            </h1>
          </div>
          <div className="md:col-span-4 md:border-l md:border-hairline md:pl-8 flex flex-col justify-end">
            <div className="flex items-baseline justify-between border-t border-hairline pt-3">
              <span className="eyebrow">{t.excursion.from}</span>
              <span className="dp text-2xl font-semibold text-fg">
                {t.excursion.ars} {formatPrice(fm.price_ars)}
              </span>
            </div>
            {fm.promo ? (
              <p className="dp text-[10px] text-accent-strong mt-2 uppercase tracking-[0.18em]">
                {fm.promo}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-hairline px-5 py-3 flex items-baseline justify-between gap-3">
      <span className="eyebrow shrink-0">{label}</span>
      <span className="text-sm text-fg text-right">{value}</span>
    </div>
  );
}

function formatDuration(
  fm: Excursion["fm"],
  t: ReturnType<typeof getDictionary>,
): string {
  if (fm.duration_days) return fm.duration_days;
  if (fm.duration_hours) return `${fm.duration_hours} ${t.excursion.hoursAbbrev}`;
  return t.excursion.consult;
}

function stripHero(body: string): string {
  return body.replace(/^###\s+Hero[\s\S]*?(?=\n###\s)/i, "");
}
