import "server-only";

import { deepFreeze } from "@/lib/registry-contract-utils";

export const CANONICAL_SERVICE_SLUGS = [
  "automatisation-processus",
  "application-metier",
  "coach-business",
  "expert-comptable",
  "assistance-administrative",
  "formalites-entreprise",
  "gestion-reseaux-sociaux",
  "publicite-en-ligne",
  "prospection-ciblee",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export const CANONICAL_SERVICE_PACKAGE_SLUGS = [
  "automatisation-essentielle",
  "automatisation-avancee-ia",
  "application-metier-essentielle",
  "application-metier-avancee",
] as const;

export type CanonicalServicePackageSlug =
  (typeof CANONICAL_SERVICE_PACKAGE_SLUGS)[number];

export type CanonicalServicePricing = Readonly<{
  amountMinor?: number;
  currency?: "EUR";
  heading: "Tarif" | "Forfait" | "Honoraires du cabinet";
  label: string;
  mode: "fixed" | "quote" | "starting";
  note: string;
}>;

export type CanonicalServicePackage = Readonly<{
  included: readonly string[];
  name: string;
  pricing: CanonicalServicePricing & Readonly<{
    amountMinor: number;
    currency: "EUR";
    mode: "fixed";
  }>;
  slug: CanonicalServicePackageSlug;
  summary: string;
}>;

export type CanonicalService = Readonly<{
  monthlyAccompanimentDiscountEligible: boolean;
  conditions: readonly string[];
  cta: Readonly<{ kind: "callback"; label: "Envoyer ma demande" }>;
  delivery: "demaa" | "third-party";
  description: string;
  detailHref: string;
  eyebrow: string;
  included: readonly string[];
  name: string;
  notIncluded: readonly string[];
  packages: readonly CanonicalServicePackage[];
  pricing: CanonicalServicePricing | null;
  result: string;
  slug: CanonicalServiceSlug;
  summary: string;
}>;

const callback = { kind: "callback", label: "Envoyer ma demande" } as const;

const canonicalServiceDefinitions = deepFreeze([
  {
    slug: "coach-business", name: "Coach business", eyebrow: "Accompagnement du dirigeant",
    detailHref: "/services/coach-business", packages: [],
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
    detailHref: "/services/formalites-entreprise", packages: [],
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
    detailHref: "/services/expert-comptable", packages: [],
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
    slug: "assistance-administrative", name: "Assistante administrative", eyebrow: "Support administratif",
    detailHref: "/services/assistance-administrative", packages: [],
    summary: "Trouvez une assistante administrative adaptée pour déléguer des tâches clairement définies et retrouver du temps.",
    description: "Demaa qualifie les tâches, le volume et le rythme attendus, puis organise la mise en relation avec une assistante administrative adaptée. Vous choisissez librement de poursuivre avec la professionnelle retenue.",
    result: "Un renfort administratif cadré, avec des responsabilités et un rythme clairement définis avant le démarrage.",
    delivery: "third-party", monthlyAccompanimentDiscountEligible: false,
    pricing: { mode: "quote", heading: "Tarif", label: "Sur devis", note: "La professionnelle confirme son périmètre et son tarif, puis facture directement son intervention. La mise en relation Demaa est sans frais." },
    cta: callback,
    included: ["Qualification des tâches, du volume et du rythme", "Recherche d’une assistante administrative adaptée", "Mise en relation et transmission du contexte utile"],
    conditions: ["Vous restez libre de donner suite", "Le périmètre et les modalités sont confirmés avant le démarrage"],
    notIncluded: ["La tenue comptable ou la paie", "Les décisions de gestion prises à votre place"],
  },
  {
    slug: "automatisation-processus", name: "Automatisation des processus et IA", eyebrow: "Organisation, automatisation et IA",
    detailHref: "/services/automatisation-processus",
    summary: "Réduisez les tâches manuelles avec des workflows fiables et des usages IA ciblés, intégrés à vos outils existants.",
    description: "Nous simplifions d’abord le processus, automatisons les étapes répétitives, puis intégrons l’IA uniquement lorsqu’elle apporte un gain concret avec des points de contrôle humains.",
    result: "Un processus plus fluide, plus fiable et documenté, avec moins d’actions manuelles à contrôler.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: null,
    packages: [
      {
        slug: "automatisation-essentielle",
        name: "Automatisation essentielle",
        summary: "Un processus simple et déterministe, connecté à vos outils courants.",
        pricing: { mode: "fixed", amountMinor: 150000, currency: "EUR", heading: "Forfait", label: "1 500 € HT", note: "Prix fixe dans les limites du forfait validé avant le démarrage." },
        included: ["Un processus", "Jusqu’à deux outils standards", "Jusqu’à cinq étapes métier déterministes", "Tests, documentation et prise en main"],
      },
      {
        slug: "automatisation-avancee-ia",
        name: "Automatisation avancée + IA",
        summary: "Un processus plus riche avec conditions, API ou usage IA ciblé et contrôlé.",
        pricing: { mode: "fixed", amountMinor: 300000, currency: "EUR", heading: "Forfait", label: "3 000 € HT", note: "Prix fixe dans les limites du forfait validé avant le démarrage." },
        included: ["Un processus", "Jusqu’à quatre outils standards", "Jusqu’à dix étapes métier", "Une API documentée ou un usage IA ciblé avec validation humaine", "Gestion des erreurs, tests, documentation et prise en main"],
      },
    ],
    cta: callback,
    included: ["Analyse et priorisation du processus", "Intégrations, automatisations et usages IA validés", "Tests, points de contrôle humains, documentation et prise en main"],
    conditions: ["Le périmètre et les critères d’acceptation sont validés avant le démarrage", "Les accès, licences et consommations restent sous votre contrôle"],
    notIncluded: ["La refonte indistincte de tous les processus", "Les licences, consommations IA et frais d’outils tiers", "Une autonomie totale de l’IA ou un résultat métier garanti"],
  },
  {
    slug: "application-metier", name: "Application métier", eyebrow: "Outil de travail sur mesure",
    detailHref: "/sur-mesure",
    summary: "Centralisez un processus métier dans une application claire lorsque vos outils actuels ne suffisent plus.",
    description: "Nous clarifions le processus, concevons les écrans utiles et construisons une application métier bornée autour du cas d’usage validé.",
    result: "Un espace de travail partagé qui centralise les données, les étapes et les responsabilités utiles.",
    delivery: "demaa", monthlyAccompanimentDiscountEligible: true,
    pricing: null,
    packages: [
      {
        slug: "application-metier-essentielle",
        name: "Application métier essentielle",
        summary: "Un cas d’usage central, une base et les écrans indispensables pour travailler.",
        pricing: { mode: "fixed", amountMinor: 450000, currency: "EUR", heading: "Forfait", label: "4 500 € HT", note: "Prix fixe dans les limites du forfait validé avant le démarrage." },
        included: ["Un processus et une base de données", "Jusqu’à quatre écrans", "Un rôle utilisateur principal et un rôle administrateur", "Authentification standard et automatisations simples", "Mise en ligne, formation et trente jours de correction des anomalies"],
      },
      {
        slug: "application-metier-avancee",
        name: "Application métier avancée",
        summary: "Plusieurs parcours et rôles avec logique métier et intégration documentée.",
        pricing: { mode: "fixed", amountMinor: 750000, currency: "EUR", heading: "Forfait", label: "7 500 € HT", note: "Prix fixe dans les limites du forfait validé avant le démarrage." },
        included: ["Jusqu’à deux processus et une base de données", "Jusqu’à huit écrans", "Deux à trois rôles", "Logique métier avancée, automatisations et une intégration documentée", "Mise en ligne, formation, documentation et trente jours de correction des anomalies"],
      },
    ],
    cta: callback,
    included: ["Cadrage du processus et des critères d’acceptation", "Conception, développement et tests du périmètre validé", "Mise en ligne, formation et documentation"],
    conditions: ["Les données, accès et délais de validation sont confirmés avant le démarrage", "Une évolution de périmètre fait l’objet d’un devis séparé"],
    notIncluded: ["Migration massive de données ou intégration ERP complexe", "Application mobile native, moteur critique ou droits très fins", "Licences, hébergements spécifiques et frais externes"],
  },
  {
    slug: "gestion-reseaux-sociaux", name: "Gestion des réseaux sociaux", eyebrow: "Communication",
    detailHref: "/services/gestion-reseaux-sociaux", packages: [],
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
    detailHref: "/services/publicite-en-ligne", packages: [],
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
    detailHref: "/services/prospection-ciblee", packages: [],
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

export function getCanonicalServicePackage(
  service: CanonicalService,
  packageSlug: unknown,
): CanonicalServicePackage | null {
  if (typeof packageSlug !== "string") return null;
  return service.packages.find((servicePackage) => servicePackage.slug === packageSlug) ?? null;
}

export function getCanonicalServiceDetailRouteParams() {
  return canonicalServices
    .filter((service) => service.detailHref === `/services/${service.slug}`)
    .map((service) => ({ slug: service.slug }));
}
