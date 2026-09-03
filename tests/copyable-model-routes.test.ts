import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("copyable model public routes", () => {
  it("makes concrete cases primary while keeping the model library available", async () => {
    const [page, organiserPage, organiserHub, organiserLibrary, navbar, footer, modelsIndex] = await Promise.all([
      readSource("src/app/(marketing)/modeles/page.tsx"),
      readSource("src/app/(marketing)/organiser/page.tsx"),
      readSource("src/components/OrganiserHub.tsx"),
      readSource("src/components/OrganiserLibrary.tsx"),
      readSource("src/components/PublicActionPlanNavigation.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/components/CopyableModelsIndex.tsx"),
    ]);

    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(page).not.toContain("OrganiserSectionNavigation");
    expect(page).toContain("<StructureNewsletterBlock />");
    expect(page).not.toContain("<ModelProcessesBridge />");
    expect(organiserPage).not.toContain("OrganiserSectionNavigation");
    expect(organiserPage).toContain("<OrganiserHub />");
    expect(page).toContain('path: "/modeles"');
    expect(navbar).toContain('label: "Organisation"');
    expect(navbar).toContain('href: "/organiser"');
    expect(organiserHub).toContain("getPublishedCopyableModels");
    expect(organiserHub).toContain("<OrganiserLibrary");
    expect(organiserHub).not.toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(organiserLibrary).toContain("<CopyableModelCard");
    expect(organiserLibrary).toContain("Modèles prêts à copier");
    expect(organiserLibrary).toContain("Voir tous les modèles");
    expect(organiserLibrary).toContain('href="/modeles?from=organisation"');
    expect(page).toContain('fromOrganisation={source === "organisation"}');
    expect(modelsIndex).toContain('href="/organiser#cas-concrets"');
    expect(modelsIndex).toContain("Retour à Organisation");
    expect(modelsIndex).toContain("`/modeles/${model.slug}?from=organisation`");
    expect(footer).toContain('{ label: "Modèles à copier", href: "/modeles" }');
    expect(footer).toContain('{ label: "Organisation", href: "/organiser" }');
    expect(footer).toContain('{ label: "Cas concrets et processus", href: "/organiser#cas-concrets" }');
    expect(modelsIndex).toContain('style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}');
    expect(modelsIndex).toContain("block text-brand-blue/62");
    expect(modelsIndex).toContain("demaa-hero-title block text-dema-forest");
    expect(modelsIndex).toContain("text-base leading-7 text-dema-muted md:text-lg");
    expect(modelsIndex).toContain("Des structures simples, déjà pensées pour suivre un flux de travail précis.");
    expect(modelsIndex).toContain('title: "Les fondamentaux"');
    expect(modelsIndex).toContain('title: "La réalisation du travail"');
    expect(modelsIndex).toContain('title: "Le développement de l’entreprise"');
    expect(modelsIndex).toContain("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3");
    expect(modelsIndex).not.toContain("SOLUTION_RAIL_CLASS_NAME");
    expect(modelsIndex).toContain("titleLevel={3}");
    expect(modelsIndex).not.toContain("Des processus concrets pour se projeter vraiment");
    expect(organiserLibrary).toContain('id="cas-concrets"');
    expect(organiserLibrary).toContain('aria-labelledby="organiser-models-heading"');
    expect(organiserLibrary).toContain("OrganiserProcessMap");
    expect(organiserLibrary).not.toContain(".slice(0, 5)");
  });

  it("supports a full detail page and an intercepted modal with the same content", async () => {
    const [page, modal, details, copyLink, preview, driveCreator, dialog] = await Promise.all([
      readSource("src/app/(marketing)/modeles/[slug]/page.tsx"),
      readSource("src/app/@modal/(.)modeles/[slug]/page.tsx"),
      readSource("src/components/CopyableModelDetails.tsx"),
      readSource("src/components/CopyableModelCopyLink.tsx"),
      readSource("src/components/DocumentModelPreview.tsx"),
      readSource("src/components/DriveFolderTemplateCreator.tsx"),
      readSource("src/components/CopyableModelRouteDialog.tsx"),
    ]);

    expect(page).toContain('source === "organisation"');
    expect(page).toContain('{ href: "/modeles?from=organisation", label: "Retour aux modèles" }');
    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(modal).toContain('<CopyableModelDetails model={model} variant="modal" />');
    expect(page).toContain("export const dynamicParams = false");
    expect(modal).toContain("export const dynamicParams = false");
    expect(dialog).toContain("router.back()");
    expect(details).toContain("CopyableModelCopyLink");
    expect(details).toContain("DriveFolderTreePreview");
    expect(details).toContain("DriveFolderTemplateCreator");
    expect(driveCreator).toContain("Créer automatiquement dans mon Drive");
    expect(driveCreator).toContain("Copier la liste des dossiers");
    expect(driveCreator).toContain("aucun dossier n’est créé");
    expect(driveCreator).toContain('type="hidden" name="sectionIds"');
    expect(driveCreator).not.toContain("Domaines à créer");
    expect(copyLink).toContain("Copier gratuitement");
    expect(copyLink).toContain("demaa-secondary-button");
    expect(copyLink).toContain("w-full");
    expect(copyLink).toContain('rel="noopener noreferrer"');
    expect(preview).toContain("getAirtableEmbedUrl");
    expect(preview).toContain("<iframe");
    expect(preview).toContain("Ouvrir dans Airtable");
    expect(preview).toContain("Explorer la base");
    expect(details).toContain('const Heading = variant === "modal" ? "h2" : "h1"');
    expect(details).toContain('variant === "page" && backLink');
    expect(details).toContain('href={backLink.href}');
    expect(details).not.toContain('<Link href="/modeles"');
    expect(details).toContain("MentoratAutomationCta");
    expect(details).toContain('variant="modele"');
    expect(details).not.toContain("Faire adapter ce modèle");
    expect(details).not.toContain("550 € HT / jour");
    expect(details).toContain("model.relatedOrganiserSlug");
    expect(details).not.toContain("Le flux couvert");
    expect(details).not.toContain("Structure incluse");
    expect(details).not.toContain("Modèle gratuit · Copie dans votre propre espace");
  });

  it("keeps the copy route guarded and destination-driven", async () => {
    const route = await readSource("src/app/api/modeles/[slug]/copier/route.ts");

    expect(route).toContain("enforceAllowedHost(request)");
    expect(route).toContain("enforceRateLimit(request");
    expect(route).toContain("getCopyableModelDestination(slug)");
    expect(route).toContain("NextResponse.redirect(destination");
    expect(route).not.toContain("airtable.com/");
  });

  it("keeps the generated Drive flow scoped, signed and free of stored Google tokens", async () => {
    const [authorizeRoute, callbackRoute, driveServer] = await Promise.all([
      readSource("src/app/api/modeles/structure-google-drive-entreprise/drive/authorize/route.ts"),
      readSource("src/app/api/modeles/structure-google-drive-entreprise/drive/callback/route.ts"),
      readSource("src/lib/google-drive-template.server.ts"),
    ]);

    expect(authorizeRoute).toContain("enforceSameOrigin(request)");
    expect(authorizeRoute).toContain("enforceRateLimit(request");
    expect(callbackRoute).toContain("matchesGoogleDriveTemplateNonce");
    expect(callbackRoute).toContain("createGoogleDriveFolderStructure");
    expect(driveServer).toContain("https://www.googleapis.com/auth/drive.file");
    expect(driveServer).toContain('access_type: "online"');
    expect(driveServer).not.toContain("refresh_token");
  });
});
