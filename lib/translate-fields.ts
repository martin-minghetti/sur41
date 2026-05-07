import type { Lang } from "./i18n";

const DIFFICULTY: Record<string, Record<Lang, string>> = {
  baja: {
    es: "Baja",
    en: "Low",
    "pt-br": "Baixa",
  },
  "baja a media": {
    es: "Baja a media",
    en: "Low to medium",
    "pt-br": "Baixa a media",
  },
  "media a alta": {
    es: "Media a alta",
    en: "Medium to high",
    "pt-br": "Media a alta",
  },
  media: { es: "Media", en: "Medium", "pt-br": "Media" },
  alta: { es: "Alta", en: "High", "pt-br": "Alta" },
  "baja a media (subida a lago de los cántaros)": {
    es: "Baja a media (subida al Lago de los Cántaros)",
    en: "Low to medium (climb to Lago de los Cántaros)",
    "pt-br": "Baixa a media (subida ao Lago de los Cantaros)",
  },
};

const PAYMENT: Record<string, Record<Lang, string>> = {
  "efectivo o transferencia": {
    es: "Efectivo o transferencia",
    en: "Cash or bank transfer",
    "pt-br": "Dinheiro ou transferencia",
  },
};

const SCHEDULE_PATTERNS: Array<{
  match: RegExp;
  out: Record<Lang, string>;
}> = [
  {
    match: /^martes,?\s*jueves\s*y\s*s[áa]bados$/i,
    out: {
      es: "Martes, jueves y sábados",
      en: "Tuesdays, Thursdays and Saturdays",
      "pt-br": "Tercas, quintas e sabados",
    },
  },
  {
    match: /consultar/i,
    out: {
      es: "Consultar días y horarios",
      en: "Ask us for dates and times",
      "pt-br": "Consultar dias e horarios",
    },
  },
];

function lookup(
  table: Record<string, Record<Lang, string>>,
  raw: string,
  lang: Lang,
): string {
  const key = raw.trim().toLowerCase();
  return table[key]?.[lang] ?? raw;
}

export function translateDifficulty(raw: string, lang: Lang): string {
  return lookup(DIFFICULTY, raw, lang);
}

export function translatePayment(raw: string, lang: Lang): string {
  return lookup(PAYMENT, raw, lang);
}

export function translateSchedule(raw: string, lang: Lang): string {
  for (const p of SCHEDULE_PATTERNS) {
    if (p.match.test(raw.trim())) return p.out[lang];
  }
  return raw;
}
