import type { System } from "@/lib/types";
import { getEnterpriseBySlug, type EnterpriseTool } from "@/lib/enterprise-annuaire";

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
  tools: EnterpriseTool[];
};

export async function buildOperationalSystemDetail(system: System): Promise<OperationalSystemDetail> {
  const enterprise = await getEnterpriseBySlug(system.slug);

  if (enterprise) {
    const processes: SystemProcessCard[] = enterprise.processes.map((process) => ({
      pillar: process.pillar,
      title: process.title,
      description: process.description,
    }));

    return {
      sectorLabel: enterprise.sectorLabel,
      editorialSubtitle: enterprise.editorialSubtitle,
      imageTitle: enterprise.imageTitle,
      imageSubtitle: enterprise.imageSubtitle,
      processes,
      tools: enterprise.tools,
    };
  }

  const processes: SystemProcessCard[] = [
    {
      pillar: "Stratégie",
      title: "Positionnement",
      description:
        "Structurer le positionnement, les objectifs et la feuille de route pour piloter l'activité plus clairement.",
    },
    {
      pillar: "Marketing & Vente",
      title: "Entrée des demandes et qualification",
      description:
        "Canaliser les demandes entrantes, poser les bonnes questions dès le départ et déclencher les relances utiles.",
    },
    {
      pillar: "Opérations",
      title: "Exécution standardisée",
      description:
        "Créer une séquence simple pour produire, livrer et suivre chaque dossier sans oublier une étape.",
    },
    {
      pillar: "Opérations",
      title: "Suivi client et visibilité",
      description:
        "Centraliser les informations, les statuts et les prochaines actions pour savoir où en est chaque sujet.",
    },
    {
      pillar: "Finance & Juridique",
      title: "Devis, contrats, factures et relances",
      description:
        "Sécuriser ce qui doit être signé, facturé puis relancé sans dépendre de rappels manuels.",
    },
    {
      pillar: "Équipe",
      title: "Transmission et rôle de chacun",
      description:
        "Documenter les routines clés, répartir les responsabilités et rendre le fonctionnement plus autonome.",
    },
  ];

  return {
    sectorLabel: "Services & conseil",
    editorialSubtitle: `Les processus essentiels à structurer pour ${system.name.toLowerCase()}.`,
    imageTitle: system.name,
    imageSubtitle: `Aperçu du système opérationnel pour ${system.name.toLowerCase()}`,
    processes,
    tools: [],
  };
}
