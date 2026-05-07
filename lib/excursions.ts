import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { LANGS as _LANGS, DEFAULT_LANG as _DEFAULT, type Lang as _Lang } from "./i18n";

export type Lang = _Lang;
export const LANGS = _LANGS;
export const DEFAULT_LANG = _DEFAULT;

export type OptionalAddon = { name: string; price_ars: number };

export type ExcursionFrontmatter = {
  title: string;
  slug: string;
  price_ars: number;
  payment?: string;
  promo?: string;
  includes: string[];
  excludes: string[];
  duration_hours?: number | null;
  duration_days?: string;
  distance_km?: string;
  difficulty?: string;
  min_age?: number | null;
  schedule?: string;
  departure_point?: string;
  package?: boolean;
  combines?: string[];
  optional?: OptionalAddon[];
  platforms?: number;
  total_zipline_meters?: number;
  sources?: string[];
};

export type Excursion = {
  fm: ExcursionFrontmatter;
  body: string;
  byLang: Record<Lang, string>;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

function splitByLang(body: string): Record<Lang, string> {
  const result: Record<Lang, string> = { es: "", en: "", "pt-br": "" };
  const headerRe = /^##\s+(es|en|pt-br)\s*$/gim;
  const matches = [...body.matchAll(headerRe)].map((m) => ({
    lang: m[1].toLowerCase() as Lang,
    start: m.index ?? 0,
    bodyStart: (m.index ?? 0) + m[0].length,
  }));
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const end = next ? next.start : body.length;
    result[cur.lang] = body.slice(cur.bodyStart, end).trim();
  }
  return result;
}

export function getExcursion(slug: string): Excursion | null {
  try {
    const raw = readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf-8");
    const parsed = matter(raw);
    return {
      fm: parsed.data as ExcursionFrontmatter,
      body: parsed.content,
      byLang: splitByLang(parsed.content),
    };
  } catch {
    return null;
  }
}

export function getAllSlugs(): string[] {
  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

const ORDER = [
  "circuito-chico",
  "cerro-tronador-ventisquero-negro",
  "san-martin-7-lagos",
  "circuito-grande",
  "bolson-lago-puelo",
  "isla-victoria-arrayanes",
  "puerto-blest-cantaros",
  "rafting-rio-limay",
  "kayak-lago-moreno",
  "cabalgata-bosque",
  "buceo-bautismo",
  "canopy",
  "traslados",
  "paquete-tronador-sma-circuito-chico",
];

export function getAllExcursions(): Excursion[] {
  const slugs = getAllSlugs();
  const ordered = [
    ...ORDER.filter((s) => slugs.includes(s)),
    ...slugs.filter((s) => !ORDER.includes(s)),
  ];
  return ordered
    .map((s) => getExcursion(s))
    .filter((e): e is Excursion => e !== null);
}

export function formatPrice(ars: number): string {
  return new Intl.NumberFormat("es-AR").format(ars);
}

function stripMd(s: string): string {
  return s
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractCardSummary(langBody: string, maxLen = 200): string {
  const descMatch = langBody.match(
    /###\s+(Descripción|Description|Descrição|Descricao)([\s\S]*?)(?=\n###\s|$)/i,
  );
  if (descMatch) {
    const block = descMatch[2].trim();
    const firstPara = block.split(/\n\s*\n/)[0] ?? "";
    const cleaned = stripMd(firstPara);
    if (cleaned.length > maxLen) {
      const cut = cleaned.slice(0, maxLen);
      const last = cut.lastIndexOf(" ");
      return (last > 100 ? cut.slice(0, last) : cut) + "…";
    }
    return cleaned;
  }
  return "";
}

export function extractTagline(langBody: string): string {
  return extractCardSummary(langBody);
}
