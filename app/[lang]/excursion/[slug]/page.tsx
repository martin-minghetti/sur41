import { notFound } from "next/navigation";
import { ExcursionDetail } from "@/components/ExcursionDetail";
import {
  getAllSlugs,
  getExcursion,
  LANGS,
  type Lang,
} from "@/lib/excursions";
import type { Metadata } from "next";

export const dynamic = "force-static";

export function generateStaticParams() {
  const slugs = getAllSlugs();
  return LANGS.flatMap((lang) =>
    slugs.map((slug) => ({ lang, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ex = getExcursion(slug);
  if (!ex) return { title: "Sur41" };
  return {
    title: `${ex.fm.title} · Sur41`,
    description: `Excursión en Bariloche · AR$ ${ex.fm.price_ars.toLocaleString("es-AR")}`,
  };
}

export default async function ExcursionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  const excursion = getExcursion(slug);
  if (!excursion) notFound();
  return <ExcursionDetail excursion={excursion} lang={lang as Lang} />;
}
