import { expect, test } from "@playwright/test";

test.describe("assistant success flow", () => {
  test("shows an error when the session_id is missing", async ({ page }) => {
    await page.goto("/assistant/success");

    await page.waitForFunction(() =>
      document.body.innerText.includes("Vérification impossible")
    );
    await expect(page.getByRole("heading", { name: "Vérification impossible" })).toBeVisible();
    await expect(
      page.getByText(
        "Impossible de vérifier votre paiement. Merci d'utiliser le lien de retour Stripe."
      )
    ).toBeVisible();
  });

  test("shows the verification error when Stripe lookup fails", async ({ page }) => {
    await page.route("**/api/stripe/checkout-session**", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Le paiement n'a pas pu être vérifié. Merci de contacter Demaa.",
        }),
      });
    });

    await page.goto("/assistant/success?session_id=cs_test_123");

    await page.waitForFunction(() =>
      document.body.innerText.includes("Vérification impossible")
    );
    await expect(page.getByRole("heading", { name: "Vérification impossible" })).toBeVisible();
  });

  test("submits delegated tasks after payment verification", async ({ page }) => {
    await page.route("**/api/stripe/checkout-session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          paid: true,
          cartSummary: "Credits assistant x 5",
          credits: 5,
          offerLabel: "Credits assistant",
        }),
      });
    });

    await page.route("**/api/assistant/delegation-request", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          sent: true,
        }),
      });
    });

    await page.goto("/assistant/success?session_id=cs_test_123");

    await page.waitForFunction(() =>
      document.body.innerText.includes("Paiement confirmé")
    );
    await expect(page.getByRole("heading", { name: "Paiement confirmé" })).toBeVisible();
    await expect(page.getByText("Dernière étape")).toBeVisible();

    await page.getByLabel("Prénom").fill("Jean");
    await page.getByRole("textbox", { name: "Nom", exact: true }).fill("Client");
    await page.getByLabel("WhatsApp pour vous contacter").fill("+33600000000");
    await page
      .getByPlaceholder(
        "Détaillez ce que vous voulez déléguer : contexte, documents, échéance, outils utilisés..."
      )
      .fill("Deleguer l'administratif et le suivi client.");

    await page.getByRole("button", { name: "Envoyer" }).click();

    await expect(page.getByRole("heading", { name: "Demande envoyée." })).toBeVisible();
    await expect(
      page.getByText("On revient vers vous sous 24h sur WhatsApp pour organiser la suite.")
    ).toBeVisible();
  });
});
