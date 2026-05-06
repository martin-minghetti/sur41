import Link from "next/link";
import type { Lang } from "@/lib/excursions";
import { LANGS } from "@/lib/excursions";
import { getDictionary } from "@/lib/dictionaries";

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

        <nav className="flex items-center gap-6">
          <Link
            href={`/${lang}#catalogo`}
            className="hidden sm:inline text-sm text-fg hover:text-accent-strong transition-colors"
          >
            {t.nav.excursions}
          </Link>
          <a
            href="#contacto"
            className="hidden sm:inline text-sm text-fg hover:text-accent-strong transition-colors"
          >
            {t.nav.contact}
          </a>

          <ul className="flex items-center gap-1 font-mono text-[11px] tracking-[0.16em] uppercase">
            {LANGS.map((l) => (
              <li key={l}>
                <Link
                  href={`/${l}`}
                  className={`px-2 py-1 ${
                    l === lang
                      ? "text-fg border-b border-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
