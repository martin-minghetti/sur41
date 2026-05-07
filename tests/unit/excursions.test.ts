import { describe, it, expect } from "vitest";
import {
  formatPrice,
  extractCardSummary,
  getAllSlugs,
  getExcursion,
} from "@/lib/excursions";

describe("formatPrice", () => {
  it("formats with es-AR thousands separator", () => {
    expect(formatPrice(49500)).toBe("49.500");
    expect(formatPrice(1)).toBe("1");
    expect(formatPrice(1000000)).toBe("1.000.000");
  });
});

describe("extractCardSummary", () => {
  it("strips bold and links from first paragraph of Descripción", () => {
    const body = `### Hero\n\n**Title**: foo\n\n### Descripción\n\n**Bosque** lleno de coihues con [link](http://x). Otro párrafo.`;
    const out = extractCardSummary(body, 200);
    expect(out).not.toContain("**");
    expect(out).not.toContain("[");
    expect(out).toContain("Bosque lleno");
  });

  it("returns empty string when no Descripción heading present", () => {
    expect(extractCardSummary("### Hero\nNothing else", 100)).toBe("");
  });

  it("truncates with ellipsis past maxLen", () => {
    const longPara = "lorem ipsum ".repeat(30);
    const body = `### Descripción\n\n${longPara}`;
    const out = extractCardSummary(body, 80);
    expect(out.length).toBeLessThanOrEqual(82);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("content corpus", () => {
  it("loads all 14 excursion files", () => {
    const slugs = getAllSlugs();
    expect(slugs.length).toBe(14);
  });

  it("each excursion has valid frontmatter (title, slug, price_ars)", () => {
    for (const slug of getAllSlugs()) {
      const ex = getExcursion(slug);
      expect(ex).not.toBeNull();
      if (!ex) continue;
      expect(ex.fm.title.length).toBeGreaterThan(2);
      expect(ex.fm.slug).toBe(slug);
      expect(typeof ex.fm.price_ars).toBe("number");
      expect(ex.fm.price_ars).toBeGreaterThan(0);
    }
  });

  it("each excursion has content for all 3 languages", () => {
    for (const slug of getAllSlugs()) {
      const ex = getExcursion(slug);
      if (!ex) continue;
      expect(ex.byLang.es.length).toBeGreaterThan(100);
      expect(ex.byLang.en.length).toBeGreaterThan(100);
      expect(ex.byLang["pt-br"].length).toBeGreaterThan(100);
    }
  });
});
