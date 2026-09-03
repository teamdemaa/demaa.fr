import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import nextConfig from "../next.config";
import {
  getAllPublishedContent,
  getContentFormat,
  getPublishedOrganisationContent,
  getPublishedContentBySlug,
  isOrganisationTransverseLibraryReady,
  ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM,
} from "@/lib/content-catalog";
import {
  buildContentJsonLd,
  buildContentMetadata,
  serializeContentJsonLd,
} from "@/lib/content-seo";

describe("canonical content catalog", () => {
  it("publishes the electronic invoicing article with a progressive slide medium", () => {
    const entries = getAllPublishedContent();
    expect(entries).toHaveLength(21);

    const entry = getPublishedContentBySlug("facturation-electronique");
    expect(entry).not.toBeNull();
    expect(entry?.status).toBe("published");
    expect(entry?.verifiedAt).toBe("2026-08-09");
    expect(entry?.media.youtubeId).toBeUndefined();
    expect(entry?.media.slides).toHaveLength(9);
    expect(getContentFormat(entry!)).toBe("Diaporama");
    expect(entry?.article.length).toBeGreaterThanOrEqual(7);
    expect(JSON.stringify(entry)).not.toMatch(/15\s*€|sanction|amende/i);

    for (const slide of entry?.media.slides ?? []) {
      expect(existsSync(resolve(process.cwd(), "public", slide.replace(/^\//, "")))).toBe(true);
    }
  });

  it("keeps electronic invoicing in Contenus and prepares real Organisation videos", () => {
    const contentPage = readFileSync(
      resolve(process.cwd(), "src/app/(marketing)/contenus/[slug]/page.tsx"),
      "utf8",
    );

    expect(contentPage).toContain('<Navbar minimal publicNavigationActiveView="academy" />');
    const organisationContent = getPublishedOrganisationContent();
    expect(organisationContent).toHaveLength(20);
    expect(organisationContent.map(({ title }) => title)).toEqual([
      "Comment préparer ses devis et propositions commerciales plus rapidement ?",
      "Comment construire une grille tarifaire claire pour son équipe ?",
      "Comment relancer ses devis et propositions sans rien oublier ?",
      "Comment facturer plus vite et suivre les règlements en attente ?",
      "Comment ne plus passer ses journées à gérer les urgences ?",
      "Comment centraliser ses tâches sans changer tous ses outils ?",
      "Comment transformer ses réunions en décisions et en actions ?",
      "Comment rendre son équipe plus autonome sans perdre le contrôle ?",
      "Comment organiser ses informations pour que l’équipe les retrouve seule ?",
      "Comment automatiser ses tâches administratives sans multiplier les erreurs ?",
      "Comment organiser les relances sans courir après son équipe ?",
      "Comment suivre l’avancement de ses dossiers en un coup d’œil ?",
      "Comment suivre chaque demande client de la réception à la réponse ?",
      "Comment mettre en place une méthode de travail commune ?",
      "Comment organiser son entreprise pour qu’elle fonctionne aussi en son absence ?",
      "Comment organiser le planning d’une équipe malgré les imprévus ?",
      "Comment supprimer les doubles saisies entre ses outils ?",
      "Comment documenter les façons de travailler sans créer une usine à gaz ?",
      "Comment construire un tableau de bord réellement utile ?",
      "Comment structurer l’arrivée d’un salarié pour le rendre autonome plus vite ?",
    ]);
    expect(organisationContent.every((entry) => getContentFormat(entry) === "Article")).toBe(true);
    expect(organisationContent.every((entry) => entry.title.endsWith("?"))).toBe(true);
    expect(JSON.stringify(organisationContent)).not.toMatch(
      /\b(index|registre|matrice|escalade|déterministe|déclencheur|flux|référent)\b|vue de pilotage|source de référence|carte de continuité|carte de données|preuve observable|arborescence|convention de nommage/i,
    );
    const expectedStructure = [
      "Ce qui bloque aujourd’hui",
      "Le résultat à obtenir",
      "La méthode, étape par étape",
      "Construire le système avec ChatGPT",
      "La checklist de mise en place",
    ];
    for (const entry of organisationContent) {
      expect(entry.article.map(({ heading }) => heading), entry.slug).toEqual(
        expectedStructure,
      );
      expect(entry.article[0]?.paragraphs, entry.slug).toHaveLength(2);
      expect(entry.article[1]?.paragraphs, entry.slug).toHaveLength(2);
      expect(entry.article[2]?.items, entry.slug).toHaveLength(6);
      expect(entry.article[3]?.paragraphs, entry.slug).toHaveLength(2);
      expect(entry.article[3]?.paragraphs?.[0], entry.slug).toContain(
        "Copiez ce prompt",
      );
      expect(entry.article[4]?.items, entry.slug).toHaveLength(5);
      expect(entry.media.youtubeId, entry.slug).toBeUndefined();
      expect(entry.sources, entry.slug).toEqual([]);
    }
    expect(contentPage).toContain('entry.surfaces.includes("organisation")');
    expect(contentPage).toContain('isOrganisationContent ? "/organiser#cas-concrets" : "/contenus"');
    expect(contentPage).toContain("{!isOrganisationContent ? (");
    expect(contentPage).toContain("www.youtube-nocookie.com/embed/");
    expect(contentPage).toContain("<CaseVideoOverview");
    expect(contentPage).toContain("items={entry.article.map((section) => section.heading)}");
    expect(contentPage).toContain("<NumberedSectionHeading");
    expect(contentPage).toContain("Le modèle prêt à copier");
    expect(contentPage).toContain("Utiliser ce modèle");
    expect(contentPage).toContain("?from=organisation");
    expect(contentPage).toContain('<MentoratAutomationCta contentSlug={entry.slug} variant="organisation" />');
  });

  it("keeps the legacy library until a complete first transverse series is published", () => {
    expect(ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM).toBe(6);
    expect(isOrganisationTransverseLibraryReady(5)).toBe(false);
    expect(isOrganisationTransverseLibraryReady(6)).toBe(true);
    expect(isOrganisationTransverseLibraryReady()).toBe(true);
  });

  it("uses only the four official sources selected for the legal review", () => {
    const entry = getPublishedContentBySlug("facturation-electronique");
    expect(entry?.sources.map(({ href }) => href)).toEqual([
      "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
      "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises",
      "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation",
      "https://www.impots.gouv.fr/foire-aux-questions-japprofondis-la-facturation-electronique",
    ]);
  });

  it("builds canonical metadata, BreadcrumbList and Article without a false VideoObject", () => {
    const entry = getPublishedContentBySlug("facturation-electronique")!;
    const metadata = buildContentMetadata(entry);
    const jsonLd = buildContentJsonLd(entry);

    expect(metadata.alternates?.canonical).toBe("https://demaa.fr/contenus/facturation-electronique");
    expect(jsonLd).toHaveLength(2);
    expect(jsonLd[0]).toMatchObject({ "@type": "BreadcrumbList" });
    expect(jsonLd[1]).toMatchObject({
      "@type": "Article",
      url: "https://demaa.fr/contenus/facturation-electronique",
      dateModified: "2026-08-09",
    });
    expect(JSON.stringify(jsonLd)).not.toContain("VideoObject");
    expect(serializeContentJsonLd({ value: "</script>" })).toBe('{"value":"\\u003c/script>"}');
  });

  it("redirects the legacy course only after the canonical destination exists", async () => {
    expect(getPublishedContentBySlug("facturation-electronique")).not.toBeNull();
    const redirects = await nextConfig.redirects?.();
    expect(redirects).toContainEqual({
      source: "/cours/facture-electronique",
      destination: "/contenus/facturation-electronique",
      permanent: true,
    });
  });

  it("exposes the hub in the footer without restoring legacy Courses entries", () => {
    const footer = readFileSync(resolve(process.cwd(), "src/components/Footer.tsx"), "utf8");
    const sitemap = readFileSync(resolve(process.cwd(), "src/app/sitemap.ts"), "utf8");
    expect(footer).toContain('{ label: "Contenus", href: "/contenus" }');
    expect(sitemap).toContain("`${base}/contenus`");
    expect(sitemap).toContain("`${base}/contenus/${entry.slug}`");
    expect(sitemap).not.toContain("courseContentEntries");
    expect(sitemap).not.toMatch(/from ["']@\/lib\/course-content["']/);
  });
});
