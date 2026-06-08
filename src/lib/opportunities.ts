import {
  publicSectorFilterLabels,
  type PublicSectorLabel,
} from "@/lib/public-sectors";

export type Opportunity = {
  id: string;
  sector: PublicSectorLabel;
  title: string;
  description: string;
  publishedAt: string;
  isUrgent?: boolean;
};

export const opportunitySectors = publicSectorFilterLabels;

export const opportunities: Opportunity[] = [
  {
    id: "btp-peinture-renovation",
    sector: "BTP & services techniques",
    title: "Cherche sous-traitant peinture pour chantier qui démarre dans cinq jours.",
    description:
      "Appartement déjà préparé. Réponse attendue avec disponibilité et zone d'intervention.",
    publishedAt: "2026-06-08",
    isUrgent: true,
  },
  {
    id: "agence-web-seo-pme",
    sector: "Tech & Digital",
    title: "Agence web cherche partenaire SEO pour répondre à une consultation PME.",
    description:
      "Mission en marque blanche possible. Besoin d'un profil avec références concrètes.",
    publishedAt: "2026-06-07",
  },
  {
    id: "cabinet-comptable-renfort-admin",
    sector: "Conseil & services aux entreprises",
    title:
      "Cabinet comptable cherche renfort administratif pour organiser la collecte client mensuelle.",
    description:
      "Mission récurrente à confier, avec process existant et suivi sur WhatsApp.",
    publishedAt: "2026-06-06",
  },
  {
    id: "restaurant-formation-poec",
    sector: "Restauration",
    title: "Restaurant cherche organisme de formation pour monter une POEC en restauration.",
    description:
      "Besoin de former un groupe avant recrutement, avec programme court et calendrier à cadrer.",
    publishedAt: "2026-06-08",
  },
];
