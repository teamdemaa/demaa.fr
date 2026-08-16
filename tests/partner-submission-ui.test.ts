import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function readSource(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("solution proposal UI contract", () => {
  it("exposes one neutral public entry without promising a partnership", async () => {
    const [footer, page, nextConfig, sitemap] = await Promise.all([
      readSource("src/components/Footer.tsx"),
      readSource("src/app/(marketing)/rejoindre-team-demaa/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(footer).toContain('{ label: "Rejoindre Team Demaa", href: "/rejoindre-team-demaa" }');
    expect(page).toContain(
      'redirect("/opportunites?intent=team-demaa-profile")',
    );
    expect(page).not.toMatch(/partenaire Demaa|devenir partenaire|partenariat garanti/i);
    await expect(
      access(path.join(root, "src/app/rejoindre-le-reseau/page.tsx")),
    ).rejects.toThrow();
    await expect(
      access(path.join(root, "src/app/partenaires/page.tsx")),
    ).rejects.toThrow();
    expect(nextConfig).toContain("source: '/rejoindre-le-reseau'");
    expect(nextConfig).toContain("source: '/partenaires'");
    expect(nextConfig.match(/destination: '\/rejoindre-team-demaa'/g)).toHaveLength(2);
    expect(sitemap).toContain("`${base}/rejoindre-team-demaa`");
    expect(sitemap).not.toContain("`${base}/rejoindre-le-reseau`");
  });

  it("uses one shared short form without asking candidates to choose systems", async () => {
    const [form, googleSignIn, route] = await Promise.all([
      readSource("src/components/ProviderProfileModal.tsx"),
      readSource("src/components/GoogleCustomerSignInButton.tsx"),
      readSource("src/app/api/provider-profile-submission/route.ts"),
    ]);

    expect(form).toContain("Expertise principale");
    expect(form).toContain("Choisir une expertise");
    expect(form).toContain("<select");
    expect(form).toContain("useAccessibleDialog({ onClose })");
    expect(form).toContain("data-dialog-initial-focus");
    expect(form).toContain("Pays ou zones couverts");
    expect(form).not.toContain("selectedSystemSlugs");
    expect(form).not.toContain(
      "Entrez votre adresse e-mail pour recevoir un lien sécurisé et continuer dans l’application.",
    );
    expect(googleSignIn).toContain("Continuer avec Google");
    expect(googleSignIn).toContain("exchangeFirebaseIdTokenForSession");
    expect(googleSignIn).not.toContain("/api/customer-space/firebase-session");
    expect(googleSignIn).toContain("if (onAuthenticated)");
    expect(googleSignIn).toContain("text-dema-forest");
    expect(googleSignIn).not.toContain("#4285f4");
    expect(route).toContain('channels: { email: false, resend: false, slack: true }');
    expect(form).toContain('role="alert"');
    expect(form).toContain('aria-live="polite"');
  });

  it("loads Firebase-backed pages at request time", async () => {
    const [networkPage, opportunitiesPage, adminPage] = await Promise.all([
      readSource("src/app/(marketing)/rejoindre-team-demaa/page.tsx"),
      readSource("src/app/(marketing)/opportunites/page.tsx"),
      readSource("src/app/(administration)/admin/opportunites/page.tsx"),
    ]);

    expect(networkPage).toContain(
      'redirect("/opportunites?intent=team-demaa-profile")',
    );
    for (const source of [opportunitiesPage, adminPage]) {
      expect(source).toContain('import { connection } from "next/server"');
      expect(source).toContain("await connection()");
    }
    expect(networkPage).not.toContain('import { connection } from "next/server"');
  });

  it("separates immediate opportunities from the permanent Team Demaa profile", async () => {
    const [page, catalog, modal, submissionDialog] = await Promise.all([
      readSource("src/app/(marketing)/opportunites/page.tsx"),
      readSource("src/components/PublicOpportunitiesClient.tsx"),
      readSource("src/components/ProviderProfileModal.tsx"),
      readSource("src/components/OpportunitySubmissionDialog.tsx"),
    ]);

    expect(page).toContain("Découvrez les opportunités actuellement disponibles.");
    expect(catalog).not.toContain("Voir l’opportunité");
    expect(catalog).toContain("OpportunityDetailsDialog");
    expect(catalog).toContain("Intéressé(e)");
    expect(catalog).toContain("Modalité");
    expect(catalog).toContain("Rythme / durée");
    expect(catalog).toContain("Ce qui est attendu");
    expect(catalog).toContain("<AppLibrarySearch");
    expect(catalog).toContain("ALL_OPPORTUNITY_CATEGORIES");
    expect(catalog).toContain('aria-label={`Ouvrir l’opportunité : ${opportunity.title}`}');
    expect(catalog).toContain('role="dialog"');
    expect(catalog).toContain("setApplicationOpportunity(selected)");
    expect(catalog).toContain("setLocalSelected(null)");
    expect(catalog).toContain("onApply={openApplication}");
    expect(catalog).toContain("opportunity={applicationOpportunity}");
    expect(catalog.indexOf("OpportunityDetailsDialog")).toBeLessThan(
      catalog.indexOf("<ProviderProfileModal"),
    );
    expect(catalog).toContain("Rejoindre Team Demaa");
    expect(catalog).toContain('md:inline">Soumettre</span>');
    expect(catalog).toContain("setProfileOpen(true)");
    expect(catalog).toContain("profileOpen ? (");
    expect(modal).toContain("Manifester mon intérêt");
    expect(modal).toContain("initialEmail");
    expect(modal).toContain("Expertise principale");
    expect(page).toContain("getPublicOpenOpportunities()");
    expect(page).toContain("preserveOpportunityEnrichment(opportunities)");
    expect(submissionDialog).toContain("Ajouter des précisions");
    expect(submissionDialog).toContain("<details");
    expect(submissionDialog).toContain('Connexion demandée à l’envoi.');
    expect(submissionDialog).not.toContain("Envoyer pour modération");
    expect(submissionDialog).not.toContain("Vous pourrez tout remplir maintenant");
    expect([page, catalog, modal].join("\n")).not.toMatch(
      /freelance|Demaa recruteur/i,
    );
  });

  it("keeps every optional opportunity detail manageable from the admin", async () => {
    const [admin, route] = await Promise.all([
      readSource("src/components/OpportunityAdminClient.tsx"),
      readSource("src/app/api/admin/opportunities/route.ts"),
    ]);

    for (const field of [
      "workMode",
      "geography",
      "cadence",
      "startTiming",
      "expectations",
      "compensation",
      "companyName",
    ]) {
      expect(admin).toContain(`name="${field}"`);
      expect(route).toContain(field);
    }
    expect(admin).toContain("Modifier l’opportunité");
    expect(admin).toContain("Enregistrer les modifications");
    expect(route).toContain("updateOpportunity");
  });
});
