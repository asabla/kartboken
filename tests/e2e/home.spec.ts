import { expect, test } from "@playwright/test";

test("browses, filters, and links to a reviewed place", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kartboken/);
  await expect(page.getByRole("heading", { level: 1, name: /Hitta nästa omväg/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "5 handplockade platser" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Karta över rekommenderade platser" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Sök efter plats, ort eller typ" });
  await search.fill("sichuan");

  await expect(page.getByRole("heading", { level: 3, name: "Golden Crown" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Lilla Napoli" })).toBeHidden();
  await expect(page.getByRole("link", { name: "Reddit-rekommendation" })).toHaveAttribute(
    "href",
    /reddit\.com/,
  );
  await expect(page).toHaveURL(/q=sichuan/);

  await page.getByRole("button", { name: "Rensa" }).click();
  await page.getByLabel("Typ av plats").selectOption("cafe");
  await expect(page.getByRole("heading", { level: 3, name: "Solhaga Stenugnsbageri" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Holy Smoke BBQ" })).toBeHidden();

  await page.getByRole("button", { name: "Solhaga Stenugnsbageri" }).click();
  await expect(page).toHaveURL(/category=cafe.*place=solhaga-stenugnsbageri/);
});

test("restores shared filter state from the URL", async ({ page }) => {
  await page.goto("/?journey=journey&place=lilla-napoli");

  await expect(page.getByLabel("Värd resan")).toHaveValue("journey");
  await expect(page.getByRole("button", { name: "Lilla Napoli" })).toBeVisible();
  await expect(page.locator("#place-lilla-napoli article")).toHaveClass(/place-selected/);
});
