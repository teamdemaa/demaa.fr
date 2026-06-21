import type { AccountingDirectoryFilters } from "@/lib/accounting-directory";

export type AccountingDirectorySeoPage = {
  kind: "ville" | "region" | "service" | "secteur";
  slug: string;
  title: string;
  description: string;
  filters: AccountingDirectoryFilters;
};

export const accountingDirectorySeoPages: AccountingDirectorySeoPage[] = [
  {
    kind: "ville",
    slug: "paris",
    title: "Experts-comptables à Paris",
    description:
      "Sélection de cabinets d'expertise comptable basés à Paris ou actifs en Ile-de-France pour accompagner les dirigeants.",
    filters: { city: "Paris" },
  },
  {
    kind: "ville",
    slug: "nantes",
    title: "Experts-comptables à Nantes",
    description:
      "Trouvez un expert-comptable à Nantes pour la comptabilité, la création d'entreprise, la paie ou le pilotage.",
    filters: { city: "Nantes" },
  },
  {
    kind: "region",
    slug: "ile-de-france",
    title: "Experts-comptables en Ile-de-France",
    description:
      "Cabinets présents en Ile-de-France pour accompagner TPE, PME, indépendants et structures en croissance.",
    filters: { region: "Ile-de-France" },
  },
  {
    kind: "service",
    slug: "creation-entreprise",
    title: "Experts-comptables pour la création d'entreprise",
    description:
      "Des cabinets utiles pour structurer un lancement, choisir la bonne forme et cadrer les premiers sujets comptables.",
    filters: { service: "Création d'entreprise", creationOfferOnly: true },
  },
  {
    kind: "service",
    slug: "paie-social",
    title: "Experts-comptables paie et social",
    description:
      "Cabinets qui accompagnent la paie, le social et les obligations employeur avec un cadre clair.",
    filters: { service: "Paie / social" },
  },
  {
    kind: "secteur",
    slug: "startups-saas",
    title: "Experts-comptables pour startups et SaaS",
    description:
      "Cabinets qui accompagnent les startups, éditeurs SaaS et activités tech avec des outils et process adaptés.",
    filters: { industry: "Startups / SaaS" },
  },
];

export function getAccountingDirectorySeoPage(
  kind: string,
  slug: string
) {
  return accountingDirectorySeoPages.find(
    (page) => page.kind === kind && page.slug === slug
  );
}
