import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("copyable model public routes", () => {
  it("groups models and concrete processes under the Organiser universe", async () => {
    const [page, organiserPage, navbar, sectionNavigation, footer] = await Promise.all([
      readSource("src/app/(marketing)/modeles/page.tsx"),
      readSource("src/app/(marketing)/organiser/page.tsx"),
      readSource("src/components/PublicActionPlanNavigation.tsx"),
      readSource("src/components/OrganiserSectionNavigation.tsx"),
      readSource("src/components/Footer.tsx"),
    ]);

    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(page).toContain('<OrganiserSectionNavigation activeSection="models" />');
    expect(page).toContain("<StructureNewsletterBlock />");
    expect(organiserPage).toContain('<OrganiserSectionNavigation activeSection="processes" />');
    expect(page).toContain('path: "/modeles"');
    expect(navbar).toContain('label: "Organiser"');
    expect(navbar).toContain('href: "/modeles"');
    expect(sectionNavigation).toContain('label: "Modèles à copier"');
    expect(sectionNavigation).toContain('label: "Processus & cas concrets"');
    expect(sectionNavigation).toContain('aria-label="Rubriques Organiser"');
    expect(sectionNavigation).toContain("demaa-search-shell");
    expect(sectionNavigation).toContain("grid-cols-2 gap-1 p-1.5");
    expect(sectionNavigation).toContain("min-h-12");
    expect(sectionNavigation).toContain('activeSection === id');
    expect(footer).toContain('{ label: "Modèles à copier", href: "/modeles" }');
    expect(footer).toContain('{ label: "Processus & cas concrets", href: "/organiser" }');
  });

  it("supports a full detail page and an intercepted modal with the same content", async () => {
    const [page, modal, details, copyLink, preview, dialog] = await Promise.all([
      readSource("src/app/(marketing)/modeles/[slug]/page.tsx"),
      readSource("src/app/@modal/(.)modeles/[slug]/page.tsx"),
      readSource("src/components/CopyableModelDetails.tsx"),
      readSource("src/components/CopyableModelCopyLink.tsx"),
      readSource("src/components/DocumentModelPreview.tsx"),
      readSource("src/components/CopyableModelRouteDialog.tsx"),
    ]);

    expect(page).toContain("<CopyableModelDetails model={model} />");
    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(modal).toContain('<CopyableModelDetails model={model} variant="modal" />');
    expect(page).toContain("export const dynamicParams = false");
    expect(modal).toContain("export const dynamicParams = false");
    expect(dialog).toContain("router.back()");
    expect(details).toContain("CopyableModelCopyLink");
    expect(copyLink).toContain("Copier gratuitement");
    expect(copyLink).toContain('rel="noopener noreferrer"');
    expect(preview).toContain("getAirtableEmbedUrl");
    expect(preview).toContain("<iframe");
    expect(preview).toContain("Ouvrir dans Airtable");
    expect(preview).toContain("Explorer la base");
    expect(details).toContain('const Heading = variant === "modal" ? "h2" : "h1"');
    expect(details).toContain("Faire adapter ce modèle");
    expect(details).toContain("550 € HT / jour");
    expect(details).toContain("model.relatedOrganiserSlug");
  });

  it("keeps the copy route guarded and destination-driven", async () => {
    const route = await readSource("src/app/api/modeles/[slug]/copier/route.ts");

    expect(route).toContain("enforceAllowedHost(request)");
    expect(route).toContain("enforceRateLimit(request");
    expect(route).toContain("getCopyableModelDestination(slug)");
    expect(route).toContain("NextResponse.redirect(destination");
    expect(route).not.toContain("airtable.com/");
  });
});
