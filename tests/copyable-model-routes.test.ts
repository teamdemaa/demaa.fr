import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("copyable model public routes", () => {
  it("gives Models its own resource catalogue without duplicating it in Outils", async () => {
    const [page, toolsPage, toolsHub, navbar, footer, modelsIndex, modelCard, platformBadge] = await Promise.all([
      readSource("src/app/(marketing)/modeles/page.tsx"),
      readSource("src/app/(marketing)/outils/page.tsx"),
      readSource("src/components/SystemsHubPage.tsx"),
      readSource("src/components/PublicActionPlanNavigation.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/components/CopyableModelsIndex.tsx"),
      readSource("src/components/CopyableModelCard.tsx"),
      readSource("src/components/ModelPlatformBadge.tsx"),
    ]);

    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(page).not.toContain("ResourcesNavigation");
    expect(page).not.toContain("OrganiserSectionNavigation");
    expect(page).not.toContain("StructureNewsletterBlock");
    expect(page).not.toContain("MentoratAutomationCta");
    expect(page).not.toContain("<ModelProcessesBridge />");
    expect(toolsPage).toContain("<SystemsHubPage enterprises={enterprises} />");
    expect(page).toContain('path: "/modeles"');
    expect(navbar).toContain('label: "Académie"');
    expect(navbar).toContain('href: "/academie"');
    expect(toolsHub).not.toContain("getPublishedCopyableModels");
    expect(toolsHub).not.toContain("ToolsModelsSection");
    expect(toolsHub).not.toContain("ResourcesNavigation");
    expect(page).toContain('fromOrganisation={source === "organisation"}');
    expect(modelsIndex).toContain('href="/academie#guides"');
    expect(modelsIndex).toContain("Retour à l’Academy");
    expect(modelsIndex).toContain("`/modeles/${model.slug}?from=tutoriels`");
    expect(footer).toContain('{ label: "Modèles associés", href: "/modeles" }');
    expect(footer).toContain('{ label: "Guides pratiques", href: "/academie#guides" }');
    expect(modelsIndex).toContain('style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}');
    expect(modelsIndex).toContain("block text-brand-blue/62");
    expect(modelsIndex).toContain("demaa-hero-title block text-dema-forest");
    expect(modelsIndex).toContain('className="demaa-search-control demaa-search-control-plain"');
    expect(modelsIndex).toContain('className="demaa-search-shell mx-auto mt-10 max-w-xl"');
    expect(modelsIndex).not.toContain("Des structures simples, déjà pensées pour suivre un flux de travail précis.");
    expect(modelsIndex).toContain('title: "Les fondamentaux"');
    expect(modelsIndex).toContain('title: "La réalisation du travail"');
    expect(modelsIndex).toContain('title: "Le développement de l’entreprise"');
    expect(modelsIndex).toContain("snap-x snap-mandatory overflow-x-auto");
    expect(modelsIndex).toContain("w-[82vw] max-w-[21rem] shrink-0 snap-start");
    expect(modelsIndex).not.toContain("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3");
    expect(modelsIndex).toContain("titleLevel={3}");
    expect(modelsIndex).toContain("ModelPracticeGuides");
    expect(modelsIndex).toContain("getPublishedPracticeTutorials");
    expect(modelsIndex).not.toContain("Des processus concrets pour se projeter vraiment");
    expect(modelCard).toContain("line-clamp-2");
    expect(modelCard).not.toContain("<Copy ");
    expect(modelCard).not.toContain('from "lucide-react"');
    expect(platformBadge).not.toContain("<svg");
    expect(modelCard).toContain("transition-colors duration-150");
    expect(modelCard).not.toContain("hover:-translate-y");
    expect(modelCard).not.toContain("hover:shadow-");
    expect(footer.indexOf('{ label: "Guides pratiques"')).toBeLessThan(
      footer.indexOf('{ label: "Modèles associés"'),
    );
  });

  it("supports a full detail page and an intercepted modal with the same content", async () => {
    const [page, modal, details, copyLink, preview, driveCreator, notionPreview, dialog] = await Promise.all([
      readSource("src/app/(marketing)/modeles/[slug]/page.tsx"),
      readSource("src/app/@modal/(.)modeles/[slug]/page.tsx"),
      readSource("src/components/CopyableModelDetails.tsx"),
      readSource("src/components/CopyableModelCopyLink.tsx"),
      readSource("src/components/DocumentModelPreview.tsx"),
      readSource("src/components/DriveFolderTemplateCreator.tsx"),
      readSource("src/components/NotionWorkspacePreview.tsx"),
      readSource("src/components/CopyableModelRouteDialog.tsx"),
    ]);

    expect(page).toContain('source === "organisation"');
    expect(page).toContain('source === "tutoriels"');
    expect(page).toContain('{ href: "/academie#guides", label: "Retour à l’Academy" }');
    expect(page).toContain('{ href: "/modeles", label: "Retour aux modèles" }');
    expect(page).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    expect(page).not.toContain("ResourcesNavigation");
    expect(modal).toContain('<CopyableModelDetails model={model} variant="modal" />');
    expect(page).toContain("export const dynamicParams = false");
    expect(modal).toContain("export const dynamicParams = false");
    expect(dialog).toContain("router.back()");
    expect(details).toContain("CopyableModelCopyLink");
    expect(details).toContain("DriveFolderTreePreview");
    expect(details).toContain("DriveFolderTemplateCreator");
    expect(details).toContain("NotionWorkspacePreview");
    expect(notionPreview).not.toContain("Six bases canoniques");
    expect(driveCreator).toContain("Créer dans mon Drive");
    expect(driveCreator).toContain("Copier la structure");
    expect(driveCreator).toContain("creation_cleanup");
    expect(driveCreator).toContain('type="hidden" name="rootName"');
    expect(driveCreator).toContain('type="hidden" name="year"');
    expect(driveCreator).toContain('type="hidden" name="sectionIds"');
    expect(driveCreator).not.toContain("Dossiers à créer");
    expect(driveCreator).not.toContain("La première option");
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
    expect(details).not.toContain("MentoratAutomationCta");
    expect(details).toContain("ModelPracticeGuides");
    expect(details).toContain("getPublishedPracticeTutorialsForModel");
    expect(details).not.toContain("Faire adapter ce modèle");
    expect(details).not.toContain("550 € HT / jour");
    expect(details).not.toContain("model.relatedOrganiserSlug");
    expect(details).not.toContain("Le flux couvert");
    expect(details).not.toContain("Structure incluse");
    expect(details).not.toContain("Modèle gratuit · Copie dans votre propre espace");
  });

  it("keeps Drive focused on files and points to the separate pilotage model", async () => {
    const [catalog, preview] = await Promise.all([
      readSource("src/lib/copyable-model-catalog.ts"),
      readSource("src/components/DriveFolderTreePreview.tsx"),
    ]);

    expect(catalog).toContain("Classez les documents administratifs, clients, équipe et communication");
    expect(preview).toContain("Drive classe les fichiers.");
    expect(preview).toContain('href="/modeles/pilotage-entreprise-notion"');
    expect(preview).not.toContain("Exemples à ajouter si nécessaire");
    expect(preview).not.toContain("COMPANY_DRIVE_DOSSIER_GUIDES");
    expect(preview).not.toContain("Pas de dossier « Modèles » général");
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
    expect(driveServer).not.toContain("include_granted_scopes");
    expect(driveServer).not.toContain("refresh_token");
  });
});
