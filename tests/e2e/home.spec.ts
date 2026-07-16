import { expect, test } from "@playwright/test";

test("presents the reviewed-catalog starting state", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kartboken/);
  await expect(page.getByRole("heading", { level: 1, name: /Hitta nästa omväg/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Första platserna är på väg" })).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Sök efter plats, ort eller typ" })).toBeVisible();
  await expect(page.getByText("Kartan är tom just nu, men anteckningsboken är öppen.")).toBeVisible();
});

