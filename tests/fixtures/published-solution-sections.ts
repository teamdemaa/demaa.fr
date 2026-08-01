import type { PublishedSolutionSection } from "@/components/SystemSolutionsTab";

export const publishedSolutionSectionsFixture = [
  {
    section: "software",
    placements: [
      {
        placementId: "cabinet-comptable:qonto:software:1",
        systemSlug: "cabinet-comptable",
        rank: 1,
        section: "software",
        usage: "Centraliser les paiements et les justificatifs.",
        fitRationale: "La solution couvre le besoin de suivi quotidien.",
        fitConstraints: ["Vérifier le périmètre fonctionnel avant abonnement."],
        placementVersion: "fixture.1",
        resource: {
          resourceSlug: "qonto",
          resourceType: "software",
          name: "Qonto",
          description: "Compte professionnel et gestion financière.",
          interaction: {
            interactionMode: "external_link",
            href: "https://qonto.com/fr",
          },
          commercialRelationship: "none",
          resourceVersion: "fixture.1",
        },
      },
    ],
  },
  {
    section: "providers",
    placements: [],
  },
] satisfies readonly PublishedSolutionSection[];
