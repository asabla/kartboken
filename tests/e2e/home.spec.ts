import { expect, test } from "@playwright/test";

test("searches the reviewed catalog and exposes provenance", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kartboken/);
  await expect(page.getByRole("heading", { level: 1, name: /Hitta nästa omväg/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "5 handplockade platser" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Sök efter plats, ort eller typ" });
  await search.fill("sichuan");

  await expect(page.getByRole("heading", { level: 3, name: "Golden Crown" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Lilla Napoli" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Reddit-rekommendation" })).toHaveAttribute(
    "href",
    /reddit\.com/,
  );
});

