import type { Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

export function Footer({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  return (
    <footer
      id="contacto"
      className="border-t border-hairline mt-24 bg-bg"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[15px] tracking-[0.18em] uppercase font-semibold">
              SUR
            </span>
            <span className="font-mono text-[15px] tracking-[0.18em] text-accent-strong tabular-nums font-semibold">
              41
            </span>
          </div>
          <p className="mt-3 text-sm text-muted max-w-sm">{t.footer.tagline}</p>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow mb-2">Bariloche · Río Negro · AR</p>
          <p className="text-sm text-fg">{t.footer.address}</p>
          <p className="text-sm text-muted mt-1 dp">41°08′32″S 71°18′37″O</p>
        </div>
        <div className="md:col-span-3 flex md:justify-end items-end">
          <a
            href="mailto:reservas@sur41.example"
            className="text-sm border border-fg px-4 py-2 hover:bg-fg hover:text-bg transition-colors"
          >
            {t.footer.contactCta}
          </a>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-4 flex justify-between items-center">
          <p className="text-xs text-muted dp">{t.footer.year}</p>
          <p className="text-xs text-muted dp">v0.1 · BUILD 2026.05.06</p>
        </div>
      </div>
    </footer>
  );
}
