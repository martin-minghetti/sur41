import { Hero } from "@/components/Hero";
import { ExcursionCard } from "@/components/ExcursionCard";
import { CustomTripCard } from "@/components/CustomTripCard";
import { getAllExcursions, type Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export const dynamic = "force-static";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang as Lang;
  const t = getDictionary(l);
  const excursions = getAllExcursions();

  return (
    <>
      <Hero lang={l} count={excursions.length} />

      <section id="catalogo" className="bg-bg">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-3">
            <div>
              <p className="eyebrow">{t.home.eyebrow.split("·")[0].trim()}</p>
              <h2 className="mt-2 display text-3xl md:text-4xl text-fg">
                {t.home.sectionTitle}
              </h2>
              <p className="mt-3 text-sm text-muted max-w-md">
                {t.home.sectionSub}
              </p>
            </div>
            <div className="dp text-xs text-muted">
              {String(excursions.length).padStart(2, "0")} / {String(excursions.length).padStart(2, "0")} ACTIVAS
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline border border-hairline">
            {excursions.map((ex, i) => (
              <ExcursionCard
                key={ex.fm.slug}
                excursion={ex}
                lang={l}
                index={i}
              />
            ))}
            <CustomTripCard lang={l} index={excursions.length} />
          </div>
        </div>
      </section>
    </>
  );
}
