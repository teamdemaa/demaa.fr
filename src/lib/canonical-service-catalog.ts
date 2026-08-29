import "server-only";

import {
  HIDDEN_CANONICAL_SERVICE_SLUGS,
  isCanonicalServicePublic,
} from "@/lib/canonical-service-visibility";
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
  "recruter-un-alternant",
] as const;

export type CanonicalServiceSlug = (typeof CANONICAL_SERVICE_SLUGS)[number];

export { HIDDEN_CANONICAL_SERVICE_SLUGS };

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
    mode: "fixed" | "starting";
  }>;
  slug: CanonicalServicePackageSlug;
  summary: string;
}>;

export type CanonicalService = Readonly<{
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
    delivery: "third-party",
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
    delivery: "third-party",
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
    delivery: "third-party",
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
    delivery: "third-party",
    pricing: { mode: "starting", amountMinor: 50000, currency: "EUR", heading: "Tarif", label: "À partir de 500 € HT / mois", note: "Base minimale de 20 heures à 25 € HT / heure. Toute heure supplémentaire est facturée 25 € HT. La professionnelle facture directement son intervention ; la mise en relation Demaa est sans frais." },
    cta: callback,
    included: ["Qualification des tâches, du volume et du rythme", "Recherche d’une assistante administrative adaptée", "Mise en relation et transmission du contexte utile"],
    conditions: ["Un minimum de 20 heures est prévu", "Le périmètre et les modalités sont confirmés avant le démarrage"],
    notIncluded: ["La tenue comptable ou la paie", "Les décisions de gestion prises à votre place"],
  },
  {
    slug: "recruter-un-alternant", name: "Recruter un alternant", eyebrow: "Recrutement et alternance",
    detailHref: "/services/recruter-un-alternant", packages: [],
    summary: "Recevez des profils d’alternants correspondant aux fonctions actuellement proposées par notre école partenaire.",
    description: "Demaa qualifie votre besoin et le transmet à l’école partenaire. L’école vérifie les profils disponibles et vous accompagne dans la mise en relation.",
    result: "Des profils présélectionnés à étudier, sans frais de mise en relation.",
    delivery: "third-party",
    pricing: { mode: "fixed", amountMinor: 0, currency: "EUR", heading: "Tarif", label: "Gratuit", note: "La demande, la présentation des profils et l’accompagnement par l’école sont gratuits. Aucun paiement n’est déclenché." },
    cta: callback,
    included: ["Profil commercial", "Profil administratif polyvalent", "Profil montage vidéo ou création de contenu"],
    conditions: ["Les profils dépendent des disponibilités de l’école", "L’école confirme l’adéquation du profil avec le besoin", "Vous restez libre de poursuivre le recrutement"],
    notIncluded: ["Une garantie de recrutement", "Les coûts liés au contrat d’alternance", "La gestion du contrat réalisée par Demaa"],
  },
  {
    slug: "automatisation-processus", name: "Accompagnement à l’automatisation", eyebrow: "Transfert de compétences sur 2 mois",
    detailHref: "/automatisation",
    summary: "Aidez votre équipe à automatiser les tâches réellement utiles et à maîtriser ses outils au quotidien, avec l’IA lorsqu’elle apporte une vraie valeur.",
    description: "Pendant 2 mois, nous partons des ressaisies, relances et mises à jour qui ralentissent votre équipe. Nous définissons les priorités selon leur complexité, puis allons jusqu’à la mise en service avec la personne qui fera vivre les solutions au quotidien.",
    result: "Moins de tâches répétitives, une information qui circule mieux et une équipe capable de faire vivre les automatisations mises en place.",
    delivery: "demaa",
    pricing: null,
    packages: [
      {
        slug: "automatisation-essentielle",
        name: "Accompagnement à l’automatisation",
        summary: "Deux mois pour mieux organiser votre fonctionnement, réduire les tâches répétitives et rendre votre équipe autonome.",
        pricing: { mode: "fixed", amountMinor: 350000, currency: "EUR", heading: "Forfait", label: "3 500 € HT", note: "Le programme couvre une entreprise, un référent principal et un binôme. Le paiement peut être réparti en trois fois. Les licences et consommations d’outils restent séparées." },
        included: ["Diagnostic et priorisation des tâches chronophages", "Définition d’un périmètre adapté à votre fonctionnement", "Passage du cadrage à la mise en service dans votre environnement de travail", "Tests, documentation et transfert de compétences"],
      },
    ],
    cta: callback,
    included: ["Diagnostic et priorisation des besoins", "Définition d’un périmètre adapté à votre fonctionnement", "Passage du cadrage à la mise en service dans votre environnement de travail", "Tests, documentation et transfert à un référent"],
    conditions: ["Le participant consacre du temps à la mise en pratique entre les séances", "Les accès, licences et consommations restent sous le contrôle de l’entreprise"],
    notIncluded: ["Un développement logiciel ou une intégration complexe hors périmètre", "Les licences, consommations IA et frais d’outils tiers", "La réalisation illimitée d’automatisations à la place de l’équipe"],
  },
  {
    slug: "application-metier", name: "Application métier", eyebrow: "Outil de travail sur mesure",
    detailHref: "/application-metier",
    summary: "Centralisez un processus métier dans une application claire lorsque vos outils actuels ne suffisent plus.",
    description: "Nous clarifions le processus, concevons les écrans utiles et construisons une application métier bornée autour du cas d’usage validé.",
    result: "Un espace de travail partagé qui centralise les données, les étapes et les responsabilités utiles.",
    delivery: "demaa",
    pricing: null,
    packages: [
      {
        slug: "application-metier-essentielle",
        name: "Application métier",
        summary: "Un premier périmètre clairement cadré autour du processus réellement utilisé par votre équipe.",
        pricing: { mode: "starting", amountMinor: 450000, currency: "EUR", heading: "Forfait", label: "À partir de 4 500 € HT", note: "Budget établi sur une base de 700 € HT par jour. Le périmètre, le nombre de jours et le prix total sont confirmés dans un devis avant le démarrage. Aucun dépassement sans validation." },
        included: ["Cadrage du processus et des critères d’acceptation", "Conception des écrans et de la base de données utiles", "Développement et tests du périmètre validé", "Mise en ligne, formation et documentation"],
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
    description: "Demaa qualifie votre besoin puis organise la mise en relation avec un professionnel adapté. Le périmètre éditorial, le rythme, les formats et le circuit de validation sont définis avant la production récurrente.",
    result: "Une mission de communication clairement cadrée et confiée à un professionnel adapté.",
    delivery: "third-party",
    pricing: { mode: "fixed", amountMinor: 80000, currency: "EUR", heading: "Forfait", label: "800 € HT / mois", note: "Le professionnel confirme le périmètre, applique ce tarif dans le cadre défini et facture directement son intervention. Aucun paiement n’est déclenché par la demande." },
    cta: callback,
    included: ["Cadrage éditorial", "Calendrier et production des contenus convenus", "Suivi des validations et publications"],
    conditions: ["Vous restez libre de donner suite", "La mission est contractualisée avec le professionnel choisi", "Les accès restent sous votre contrôle"],
    notIncluded: ["Le budget publicitaire", "La production audiovisuelle lourde non prévue au devis"],
  },
  {
    slug: "publicite-en-ligne", name: "Publicité en ligne", eyebrow: "Acquisition",
    detailHref: "/services/publicite-en-ligne", packages: [],
    summary: "Cadrez, lancez et suivez des campagnes publicitaires alignées avec un objectif commercial précis.",
    description: "Demaa qualifie votre besoin puis organise la mise en relation avec un professionnel adapté. L’offre, la cible, les messages, le budget et les indicateurs sont cadrés avant le lancement des campagnes.",
    result: "Une mission d’acquisition clairement cadrée et confiée à un professionnel adapté.",
    delivery: "third-party",
    pricing: { mode: "fixed", amountMinor: 75000, currency: "EUR", heading: "Forfait", label: "750 € HT / mois", note: "Le professionnel confirme le périmètre, applique ce tarif dans le cadre défini et facture directement son intervention. Le budget média reste séparé. Aucun paiement n’est déclenché par la demande." },
    cta: callback,
    included: ["Cadrage de la cible et des campagnes", "Paramétrage et suivi", "Bilan et optimisations régulières"],
    conditions: ["Vous restez libre de donner suite", "La mission est contractualisée avec le professionnel choisi", "Le budget média est validé séparément", "Les accès aux comptes publicitaires sont fournis"],
    notIncluded: ["Le budget média", "La refonte complète du site ou de l’offre"],
  },
  {
    slug: "prospection-ciblee", name: "Prospection ciblée", eyebrow: "Développement commercial",
    detailHref: "/services/prospection-ciblee", packages: [],
    summary: "Structurez une prospection concentrée sur les bons profils, avec des messages et un suivi cohérents.",
    description: "Demaa qualifie votre besoin puis organise la mise en relation avec un professionnel adapté. La cible, les critères de qualification, les messages et le volume sont cadrés avant la recherche et l’approche des prospects.",
    result: "Une mission de prospection clairement cadrée et confiée à un professionnel adapté.",
    delivery: "third-party",
    pricing: { mode: "fixed", amountMinor: 150000, currency: "EUR", heading: "Forfait", label: "1 500 € HT / mois", note: "Le professionnel confirme le périmètre, applique ce tarif dans le cadre défini et facture directement son intervention. Aucun paiement n’est déclenché par la demande." },
    cta: callback,
    included: ["Définition des critères de ciblage", "Recherche et qualification selon le périmètre", "Messages et suivi des approches"],
    conditions: ["Vous restez libre de donner suite", "La mission est contractualisée avec le professionnel choisi", "Les pratiques autorisées sont validées", "La prise de rendez-vous n’est jamais garantie"],
    notIncluded: ["L’achat de fichiers non conformes", "L’envoi massif sans qualification"],
  },
] satisfies readonly CanonicalService[]);

const canonicalServiceRecords = deepFreeze(CANONICAL_SERVICE_SLUGS.map((slug) => {
  const service = canonicalServiceDefinitions.find((definition) => definition.slug === slug);
  if (!service) throw new Error(`Missing canonical service definition: ${slug}`);
  return service;
}));

const canonicalServices = deepFreeze(
  canonicalServiceRecords.filter(
    (service) => isCanonicalServicePublic(service.slug),
  ),
);

export function getCanonicalServiceRecords(): readonly CanonicalService[] {
  return canonicalServiceRecords;
}

export function getCanonicalServiceRecordBySlug(slug: unknown): CanonicalService | null {
  if (typeof slug !== "string") return null;
  return canonicalServiceRecords.find((service) => service.slug === slug) ?? null;
}

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
