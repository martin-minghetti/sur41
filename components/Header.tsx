import Link from "next/link";
import type { Lang } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";
import { LangSwitcher } from "./LangSwitcher";

export function Header({ lang }: { lang: Lang }) {
  const t = getDictionary(lang);
  return (
    <header className="border-b border-hairline bg-bg/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link
          href={`/${lang}`}
          className="flex items-baseline gap-2 group"
          aria-label="Sur41 home"
        >
          <span className="font-mono text-[15px] tracking-[0.18em] uppercase font-semibold text-fg">
            SUR
          </span>
          <span className="font-mono text-[15px] tracking-[0.18em] text-accent-strong tabular-nums font-semibold">
            41
          </span>
          <span className="hidden md:inline-block ml-3 eyebrow text-muted">
            41°08′S · 71°18′O
          </span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href={`/${lang}#catalogo`}
            className="hidden sm:inline font-mono text-[11px] tracking-[0.16em] uppercase text-fg hover:text-accent-strong transition-colors"
          >
            {t.nav.excursions}
          </Link>
          <a
            href="#contacto"
            className="hidden sm:inline font-mono text-[11px] tracking-[0.16em] uppercase text-fg hover:text-accent-strong transition-colors"
          >
            {t.nav.contact}
          </a>

          <span className="hidden sm:inline w-px h-3 bg-hairline" />

          <LangSwitcher current={lang} />
        </nav>
      </div>
    </header>
  );
}
