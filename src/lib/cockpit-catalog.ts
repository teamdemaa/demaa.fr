import "server-only";

import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail, type SystemeProcessItem } from "@/lib/systeme-catalog";
import type {
  CockpitActivity,
  CockpitPeriod,
  CockpitTaskTemplate,
} from "@/lib/cockpit-types";

type CuratedTask = Omit<CockpitTaskTemplate, "id">;

const PERIOD_ROTATION: Array<{
  period: CockpitPeriod;
  scheduleLabel: string;
  recurrence?: string;
}> = [
  { period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { period: "later", scheduleLabel: "Ce trimestre", recurrence: "Chaque trimestre" },
  { period: "undated", scheduleLabel: "Sans date" },
];

const CABINET_COMPTABLE_TASKS: CuratedTask[] = [
  { title: "Arbitrer les priorités et la charge de l’équipe", pillar: "Direction", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque lundi" },
  { title: "Revoir les objectifs et les dossiers sensibles", pillar: "Direction", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Suivre les prospects et les lettres de mission", pillar: "Marketing et Vente", period: "week", scheduleLabel: "Jeudi", recurrence: "Chaque semaine" },
  { title: "Vérifier les retours et réclamations clients", pillar: "Marketing et Vente", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Relancer les pièces manquantes", pillar: "Opérations", period: "overdue", scheduleLabel: "Hier", recurrence: "Chaque semaine" },
  { title: "Vérifier les dossiers à risque", pillar: "Opérations", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { title: "Contrôler les échéances à venir", pillar: "Opérations", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Préparer les échéances de paie et déclarations", pillar: "Opérations", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque mois" },
  { title: "Valider les honoraires à facturer", pillar: "Finance et Admin", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { title: "Suivre les impayés et la rentabilité des dossiers", pillar: "Finance et Admin", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Vérifier les relais en cas d’absence", pillar: "Équipe", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Contrôler les accès et la confidentialité", pillar: "Conformité & obligations", period: "later", scheduleLabel: "Ce trimestre", recurrence: "Chaque trimestre" },
];

const BTP_TASKS: CuratedTask[] = [
  { title: "Arbitrer le planning des chantiers", pillar: "Direction", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque lundi" },
  { title: "Revoir les priorités et les points de blocage", pillar: "Direction", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Suivre les demandes et les devis à relancer", pillar: "Marketing et Vente", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Vérifier les retours clients et les réserves", pillar: "Marketing et Vente", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Contrôler l’avancement des chantiers", pillar: "Opérations", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { title: "Préparer les démarrages de chantier", pillar: "Opérations", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Planifier les réceptions et la levée des réserves", pillar: "Opérations", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Vérifier les matériaux et équipements nécessaires", pillar: "Matériel & Approvisionnement", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { title: "Suivre la marge de chaque chantier", pillar: "Finance et Admin", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Contrôler les acomptes, situations et impayés", pillar: "Finance et Admin", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Vérifier les équipes et sous-traitants mobilisés", pillar: "Équipe", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Contrôler les assurances et la sécurité chantier", pillar: "Sécurité & Conformité Chantier", period: "later", scheduleLabel: "Ce trimestre", recurrence: "Chaque trimestre" },
];

const COMMON_FALLBACK_TASKS: CuratedTask[] = [
  { title: "Revoir les priorités de l’entreprise", pillar: "Direction", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque lundi" },
  { title: "Faire le point sur la charge et les blocages", pillar: "Direction", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Suivre les prospects et opportunités", pillar: "Marketing et Vente", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Relancer les clients à suivre", pillar: "Marketing et Vente", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Contrôler les activités en cours", pillar: "Opérations", period: "today", scheduleLabel: "Aujourd’hui", recurrence: "Chaque semaine" },
  { title: "Préparer les prochaines échéances", pillar: "Opérations", period: "week", scheduleLabel: "Mercredi", recurrence: "Chaque semaine" },
  { title: "Traiter les retards et points de blocage", pillar: "Opérations", period: "overdue", scheduleLabel: "Hier", recurrence: "Chaque semaine" },
  { title: "Vérifier l’organisation de l’équipe", pillar: "Équipe", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
  { title: "Suivre la trésorerie et les encaissements", pillar: "Finance et Admin", period: "week", scheduleLabel: "Vendredi", recurrence: "Chaque semaine" },
  { title: "Contrôler la rentabilité", pillar: "Finance et Admin", period: "later", scheduleLabel: "Fin du mois", recurrence: "Chaque mois" },
];

function taskId(slug: string, index: number) {
  return `${slug}-recommended-${index + 1}`;
}

function normalizeTaskTitle(process: string) {
  const replacements: Array<[RegExp, string]> = [
    [/^Savoir où va (l’entreprise|l'activité|le cabinet|l'agence)/i, "Revoir les objectifs et priorités"],
    [/^Décider /i, "Clarifier les décisions pour "],
    [/^Donner accès à l’essentiel/i, "Vérifier les accès aux informations essentielles"],
    [/^Donner accès à l'essentiel/i, "Vérifier les accès aux informations essentielles"],
    [/^Garder une visibilité /i, "Faire le point "],
    [/^Attirer /i, "Suivre les actions pour attirer "],
    [/^Vendre /i, "Suivre les ventes et l’offre pour "],
    [/^Faire revenir /i, "Relancer "],
    [/^Traiter /i, "Vérifier le traitement de "],
    [/^Organiser /i, "Vérifier l’organisation de "],
    [/^Intégrer /i, "Préparer l’intégration de "],
    [/^Suivre /i, "Contrôler "],
    [/^Payer à temps/i, "Vérifier les échéances à payer"],
    [/^Se faire payer/i, "Suivre les factures et impayés"],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(process)) {
      return process.replace(pattern, replacement);
    }
  }

  return process;
}

function buildBalancedTasks(enterprise: EnterpriseDefinition): CuratedTask[] {
  const detail = buildSystemeDetail(enterprise);

  if (!detail) {
    return COMMON_FALLBACK_TASKS;
  }

  const quotas = new Map<string, number>([
    ["Direction", 2],
    ["Marketing et Vente", 2],
    ["Opérations", 3],
    ["Équipe", 1],
    ["Finance et Admin", 2],
  ]);
  const selected: Array<{ pillar: string; item: SystemeProcessItem }> = [];
  const remaining: Array<{ pillar: string; item: SystemeProcessItem }> = [];

  for (const card of detail.cards) {
    const quota = quotas.get(card.pillar) ?? 2;

    card.items.forEach((item, index) => {
      const target = index < quota ? selected : remaining;
      target.push({ pillar: card.pillar, item });
    });
  }

  for (const candidate of remaining) {
    if (selected.length >= 12) break;
    selected.push(candidate);
  }

  return selected.slice(0, 12).map(({ pillar, item }, index) => {
    const timing = PERIOD_ROTATION[index % PERIOD_ROTATION.length];

    return {
      title: normalizeTaskTitle(item.process),
      pillar,
      ...timing,
    };
  });
}

function getCuratedTasks(enterprise: EnterpriseDefinition) {
  if (enterprise.slug === "cabinet-comptable") return CABINET_COMPTABLE_TASKS;
  if (enterprise.slug === "batiment") return BTP_TASKS;

  return buildBalancedTasks(enterprise);
}

export function buildCockpitActivities(enterprises: EnterpriseDefinition[]): CockpitActivity[] {
  return enterprises
    .filter((enterprise) => enterprise.visibility !== "hidden")
    .map((enterprise) => ({
      slug: enterprise.slug,
      name: enterprise.name,
      description: enterprise.description,
      sectorLabel: enterprise.sectorLabel,
      tasks: getCuratedTasks(enterprise).map((task, index) => ({
        ...task,
        id: taskId(enterprise.slug, index),
      })),
    }));
}
