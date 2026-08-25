import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  getAcademyProcessGuideEditorialScore,
} from "@/lib/academy-course-content";
import rawEnterpriseDirectory from "@/lib/enterprise-annuaire.json";
import { ORGANISER_PROCESS_GUIDES } from "@/lib/organiser-process-guides";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

function countGuideWords(content: (typeof ORGANISER_PROCESS_GUIDES)[number]) {
  const guide = content.processGuide;
  if (!guide) return 0;

  return [
    content.identity.title,
    content.identity.promise,
    guide.company.profile,
    guide.company.friction,
    guide.processTitle,
    guide.processIntroduction,
    ...guide.steps.flatMap((step) => [
      step.label,
      step.title,
      step.input,
      step.description,
      step.owner,
      step.output,
      step.control,
    ]),
    guide.rulesTitle,
    ...guide.rules.flatMap((rule) => [rule.title, rule.description]),
    guide.implementation.startingPoint,
    guide.implementation.cadence,
    guide.implementation.escalation,
    guide.example.title,
    guide.example.body,
    guide.toolsTitle ?? "",
    guide.toolsIntroduction ?? "",
    ...guide.tools.flatMap((tool) => [tool.name, tool.description]),
    ...guide.checklist,
    ...guide.faqs.flatMap((faq) => [faq.question, faq.answer]),
    guide.conclusion,
  ].join(" ").trim().split(/\s+/).length;
}

describe("Organiser process guides", () => {
  it("publishes the fourteen validated subjects from one six-step source", () => {
    expect(ORGANISER_PROCESS_GUIDES).toHaveLength(14);

    for (const content of ORGANISER_PROCESS_GUIDES) {
      expect(content.kind).toBe("case-study");
      expect(content.status).toBe("ready");
      expect(content.processGuide?.steps).toHaveLength(6);
      expect(content.processGuide?.rules.length).toBeGreaterThanOrEqual(4);
      expect(content.processGuide?.checklist.length).toBeGreaterThanOrEqual(4);
      expect(content.processGuide?.faqs).toHaveLength(3);
      expect(content.identity.title).toMatch(/^(Comment|Quel|À partir|Faut-il)/);
      expect(content.identity.card.image).toBeNull();
      expect(`${content.identity.shortTitle} | Organiser avec Demaa`.length)
        .toBeLessThanOrEqual(60);
      expect(content.identity.promise.length).toBeGreaterThanOrEqual(120);
      expect(content.identity.promise.length).toBeLessThanOrEqual(180);

      const guide = content.processGuide!;
      expect(countGuideWords(content)).toBeGreaterThanOrEqual(900);
      expect(countGuideWords(content)).toBeLessThanOrEqual(1_200);
      for (const step of guide.steps) {
        expect(step.label.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
        expect(step.label.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
        expect(step.input.length).toBeGreaterThan(20);
        expect(step.description.length).toBeGreaterThan(40);
        expect(step.owner.length).toBeGreaterThan(8);
        expect(step.output.length).toBeGreaterThan(30);
        expect(step.control.length).toBeGreaterThan(40);
      }

      expect(guide.editorialReview.clarity).toBeGreaterThanOrEqual(3);
      expect(guide.editorialReview.realism).toBeGreaterThanOrEqual(3);
      expect(guide.editorialReview.immediateUsefulness).toBeGreaterThanOrEqual(3);
      expect(getAcademyProcessGuideEditorialScore(guide.editorialReview))
        .toBeGreaterThanOrEqual(17);
    }
  });

  it("locks the six new search-led process maps", () => {
    const expectedStepsBySlug = {
      "centraliser-demandes-telephone-sms-whatsapp": ["Demande reçue", "Fiche créée", "Urgence qualifiée", "Responsable affecté", "Réponse suivie", "Demande clôturée"],
      "organiser-planning-plusieurs-techniciens": ["Interventions prêtes", "Contraintes vérifiées", "Priorités classées", "Techniciens affectés", "Planning confirmé", "Écarts replanifiés"],
      "bon-intervention-facture-sans-ressaisie": ["Bon signé", "Données contrôlées", "Prestations validées", "Écarts traités", "Facture générée", "Facture envoyée"],
      "quel-logiciel-quand-excel-ne-suffit-plus": ["Usage observé", "Irritants recensés", "Risques mesurés", "Besoins cadrés", "Options comparées", "Décision prise"],
      "rentabilite-application-metier": ["Temps mesuré", "Erreurs chiffrées", "Coût actuel calculé", "Gains estimés", "Investissement comparé", "Seuil validé"],
      "logiciel-existant-ou-application-metier": ["Besoin cadré", "Marché recherché", "Écarts listés", "Coûts comparés", "Risques évalués", "Choix documenté"],
    } as const;

    for (const [slug, expectedSteps] of Object.entries(expectedStepsBySlug)) {
      const content = ORGANISER_PROCESS_GUIDES.find((item) => item.identity.slug === slug);
      expect(content, `${slug} is published`).toBeDefined();
      expect(content?.processGuide?.steps.map((step) => step.label)).toEqual(expectedSteps);
    }
  });

  it("keeps decision guides neutral until the comparison is complete", () => {
    const decisionGuideSlugs = [
      "quel-logiciel-quand-excel-ne-suffit-plus",
      "rentabilite-application-metier",
      "logiciel-existant-ou-application-metier",
    ];

    for (const slug of decisionGuideSlugs) {
      const guide = ORGANISER_PROCESS_GUIDES.find(
        (content) => content.identity.slug === slug,
      )?.processGuide;
      expect(guide?.toolsTitle).toBeTruthy();
      expect(guide?.toolsIntroduction).toBeTruthy();
      expect(guide?.system.slug).toBe("batiment");
    }
  });

  it("provides one dynamic process-map image for Open Graph and X", async () => {
    const openGraphSource = readFileSync(
      "src/app/(marketing)/academie/[slug]/opengraph-image.tsx",
      "utf8",
    );
    const twitterSource = readFileSync(
      "src/app/(marketing)/academie/[slug]/twitter-image.tsx",
      "utf8",
    );

    expect(openGraphSource).toContain("width: 1200, height: 630");
    expect(openGraphSource).toContain("content?.processGuide?.steps.map");
    expect(openGraphSource).not.toMatch(/logo|portrait|photo/i);
    expect(twitterSource).toContain('from "./opengraph-image"');

    const { default: renderOpenGraphImage } = await import(
      "@/app/(marketing)/organiser/[slug]/opengraph-image"
    );
    const image = await renderOpenGraphImage({
      params: Promise.resolve({ slug: "organiser-entreprise-plomberie" }),
    });
    expect(image.headers.get("content-type")).toBe("image/png");
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    expect(imageBuffer.byteLength).toBeGreaterThan(10_000);
    expect(imageBuffer.readUInt32BE(16)).toBe(1_200);
    expect(imageBuffer.readUInt32BE(20)).toBe(630);

    const { GET: renderStableProcessMap } = await import(
      "@/app/(marketing)/organiser/[slug]/process-map.png/route"
    );
    const stableImage = await renderStableProcessMap(
      new Request("https://demaa.co/organiser/organiser-entreprise-plomberie/process-map.png"),
      { params: Promise.resolve({ slug: "organiser-entreprise-plomberie" }) },
    );
    expect(stableImage.headers.get("content-type")).toBe("image/png");
    expect((await stableImage.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });

  it("keeps public cards lighter, smaller and concise", () => {
    const indexSource = readFileSync("src/components/AcademyIndexClient.tsx", "utf8");
    const processMapSource = readFileSync("src/components/OrganiserProcessMap.tsx", "utf8");

    expect(indexSource).toContain(
      "`Process · ${content.processGuide.system.label} · ${identity.durationMinutes} min`",
    );
    expect(indexSource).toContain("text-[0.84rem]");
    expect(indexSource).toContain("sm:text-[0.9rem]");
    expect(indexSource).toContain("text-[0.7rem]");
    expect(indexSource.match(/opacity-\[0\.59\]/g)).toHaveLength(2);
    expect(indexSource).toContain("`/organiser/${identity.slug}`");
    expect(indexSource).toContain("relative aspect-video");
    expect(indexSource).toContain('? "bg-[#F0F4F1]"');
    expect(indexSource).not.toContain(
      '? "border border-[#E1E8E3] bg-[#FBFCFA] p-2"',
    );
    expect(processMapSource).toContain("if (compact)");
    expect(processMapSource).toContain(
      "grid aspect-[3.3/1] w-full grid-cols-[minmax(0,1fr)_0.75rem_minmax(0,1fr)_0.75rem_minmax(0,1fr)]",
    );
    expect(processMapSource).toContain('className="space-y-2 sm:hidden"');
  });

  it("keeps the plumbing pilot wording and process locked", () => {
    const plumbing = ORGANISER_PROCESS_GUIDES.find(
      (content) => content.identity.slug === "organiser-entreprise-plomberie",
    );

    expect(plumbing?.identity.title).toBe(
      "Comment organiser une entreprise de plomberie, de la demande à la facture",
    );
    expect(plumbing?.processGuide?.steps.map((step) => step.label)).toEqual([
      "Demande reçue",
      "Fiche créée",
      "Priorité définie",
      "Intervention planifiée",
      "Intervention clôturée",
      "Facture envoyée",
    ]);
    expect(plumbing?.identity.promise).toBe(
      "Un processus simple pour que chaque intervention avance avec un responsable, une prochaine action et un statut clair — sans que la direction reste le point de passage obligatoire.",
    );
    expect(plumbing?.processGuide?.conclusion).toBe(
      "Une demande entre une seule fois dans l’organisation et avance jusqu’à la facture, avec la bonne information au bon moment.",
    );
  });

  it("keeps the long renovation H1 while using a mobile-safe card title", () => {
    const renovation = ORGANISER_PROCESS_GUIDES.find(
      (content) => content.identity.slug === "organiser-demandes-devis-renovation",
    );

    expect(renovation?.identity.title).toBe(
      "Comment organiser les demandes de devis d’une entreprise de rénovation, du premier contact à la signature",
    );
    expect(renovation?.identity.card.title).toBe(
      "Comment organiser les demandes de devis d’une entreprise de rénovation ?",
    );
  });

  it("keeps preparation fields internal and renders the validated article structure", () => {
    const articleSource = readFileSync(
      "src/components/AcademyProcessGuideArticle.tsx",
      "utf8",
    );

    expect(articleSource).not.toContain("Les six étapes, une par une");
    expect(articleSource).not.toContain(">Entrée :");
    expect(articleSource).not.toContain(">Responsable<");
    expect(articleSource).not.toContain(">Sortie attendue<");
    expect(articleSource).not.toContain(">Contrôle<");
    expect(articleSource).not.toContain("Point de départ");
    expect(articleSource).not.toContain("Rythme de pilotage");
    expect(articleSource).not.toContain("Exceptions à remonter");
    expect(articleSource).toContain("font-serif text-[2.65rem] font-normal");

    const rulesPosition = articleSource.indexOf('aria-labelledby="rules-title"');
    const examplePosition = articleSource.indexOf('aria-label="Exemple concret"');
    const toolsPosition = articleSource.indexOf('aria-labelledby="tools-title"');
    const checklistPosition = articleSource.indexOf('aria-labelledby="checklist-title"');
    const faqPosition = articleSource.indexOf('aria-labelledby="faq-title"');

    expect(rulesPosition).toBeGreaterThan(0);
    expect(examplePosition).toBeGreaterThan(rulesPosition);
    expect(toolsPosition).toBeGreaterThan(examplePosition);
    expect(checklistPosition).toBeGreaterThan(toolsPosition);
    expect(faqPosition).toBeGreaterThan(checklistPosition);
  });

  it("only links public tools and public systems from the canonical directories", () => {
    const systemSlugs = new Set(
      (rawEnterpriseDirectory as { enterprises: Array<{ slug: string }> })
        .enterprises.map(({ slug }) => slug),
    );

    for (const content of ORGANISER_PROCESS_GUIDES) {
      expect(systemSlugs.has(content.processGuide!.system.slug)).toBe(true);
      for (const tool of content.processGuide?.tools ?? []) {
        const publicTool = getToolDirectoryItemBySlug(tool.slug);
        expect(publicTool, `${tool.slug} is not public`).not.toBeNull();
        expect(publicTool?.status ?? "active").toBe("active");
      }
    }
  });
});
