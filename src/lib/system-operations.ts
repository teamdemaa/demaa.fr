import type { System } from "@/lib/types";
import { getToolDirectorySlug, toolDirectory, type ToolDirectoryItem } from "@/lib/tool-directory";

export type SystemPillar =
  | "Stratégie"
  | "Marketing & Vente"
  | "Opérations"
  | "Finance & Juridique"
  | "Équipe";

export type SystemProcessCard = {
  pillar: SystemPillar;
  title: string;
  description: string;
};

export type OperationalSystemDetail = {
  sectorLabel: string;
  editorialSubtitle: string;
  imageTitle: string;
  imageSubtitle: string;
  processes: SystemProcessCard[];
  tools: Array<ToolDirectoryItem & { detailUrl: string }>;
};

const sectorsBySlug: Record<string, string> = {
  "agence-immobiliere": "Immobilier",
  "investissement-locatif": "Immobilier",
  "conciergerie-airbnb": "Immobilier",
  restaurant: "Restauration",
  traiteur: "Restauration",
  "salon-de-coiffure": "Santé & bien-être",
  "institut-de-beaute": "Santé & bien-être",
  "salle-de-sport": "Santé & bien-être",
  "services-a-la-personne": "Santé & bien-être",
  consulting: "Services & conseil",
  freelance: "Services & conseil",
  saas: "Services & conseil",
  media: "Services & conseil",
  "creation-de-contenu": "Services & conseil",
  "agence-marketing": "Services & conseil",
  "agence-web": "Services & conseil",
  "formation-en-ligne": "Éducation & formation",
  "organisme-de-formation": "Éducation & formation",
  "garage-automobile": "Artisanat & BTP",
  "nettoyage-professionnel": "Artisanat & BTP",
  demenagement: "Artisanat & BTP",
  "location-de-materiel": "Artisanat & BTP",
  "maintenance-informatique": "Artisanat & BTP",
  "securite-privee": "Artisanat & BTP",
  "transport-de-marchandise": "Artisanat & BTP",
  "transport-de-personnes": "Artisanat & BTP",
};

function inferSector(system: System) {
  return sectorsBySlug[system.slug] ?? "Services & conseil";
}

function withSector(sectorLabel: string, sentence: string) {
  return sentence.replaceAll("{secteur}", sectorLabel.toLowerCase());
}

export function buildOperationalSystemDetail(system: System): OperationalSystemDetail {
  const sector = inferSector(system);

  const processes: SystemProcessCard[] = [
    {
      pillar: "Stratégie",
      title: "Offre et parcours client clarifiés",
      description: withSector(
        system.name,
        "Définir ce qu'on vend, à qui, dans quel ordre et avec quels livrables pour éviter les flottements côté {secteur}."
      ),
    },
    {
      pillar: "Marketing & Vente",
      title: "Entrée des demandes et qualification",
      description: withSector(
        system.name,
        "Canaliser les demandes entrantes, poser les bonnes questions dès le départ et déclencher les relances utiles."
      ),
    },
    {
      pillar: "Opérations",
      title: "Exécution standardisée",
      description: withSector(
        system.name,
        "Créer une séquence simple pour produire, livrer et suivre chaque dossier sans oublier une étape."
      ),
    },
    {
      pillar: "Opérations",
      title: "Suivi client et visibilité",
      description: withSector(
        system.name,
        "Centraliser les informations, les statuts et les prochaines actions pour savoir où en est chaque sujet."
      ),
    },
    {
      pillar: "Finance & Juridique",
      title: "Devis, contrats, factures et relances",
      description: withSector(
        system.name,
        "Sécuriser ce qui doit être signé, facturé puis relancé sans dépendre de rappels manuels."
      ),
    },
    {
      pillar: "Équipe",
      title: "Transmission et rôle de chacun",
      description: withSector(
        system.name,
        "Documenter les routines clés, répartir les responsabilités et rendre le fonctionnement plus autonome."
      ),
    },
  ];

  const tools = toolDirectory
    .filter((tool) => tool.sectors.includes(sector) || tool.sectors.length > 2)
    .slice(0, 6)
    .map((tool) => ({
      ...tool,
      detailUrl: `/annuaire-logiciel/${getToolDirectorySlug(tool)}`,
    }));

  return {
    sectorLabel: sector,
    editorialSubtitle: `Les processus essentiels à structurer pour ${system.name.toLowerCase()}.`,
    imageTitle: system.name,
    imageSubtitle: `Aperçu du système opérationnel pour ${system.name.toLowerCase()}`,
    processes,
    tools,
  };
}
