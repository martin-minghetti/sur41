import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import {
  getExcursion,
  formatPrice,
  LANGS,
  type Lang,
} from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";
import {
  translateDifficulty,
  translatePayment,
  translateSchedule,
} from "@/lib/translate-fields";
import type { Metadata } from "next";

export const dynamic = "force-static";

export function generateStaticParams() {
  const slugs = [
    "cerro-tronador-ventisquero-negro",
    "circuito-chico",
    "san-martin-7-lagos",
    "bolson-lago-puelo",
    "circuito-grande",
    "traslados",
    "rafting-rio-limay",
    "kayak-lago-moreno",
    "cabalgata-bosque",
    "buceo-bautismo",
    "canopy",
    "paquete-tronador-sma-circuito-chico",
    "isla-victoria-arrayanes",
    "puerto-blest-cantaros",
  ];
  return LANGS.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ex = getExcursion(slug);
  if (!ex) return { title: "Reservar · Sur41" };
  return { title: `Reservar · ${ex.fm.title} · Sur41` };
}

export default async function ReservarPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  const excursion = getExcursion(slug);
  if (!excursion) notFound();
  const t = getDictionary(lang as Lang);

  return (
    <article className="bg-bg">
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 pt-10 pb-8">
          <Link
            href={`/${lang}/excursion/${slug}`}
            className="eyebrow hover:text-fg transition-colors inline-block mb-4"
          >
            ← {excursion.fm.title}
          </Link>
          <h1 className="display text-[32px] md:text-[44px] text-fg">
            {t.booking.title}
          </h1>
          <p className="mt-3 text-sm text-muted max-w-xl">{t.booking.sub}</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <BookingForm
              lang={lang as Lang}
              excursionSlug={slug}
              priceArs={excursion.fm.price_ars}
              schedule={excursion.fm.schedule}
              minAge={excursion.fm.min_age ?? null}
            />
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 border border-hairline">
              <div className="relative aspect-[16/10] overflow-hidden bg-fg/5">
                <Image
                  src={`/images/${slug}.jpg`}
                  alt={excursion.fm.title}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover grayscale-[8%]"
                />
              </div>
              <div className="px-5 py-4 border-b border-hairline">
                <p className="eyebrow">{slug.toUpperCase()}</p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">
                  {excursion.fm.title}
                </h2>
              </div>
              <FactRow
                label={t.excursion.from}
                value={`${t.excursion.ars} ${formatPrice(excursion.fm.price_ars)}`}
                mono
              />
              {excursion.fm.duration_hours ? (
                <FactRow
                  label={t.excursion.duration}
                  value={`${excursion.fm.duration_hours} ${t.excursion.hoursAbbrev}`}
                />
              ) : null}
              {excursion.fm.difficulty ? (
                <FactRow
                  label={t.excursion.difficulty}
                  value={translateDifficulty(excursion.fm.difficulty, lang as Lang)}
                />
              ) : null}
              {excursion.fm.min_age ? (
                <FactRow
                  label={t.excursion.minAge}
                  value={`${excursion.fm.min_age}+`}
                />
              ) : null}
              {excursion.fm.schedule ? (
                <FactRow
                  label={t.excursion.schedule}
                  value={translateSchedule(excursion.fm.schedule, lang as Lang)}
                />
              ) : null}
              {excursion.fm.payment ? (
                <FactRow
                  label={t.excursion.payment}
                  value={translatePayment(excursion.fm.payment, lang as Lang)}
                />
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </article>
  );
}

function FactRow({
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
