import { expect, test } from "@playwright/test";

test.describe("member space access", () => {
  test("shows the expired-link banner when the page is opened with the error query", async ({ page }) => {
    await page.goto("/mon-espace?error=lien-expire");

    await expect(page.getByText("Le lien n'est plus valide. Demandez un nouveau lien.")).toBeVisible();
  });

  test("shows client-side validation for invalid emails", async ({ page }) => {
    await page.goto("/mon-espace");

    await page.locator("form").evaluate((form) => {
      form.setAttribute("novalidate", "novalidate");
    });
    await page.locator("#customer-email").fill("bad-email");
    await page.getByRole("button", { name: "Recevoir mon lien sécurisé" }).click();

    await expect(page.getByText("Merci d'indiquer une adresse email valide.")).toBeVisible();
  });

  test("shows a success state when the magic link request succeeds", async ({ page }) => {
    await page.route("**/api/customer-space/magic-link", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sent: true,
          devLink: "http://127.0.0.1:3000/api/customer-space/consume?token=test-token",
        }),
      });
    });

    await page.goto("/mon-espace");
    await page.locator("#customer-email").fill("client@demaa.fr");
    await page.getByRole("button", { name: "Recevoir mon lien sécurisé" }).click();

    await expect(page.getByRole("heading", { name: "Lien envoyé." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ouvrir le lien de test" })).toBeVisible();
  });

  test("shows the API error when the magic link request fails", async ({ page }) => {
    await page.route("**/api/customer-space/magic-link", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error:
            "Impossible d'envoyer le lien pour le moment. Merci de réessayer dans quelques minutes.",
          sent: false,
        }),
      });
    });

    await page.goto("/mon-espace");
    await page.locator("#customer-email").fill("client@demaa.fr");
    await page.getByRole("button", { name: "Recevoir mon lien sécurisé" }).click();

    await expect(
      page.getByText(
        "Impossible d'envoyer le lien pour le moment. Merci de réessayer dans quelques minutes."
      )
    ).toBeVisible();
  });
});
