import "server-only";

import { deepFreeze } from "@/lib/registry-contract-utils";

export const CANONICAL_SERVICE_SLUGS = [
  "automatisation-processus",
  "expert-comptable",
  "marketing-vente",
  "assistance-facturation",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

type CallbackCta = Readonly<{
  kind: "callback";
  label: "Être rappelé";
}>;

type CanonicalServicePricing =
  | Readonly<{
      mode: "fixed-daily";
      amountMinor: 50000;
      currency: "EUR";
      heading: "Tarif";
      label: "500 € HT / jour";
      note: string;
    }>
  | Readonly<{
      mode: "fixed-monthly";
      amountMinor: 95000;
      currency: "EUR";
      heading: "Tarif";
      label: "950 € HT / mois";
      note: string;
    }>
  | Readonly<{
      mode: "fixed-monthly-hours";
      amountMinor: 50000;
      currency: "EUR";
      heading: "Forfait";
      hourlyRateMinor: 2500;
      includedHours: 20;
      label: "500 € HT / mois";
      note: string;
    }>
  | Readonly<{
      mode: "third-party-starting-monthly";
      amountMinor: 25000;
      currency: "EUR";
      heading: "Honoraires du cabinet";
      label: "À partir de 250 € HT / mois";
      note: string;
    }>;

export type CanonicalService = Readonly<{
  slug: CanonicalServiceSlug;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  result: string;
  pricing: CanonicalServicePricing;
  cta: CallbackCta;
  included: readonly string[];
  conditions: readonly string[];
  notIncluded: readonly string[];
}>;

const canonicalServiceDefinitions = deepFreeze([
  {
    slug: "automatisation-processus",
    name: "Automatisation des processus",
    eyebrow: "Organisation et automatisation",
    summary:
      "Automatisez les tâches répétitives et reliez vos outils pour réduire les ressaisies, les oublis et les relances manuelles.",
    description:
      "Demaa analyse le processus concerné, simplifie son fonctionnement puis met en place les automatisations adaptées à vos outils et à votre organisation.",
    result:
      "Un processus plus fluide et plus fiable, avec moins d’actions manuelles à effectuer et à contrôler au quotidien.",
    pricing: {
      mode: "fixed-daily",
      amountMinor: 50000,
      currency: "EUR",
      heading: "Tarif",
      label: "500 € HT / jour",
      note:
        "Le nombre de jours et l’enveloppe totale sont validés avant le démarrage.",
    },
    cta: {
      kind: "callback",
      label: "Être rappelé",
    },
    included: [
      "Analyse du processus et des tâches répétitives",
      "Simplification des étapes avant automatisation",
      "Connexion des outils et mise en place des automatisations validées",
      "Tests, documentation et prise en main",
    ],
    conditions: [
      "Le périmètre est cadré avant le devis",
      "Les accès et licences nécessaires restent sous votre contrôle",
    ],
    notIncluded: [
      "La refonte complète de tous les processus de l’entreprise",
      "Les abonnements et licences facturés par des outils tiers",
    ],
  },
  {
    slug: "marketing-vente",
    name: "Marketing et prospection",
    eyebrow: "Marketing et vente",
    summary:
      "Rendez votre entreprise plus visible, générez davantage de demandes et organisez le suivi de vos prospects.",
    description:
      "Demaa construit une stratégie à partir de votre activité, de vos objectifs et de vos clients, puis exécute les actions de visibilité et de prospection validées avec vous.",
    result:
      "Une acquisition plus régulière, pilotée avec un plan clair et un interlocuteur unique, sans recrutement interne.",
    pricing: {
      mode: "fixed-monthly",
      amountMinor: 95000,
      currency: "EUR",
      heading: "Tarif",
      label: "950 € HT / mois",
      note: "Engagement initial de trois mois, puis reconduction mensuelle.",
    },
    cta: {
      kind: "callback",
      label: "Être rappelé",
    },
    included: [
      "Définition et pilotage de la stratégie marketing et commerciale",
      "Exécution des leviers validés : publicité, contenu, référencement, réseaux sociaux, e-mail ou prospection ciblée",
      "Supports commerciaux utiles au plan retenu",
      "Rapport d’avancement chaque semaine",
      "Point de pilotage mensuel",
      "Espace d’échange dédié avec une réponse sous 24 à 48 heures",
    ],
    conditions: [
      "Engagement initial de trois mois",
      "Facturation mensuelle à échéance fixe",
      "Après la période initiale, reconduction mensuelle sans nouvel engagement",
    ],
    notIncluded: [
      "Le budget publicitaire versé directement aux régies",
      "Les licences d’outils tiers",
      "La création de site ou le développement d’application",
      "Les formations proposées séparément",
    ],
  },
  {
    slug: "assistance-facturation",
    name: "Assistance facturation",
    eyebrow: "Support administratif",
    summary:
      "Déléguez les tâches récurrentes de facturation et préparez une transmission comptable plus fiable.",
    description:
      "Demaa organise un renfort récurrent selon votre volume, vos outils et votre organisation pour fiabiliser la facturation et la transmission comptable.",
    result:
      "Des factures et pièces mieux suivies, avec un cadre de travail clair entre votre entreprise, l’assistance et votre comptable.",
    pricing: {
      mode: "fixed-monthly-hours",
      amountMinor: 50000,
      currency: "EUR",
      heading: "Forfait",
      hourlyRateMinor: 2500,
      includedHours: 20,
      label: "500 € HT / mois",
      note: "20 heures incluses, puis 25 € HT par heure supplémentaire.",
    },
    cta: {
      kind: "callback",
      label: "Être rappelé",
    },
    included: [
      "Cadrage des tâches et du volume à reprendre",
      "Organisation de l’émission et du suivi des factures clients",
      "Organisation de la collecte des factures fournisseurs",
      "Préparation de la transmission vers l’outil ou le cabinet comptable",
    ],
    conditions: [
      "Forfait minimum de 20 heures par mois",
      "L’accès aux outils nécessaires est organisé avec votre accord",
    ],
    notIncluded: [
      "La tenue ou la validation comptable réservée à un professionnel habilité",
      "Les licences et abonnements facturés par des outils tiers",
    ],
  },
  {
    slug: "expert-comptable",
    name: "Expert-comptable",
    eyebrow: "Comptabilité et pilotage",
    summary:
      "Trouvez un cabinet adapté à votre activité, à votre organisation et à votre situation.",
    description:
      "Demaa qualifie votre besoin puis recherche un cabinet pertinent pour votre situation. Vous choisissez librement le professionnel avec lequel poursuivre.",
    result:
      "Un échange avec des cabinets qui comprennent votre contexte, sans parcourir seul des dizaines de profils.",
    pricing: {
      mode: "third-party-starting-monthly",
      amountMinor: 25000,
      currency: "EUR",
      heading: "Honoraires du cabinet",
      label: "À partir de 250 € HT / mois",
      note:
        "Le montant dépend de l’activité, du volume, de la paie et des obligations. La mise en relation Demaa est sans frais.",
    },
    cta: {
      kind: "callback",
      label: "Être rappelé",
    },
    included: [
      "Qualification de votre activité et de votre besoin",
      "Recherche d’un cabinet adapté à votre situation",
      "Mise en relation avec l’interlocuteur retenu",
    ],
    conditions: [
      "Vous restez libre de donner suite ou non",
      "La mission comptable est contractualisée directement avec le cabinet choisi",
    ],
    notIncluded: [
      "La tenue comptable, la paie ou les formalités réalisées par Demaa",
      "La garantie qu’un cabinet acceptera la mission avant qualification",
    ],
  },
] satisfies readonly CanonicalService[]);

const canonicalServices = deepFreeze(
  CANONICAL_SERVICE_SLUGS.map((slug) => {
    const service = canonicalServiceDefinitions.find(
      (definition) => definition.slug === slug,
    );
    if (!service) throw new Error(`Missing canonical service definition: ${slug}`);
    return service;
  }),
);

export function getCanonicalServices(): readonly CanonicalService[] {
  return canonicalServices;
}

export function getCanonicalServiceBySlug(slug: unknown): CanonicalService | null {
  if (typeof slug !== "string") return null;
  return canonicalServices.find((service) => service.slug === slug) ?? null;
}
