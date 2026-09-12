import type { AccountingDirectoryFilters } from "@/lib/accounting-directory";

export type AccountingDirectorySeoPage = {
  slug: string;
  title: string;
  description: string;
  filters: AccountingDirectoryFilters;
};

export const accountingDirectorySeoPages: AccountingDirectorySeoPage[] = [
  {
    slug: "paris",
    title: "Experts-comptables à Paris",
    description:
      "Cabinets d'expertise comptable basés à Paris, pour comparer les profils et prendre contact directement.",
    filters: { city: "Paris" },
  },
  {
    slug: "nantes",
    title: "Experts-comptables à Nantes",
    description:
      "Cabinets d'expertise comptable basés à Nantes, pour comparer les profils et prendre contact directement.",
    filters: { city: "Nantes" },
  },
  {
    slug: "ile-de-france",
    title: "Experts-comptables en Île-de-France",
    description:
      "Cabinets présents en Île-de-France pour accompagner TPE, PME et indépendants.",
    filters: { region: "Ile-de-France" },
  },
  {
    slug: "pays-de-la-loire",
    title: "Experts-comptables en Pays de la Loire",
    description:
      "Cabinets présents en Pays de la Loire pour accompagner TPE, PME et indépendants.",
    filters: { region: "Pays de la Loire" },
  },
];

export function getAccountingDirectorySeoPage(slug: string) {
  return accountingDirectorySeoPages.find((page) => page.slug === slug) ?? null;
}
