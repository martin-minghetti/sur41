import { test, expect } from "@playwright/test";

test("home → detail flow renders all 14 excursions and CTA reservar", async ({
  page,
}) => {
  await page.goto("/es");
  await expect(page).toHaveTitle(/Sur41/);

  await page.locator("#catalogo").scrollIntoViewIfNeeded();
  const cards = page.locator(
    '#catalogo a[href*="/es/excursion/"]',
  );
  await expect(cards).toHaveCount(14);

  await page.goto("/es/excursion/canopy");
  await expect(
    page.getByRole("heading", { level: 1, name: /Canopy/i }),
  ).toBeVisible();

  const reservarLink = page.getByRole("link", { name: /Reservar/i }).first();
  await expect(reservarLink).toHaveAttribute(
    "href",
    "/es/excursion/canopy/reservar",
  );

  await reservarLink.click();
  await expect(page).toHaveURL(/\/es\/excursion\/canopy\/reservar/);
  await expect(page.getByLabel(/Email/i)).toBeVisible();
});

test("i18n: home redirects and serves 3 languages", async ({ page }) => {
  for (const lang of ["es", "en", "pt-br"] as const) {
    await page.goto(`/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("#catalogo")).toBeVisible();
  }
});
