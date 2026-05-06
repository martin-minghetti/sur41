import type { Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export function Hero({ lang, count }: { lang: Lang; count: number }) {
  const t = getDictionary(lang);
  return (
    <section className="border-b border-hairline bg-bg">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-8">
            <p className="eyebrow mb-6">{t.home.eyebrow}</p>
            <h1 className="display text-[42px] md:text-[68px] lg:text-[80px] text-fg leading-[1.02]">
              {t.home.heroH1}
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-muted max-w-2xl">
              {t.home.heroSub}
            </p>
          </div>
          <aside className="md:col-span-4 md:border-l md:border-hairline md:pl-8 flex flex-col gap-6 md:pt-2">
            <DataRow label="LAT" value="41°08′32″S" />
            <DataRow label="ALT" value="893 M" />
            <DataRow
              label="EXCURSIONES"
              value={String(count).padStart(2, "0")}
            />
            <DataRow label="MONEDA" value="ARS" />
            <DataRow label="TEMP. PROM." value="11.5 °C" />
          </aside>
        </div>
      </div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-hairline pt-3">
      <span className="eyebrow">{label}</span>
      <span className="dp text-sm text-fg">{value}</span>
    </div>
  );
}
