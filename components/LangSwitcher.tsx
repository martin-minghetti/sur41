"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export function LangSwitcher({ current }: { current: Lang }) {
  const pathname = usePathname() ?? `/${current}`;
  const segments = pathname.split("/").filter(Boolean);
  const tail =
    LANGS.includes(segments[0] as Lang)
      ? "/" + segments.slice(1).join("/")
      : pathname;

  return (
    <ul className="flex items-center gap-1 font-mono text-[11px] tracking-[0.16em] uppercase">
      {LANGS.map((l) => {
        const href = `/${l}${tail === "/" ? "" : tail}`;
        const active = l === current;
        return (
          <li key={l}>
            <Link
              href={href}
              className={`px-2 py-1 transition-colors ${
                active
                  ? "text-fg border-b border-fg"
                  : "text-muted hover:text-fg"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {l}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
