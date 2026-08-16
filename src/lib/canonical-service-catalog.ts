import "server-only";

import { deepFreeze } from "@/lib/registry-contract-utils";

export const CANONICAL_SERVICE_SLUGS = [
  "coach-business",
  "expert-comptable",
  "formalites-entreprise",
  "automatisation-processus",
  "gestion-reseaux-sociaux",
  "publicite-en-ligne",
  "prospection-ciblee",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export type CanonicalService = Readonly<{
  monthlyAccompanimentDiscountEligible: boolean;
  conditions: readonly string[];
  cta: Readonly<{ kind: "callback"; label: "Être recontacté(e)" }>;
  delivery: "demaa" | "third-party";
  description: string;
  eyebrow: string;
  included: readonly string[];
  name: string;
  notIncluded: readonly string[];
  pricing: Readonly<{
    amountMinor?: number;
    currency?: "EUR";
    heading: "Tarif" | "Forfait" | "Honoraires du cabinet";
    label: string;
    mode: "fixed" | "quote" | "starting";
    note: string;
  }>;
  result: string;
  slug: CanonicalServiceSlug;
  summary: string;
}>;

const callback = { kind: "callback", label: "Être recontacté(e)" } as const;

const canonicalServiceDefinitions = deepFreeze([
  {
    slug: "coach-business", name: "Coach business", eyebrow: "Accompagnement du dirigeant",
    summary: "Un accompagnement mensuel pour clarifier vos priorités, prendre les bonnes décisions et avancer dans leur mise en œuvre.",
    description: "Demaa qualifie votre besoin et organise le matching avec un coach business pertinent. L’accompagnement comprend deux rendez-vous individuels de 60 minutes par mois, la préparation des priorités et un suivi entre les rendez-vous sur les sujets travaillés.",
    result: "Un espace de recul régulier pour décider plus vite, garder vos priorités visibles et avancer sans perdre la maîtrise de votre entreprise.",
    delivery: "third-party", monthlyAccompanimentDiscountEligible: false,
    pricing: { mode: "fixed", amountMinor: 75000, currency: "EUR", heading: "Tarif", label: "750 € HT / mois", note: "Deux rendez-vous individuels de 60 minutes et un suivi entre les rendez-vous sont inclus. Aucun paiement n’est déclenché par la demande de rappel." },
    cta: callback,
    included: ["Qualification et matching avec un coach adapté", "Deux rendez-vous individuels de 60 minutes par mois", "Préparation des priorités et suivi entre les rendez-vous"],
    conditions: ["Le matching est validé avant le démarrage", "Le suivi porte sur les sujets et priorités travaillés"],
    notIncluded: ["La réalisation des actions à votre place", "Le suivi de sujets sans lien avec les priorités travaillées"],
  },
  {
    slug: "formalites-entreprise", name: "Formalités d’entreprise", eyebrow: "Création, modification et fermeture",
    summary: "Faites prendre en charge une formalité de création, de modification ou de fermeture par un professionnel adapté.",
    description: "Demaa précise la formalité attendue puis organise une mise en relation avec un professionnel habilité. Vous choisissez librement de poursuivre avec le professionnel retenu.",
    result: "Une formalité clairement cadrée et confiée à un professionnel adapté, sans chercher seul le bon interlocuteur.",
    delivery: "third-party", monthlyAccompanimentDiscountEligible: false,
    pricing: { mode: "quote", heading: "Tarif", label: "Sur devis", note: "Le professionnel confirme son périmètre et son tarif. Il facture directement son intervention ; les frais administratifs et de publication restent séparés." },
    cta: callback,
    included: ["Qualification de la formalité : création, modification ou fermeture", "Recherche d’un professionnel adapté", "Mise en relation et transmission du contexte utile"],
    conditions: ["Vous restez libre de donner suite", "Le professionnel confirme son périmètre avant le démarrage"],
    notIncluded: ["Le conseil juridique individualisé fourni par Demaa", "Les frais administratifs, de greffe ou de publication"],
  },
  {
    slug: "expert-comptable", name: "Expert-comptable", eyebrow: "Comptabilité et pilotage",
    summary: "Trouvez un expert-comptable inscrit à l’Ordre, adapté à votre activité et à votre organisation.",
    description: "Demaa qualifie votre besoin puis organise la mise en relation avec un expert-comptable inscrit à l’Ordre. Vous choisissez librement le professionnel avec lequel poursuivre.",
    result: "Un échange avec des cabinets qui comprennent votre contexte, sans parcourir seul des dizaines de profils.",
    delivery: "third-party", monthlyAccompanimentDiscountEligible: false,
    pricing: { mode: "starting", amountMinor: 25000, currency: "EUR", heading: "Honoraires du cabinet", label: "À partir de 250 € HT / mois", note: "Le montant dépend de l’activité, du volume, de la paie et des obligations. La mise en relation Demaa est sans frais." },
    cta: callback,
    included: ["Qualification de votre activité et de votre besoin", "Recherche d’un cabinet adapté", "Mise en relation avec l’interlocuteur retenu"],
    conditions: ["Vous restez libre de donner suite", "La mission est contractualisée avec le cabinet choisi"],
    notIncluded: ["La tenue comptable ou la paie réalisées par Demaa", "La garantie d’acceptation avant qualification"],
  },
  {
    slug: "automatisation-processus", name: "Automatisation des processus", eyebrow: "Organisation et automatisation",
    summary: "Automatisez les tâches répétitives et reliez vos outils pour réduire les ressaisies, les oublis et les relances manuelles.",
    description: "Le processus est d’abord simplifié, puis les automatisations adaptées sont mises en place dans vos outils.",
    result: "Un processus plus fluide et plus fiable, avec moins d’actions manuelles à contrôler.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: { mode: "fixed", amountMinor: 50000, currency: "EUR", heading: "Tarif", label: "500 € HT / jour", note: "Le nombre de jours et l’enveloppe totale sont validés avant le démarrage." },
    cta: callback,
    included: ["Analyse et simplification du processus", "Connexion des outils et automatisations validées", "Tests, documentation et prise en main"],
    conditions: ["Le périmètre est cadré avant le devis", "Les accès et licences restent sous votre contrôle"],
    notIncluded: ["La refonte de tous les processus", "Les licences d’outils tiers"],
  },
  {
    slug: "gestion-reseaux-sociaux", name: "Gestion des réseaux sociaux", eyebrow: "Communication",
    summary: "Organisez une présence régulière et cohérente sur les réseaux utiles à votre activité.",
    description: "Le périmètre éditorial, le rythme, les formats et le circuit de validation sont définis avant la production récurrente.",
    result: "Une communication suivie, cohérente et compatible avec le temps réellement disponible dans l’entreprise.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: { mode: "fixed", amountMinor: 80000, currency: "EUR", heading: "Forfait", label: "800 € HT / mois", note: "Le périmètre éditorial, le nombre de réseaux et le rythme de publication sont confirmés avant le démarrage." },
    cta: callback,
    included: ["Cadrage éditorial", "Calendrier et production des contenus convenus", "Suivi des validations et publications"],
    conditions: ["Le rythme et les responsabilités sont validés avant démarrage", "Les accès restent sous votre contrôle"],
    notIncluded: ["Le budget publicitaire", "La production audiovisuelle lourde non prévue au devis"],
  },
  {
    slug: "publicite-en-ligne", name: "Publicité en ligne", eyebrow: "Acquisition",
    summary: "Cadrez, lancez et suivez des campagnes publicitaires alignées avec un objectif commercial précis.",
    description: "L’offre, la cible, les messages, le budget et les indicateurs sont cadrés avant le lancement et le pilotage des campagnes.",
    result: "Des campagnes pilotées avec des objectifs, un budget et des décisions d’optimisation lisibles.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: { mode: "fixed", amountMinor: 75000, currency: "EUR", heading: "Forfait", label: "750 € HT / mois", note: "Le budget média facturé par les plateformes reste séparé." },
    cta: callback,
    included: ["Cadrage de la cible et des campagnes", "Paramétrage et suivi", "Bilan et optimisations régulières"],
    conditions: ["Le budget média est validé séparément", "Les accès aux comptes publicitaires sont fournis"],
    notIncluded: ["Le budget média", "La refonte complète du site ou de l’offre"],
  },
  {
    slug: "prospection-ciblee", name: "Prospection ciblée", eyebrow: "Développement commercial",
    summary: "Structurez une prospection concentrée sur les bons profils, avec des messages et un suivi cohérents.",
    description: "La cible, les critères de qualification, les messages et le volume sont cadrés avant la recherche et l’approche des prospects.",
    result: "Une prospection plus ciblée et traçable, avec des critères partagés et des relances organisées.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: { mode: "quote", heading: "Tarif", label: "Sur devis", note: "Le tarif dépend du marché, du volume, des canaux et du niveau de qualification attendu." },
    cta: callback,
    included: ["Définition des critères de ciblage", "Recherche et qualification selon le périmètre", "Messages et suivi des approches"],
    conditions: ["Le périmètre et les pratiques autorisées sont validés", "La prise de rendez-vous n’est jamais garantie"],
    notIncluded: ["L’achat de fichiers non conformes", "L’envoi massif sans qualification"],
  },
] satisfies readonly CanonicalService[]);

const canonicalServices = deepFreeze(CANONICAL_SERVICE_SLUGS.map((slug) => {
  const service = canonicalServiceDefinitions.find((definition) => definition.slug === slug);
  if (!service) throw new Error(`Missing canonical service definition: ${slug}`);
  return service;
}));

export function getCanonicalServices(): readonly CanonicalService[] {
  return canonicalServices;
}

export function getCanonicalServiceBySlug(slug: unknown): CanonicalService | null {
  if (typeof slug !== "string") return null;
  return canonicalServices.find((service) => service.slug === slug) ?? null;
}
