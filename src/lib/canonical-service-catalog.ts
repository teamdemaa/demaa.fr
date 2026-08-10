import "server-only";

import { deepFreeze } from "@/lib/registry-contract-utils";

export const CANONICAL_SERVICE_SLUGS = [
  "automatisation-processus",
  "expert-comptable",
  "formalites-juridiques",
  "sous-traitance-formalites-juridiques",
  "marketing-vente",
  "assistance-facturation",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

type CallbackCta = Readonly<{
  kind: "callback";
  label: "Être recontacté(e)";
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
      mode: "fixed-once";
      amountMinor: 55000;
      currency: "EUR";
      heading: "Forfait";
      label: "550 € HT";
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
    }>
  | Readonly<{
      mode: "third-party-quote";
      heading: "Tarif";
      label: "Sur devis";
      note: string;
    }>;

export type CanonicalService = Readonly<{
  slug: CanonicalServiceSlug;
  name: string;
  eyebrow: string;
  summary: string;
  description: string;
  result: string;
  delivery: "demaa" | "third-party";
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
    delivery: "demaa",
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
      label: "Être recontacté(e)",
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
    slug: "expert-comptable",
    name: "Expert-comptable",
    eyebrow: "Comptabilité et pilotage",
    summary:
      "Trouvez un cabinet adapté à votre activité, à votre organisation et à votre situation.",
    description:
      "Demaa qualifie votre besoin puis recherche un cabinet pertinent pour votre situation. Vous choisissez librement le professionnel avec lequel poursuivre.",
    result:
      "Un échange avec des cabinets qui comprennent votre contexte, sans parcourir seul des dizaines de profils.",
    delivery: "third-party",
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
      label: "Être recontacté(e)",
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
  {
    slug: "formalites-juridiques",
    name: "Formalités juridiques",
    eyebrow: "Création, modification et fermeture",
    summary:
      "Faites prendre en charge les formalités de création, de modification ou de fermeture de votre entreprise.",
    description:
      "Demaa précise votre besoin puis vous oriente vers un professionnel habilité. La mission, le tarif et les délais sont confirmés directement avec lui avant toute démarche.",
    result:
      "Une formalité cadrée et confiée au bon interlocuteur, avec un périmètre et des délais clairement annoncés.",
    delivery: "third-party",
    pricing: {
      mode: "third-party-quote",
      heading: "Tarif",
      label: "Sur devis",
      note:
        "Le professionnel confirme son tarif selon la formalité, la structure et les pièces à traiter.",
    },
    cta: {
      kind: "callback",
      label: "Être recontacté(e)",
    },
    included: [
      "Qualification de la formalité à réaliser",
      "Orientation vers un professionnel adapté",
      "Mise en relation et transmission du contexte utile",
    ],
    conditions: [
      "La mission est acceptée et contractualisée directement avec le professionnel",
      "Le périmètre dépend de votre situation et des pièces disponibles",
    ],
    notIncluded: [
      "Le conseil juridique individualisé réalisé par Demaa",
      "Les frais administratifs ou de publication facturés séparément",
    ],
  },
  {
    slug: "sous-traitance-formalites-juridiques",
    name: "Sous-traitance de formalités juridiques",
    eyebrow: "Renfort pour les professionnels",
    summary:
      "Déléguez l’exécution des formalités d’entreprise de vos clients dans un cadre défini et confidentiel.",
    description:
      "Demaa qualifie le volume et le type de dossiers, puis facilite la mise en relation avec un prestataire spécialisé pouvant intervenir de manière confidentielle ou en marque blanche.",
    result:
      "Une capacité de production supplémentaire pour absorber les formalités sans désorganiser le cabinet ou l’étude.",
    delivery: "third-party",
    pricing: {
      mode: "third-party-quote",
      heading: "Tarif",
      label: "Sur devis",
      note:
        "Le prestataire confirme son tarif selon les formalités, le volume et les modalités de collaboration.",
    },
    cta: {
      kind: "callback",
      label: "Être recontacté(e)",
    },
    included: [
      "Qualification du volume et des formalités à déléguer",
      "Mise en relation avec un prestataire spécialisé",
      "Cadrage de la confidentialité et du fonctionnement attendu",
    ],
    conditions: [
      "Service réservé aux professionnels traitant les dossiers de leurs clients",
      "La mission est contractualisée directement avec le prestataire retenu",
    ],
    notIncluded: [
      "Le conseil juridique ou la validation professionnelle réalisés par Demaa",
      "Une délégation automatique avant validation du périmètre et de la confidentialité",
    ],
  },
  {
    slug: "marketing-vente",
    name: "Plan marketing et prospection",
    eyebrow: "Marketing et vente",
    summary:
      "Clarifiez votre cible, votre positionnement et les actions à mener pour développer votre activité pendant les 90 prochains jours.",
    description:
      "Demaa analyse votre offre et vos actions actuelles, puis construit avec vous un plan marketing et commercial concentré sur les canaux les plus pertinents.",
    result:
      "Une stratégie priorisée et directement exploitable, avec un rythme d’action et des indicateurs simples à suivre.",
    delivery: "demaa",
    pricing: {
      mode: "fixed-once",
      amountMinor: 55000,
      currency: "EUR",
      heading: "Forfait",
      label: "550 € HT",
      note: "Paiement unique pour le cadrage, l’atelier et la restitution du plan.",
    },
    cta: {
      kind: "callback",
      label: "Être recontacté(e)",
    },
    included: [
      "Analyse de l’offre, des clients et des actions actuelles",
      "Cible prioritaire, positionnement et message principal",
      "Choix d’un ou deux canaux prioritaires",
      "Plan d’action sur 90 jours",
      "Rythme de prospection, de communication et indicateurs essentiels",
      "Atelier de travail puis restitution du plan",
    ],
    conditions: [
      "Les informations utiles sont transmises avant l’atelier",
      "Le forfait porte sur la stratégie et le plan, pas sur leur exécution récurrente",
    ],
    notIncluded: [
      "La gestion des campagnes publicitaires et leur budget",
      "La production récurrente de contenus ou l’animation des réseaux sociaux",
      "Le référencement, la création de site ou l’installation d’un CRM",
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
    delivery: "demaa",
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
      label: "Être recontacté(e)",
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
