import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("copyable model public routes", () => {
  it("makes models part of Outils while keeping the full model library available", async () => {
    const [page, toolsPage, toolsHub, toolsModels, navbar, footer, modelsIndex, modelCard] = await Promise.all([
      readSource("src/app/(marketing)/modeles/page.tsx"),
      readSource("src/app/(marketing)/outils/page.tsx"),
      readSource("src/components/SystemsHubPage.tsx"),
      readSource("src/components/ToolsModelsSection.tsx"),
      readSource("src/components/PublicActionPlanNavigation.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/components/CopyableModelsIndex.tsx"),
      readSource("src/components/CopyableModelCard.tsx"),
    ]);

    expect(page).toContain('<Navbar minimal publicNavigationActiveView="solutions" />');
    expect(page).not.toContain("OrganiserSectionNavigation");
    expect(page).toContain("<StructureNewsletterBlock />");
    expect(page).not.toContain("<ModelProcessesBridge />");
    expect(toolsPage).toContain("<SystemsHubPage enterprises={enterprises} />");
    expect(page).toContain('path: "/modeles"');
    expect(navbar).toContain('label: "Outils"');
    expect(navbar).toContain('href: "/outils"');
    expect(toolsHub).toContain("getPublishedCopyableModels");
    expect(toolsHub).toContain("<ToolsModelsSection");
    expect(toolsModels).toContain("<CopyableModelCard");
    expect(toolsModels).toContain("Modèles à copier");
    expect(toolsModels).toContain("Voir tous les modèles");
    expect(toolsModels).toContain(".slice(0, 6)");
    expect(page).toContain('fromOrganisation={source === "organisation"}');
    expect(modelsIndex).toContain('href="/tutoriels"');
    expect(modelsIndex).toContain("Retour aux tutoriels");
    expect(modelsIndex).toContain("`/modeles/${model.slug}?from=tutoriels`");
    expect(footer).toContain('{ label: "Modèles à copier", href: "/modeles" }');
    expect(footer).toContain('{ label: "Outils", href: "/outils" }');
    expect(footer).toContain('{ label: "Tutoriels", href: "/tutoriels" }');
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
    expect(modelCard).toContain("line-clamp-3");
    expect(modelCard).toContain("transition-colors duration-150");
    expect(modelCard).not.toContain("hover:-translate-y");
    expect(modelCard).not.toContain("hover:shadow-");
    expect(toolsModels).toContain('id="modeles"');
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
    expect(page).toContain('{ href: "/tutoriels", label: "Retour aux tutoriels" }');
    expect(page).toContain('{ href: "/outils#modeles", label: "Retour aux outils" }');
    expect(page).toContain('<Navbar minimal publicNavigationActiveView="solutions" />');
    expect(modal).toContain('<CopyableModelDetails model={model} variant="modal" />');
    expect(page).toContain("export const dynamicParams = false");
    expect(modal).toContain("export const dynamicParams = false");
    expect(dialog).toContain("router.back()");
    expect(details).toContain("CopyableModelCopyLink");
    expect(details).toContain("DriveFolderTreePreview");
    expect(details).toContain("DriveFolderTemplateCreator");
    expect(details).toContain("NotionWorkspacePreview");
    expect(notionPreview).toContain("Six bases canoniques");
    expect(driveCreator).toContain("Créer automatiquement dans mon Drive");
    expect(driveCreator).toContain("Copier la liste des dossiers");
    expect(driveCreator).toContain("Premier exercice comptable");
    expect(driveCreator).toContain("creation_cleanup");
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
    expect(details).not.toContain("model.relatedOrganiserSlug");
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
    expect(driveServer).not.toContain("include_granted_scopes");
    expect(driveServer).not.toContain("refresh_token");
  });
});
