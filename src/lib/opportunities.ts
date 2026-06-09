import {
  publicSectorFilterLabels,
  type PublicSectorLabel,
} from "@/lib/public-sectors";

export type Opportunity = {
  id: string;
  sector: PublicSectorLabel;
  location: string;
  amount: string;
  revenue?: string;
  result?: string;
  employees?: string;
  title: string;
  description: string;
  publishedAt: string;
};

export const opportunitySectors = publicSectorFilterLabels;

export const opportunities: Opportunity[] = [
  {
    id: "agence-web-seo-pme",
    sector: "Tech & Digital",
    location: "Lyon",
    amount: "Prix demandé 280 k€",
    revenue: "CA annuel 420 k€",
    result: "Résultat 85 k€",
    employees: "6 salariés",
    title: "Agence web et SEO à céder avec portefeuille clients PME.",
    description:
      "Chiffre d'affaires récurrent, dirigeant disponible pour accompagner la reprise pendant trois mois.",
    publishedAt: "2026-06-07",
  },
  {
    id: "commerce-alimentaire-sud-ouest",
    sector: "Commerce & retail",
    location: "Bordeaux",
    amount: "Prix demandé 240 k€",
    revenue: "CA annuel 510 k€",
    result: "Résultat 72 k€",
    employees: "8 salariés",
    title:
      "Commerce alimentaire de proximité à reprendre avec équipe en place.",
    description:
      "Emplacement résidentiel, clientèle régulière et transmission progressive possible avec le dirigeant.",
    publishedAt: "2026-06-06",
  },
  {
    id: "restaurant-centre-ville",
    sector: "Restauration",
    location: "Nantes",
    amount: "Prix demandé 190 k€",
    revenue: "CA annuel 360 k€",
    result: "Résultat 48 k€",
    employees: "5 salariés",
    title: "Restaurant de centre-ville à vendre, licence et matériel inclus.",
    description:
      "Affaire saine, emplacement passant, dossier complet transmis après qualification du repreneur.",
    publishedAt: "2026-06-08",
  },
  {
    id: "societe-nettoyage-idf",
    sector: "Conseil & services aux entreprises",
    location: "Île-de-France",
    amount: "Prix demandé 450 k€",
    revenue: "CA annuel 780 k€",
    result: "Résultat 120 k€",
    employees: "14 salariés",
    title: "Société de nettoyage B2B rentable à céder en Île-de-France.",
    description:
      "Contrats récurrents, équipe encadrée et portefeuille clients diversifié. Cession accompagnée possible.",
    publishedAt: "2026-06-08",
  },
];
