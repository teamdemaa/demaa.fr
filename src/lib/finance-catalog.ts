export type FinanceCategory =
  | "Compte pro & crédit"
  | "Affacturage & BFR"
  | "Leasing & flotte";

export type FinanceFamily =
  | "Compte pro & crédit"
  | "Affacturage & BFR"
  | "Leasing & flotte";

export type DemaaFinanceItem = {
  slug: string;
  name: string;
  family: FinanceFamily;
  category: FinanceCategory;
  shortDescription: string;
  description: string;
  bestFor: string;
  offerHint: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  href: string;
  cta: string;
  partner?: boolean;
};

export const demaaFinanceItems: readonly DemaaFinanceItem[] = [
  {
    slug: "qonto",
    name: "Qonto",
    family: "Compte pro & crédit",
    category: "Compte pro & crédit",
    shortDescription: "Compte pro avec accès à des solutions de crédit et de financement partenaires.",
    description:
      "Qonto combine le pilotage du compte pro avec des options utiles pour financer l'activité : offres de crédits, financement fournisseurs ou solutions de trésorerie via ses partenaires.",
    bestFor:
      "Les indépendants, TPE et sociétés qui veulent un compte pro simple avec une porte d'entrée claire vers des solutions de financement.",
    offerHint: "Compte pro + crédit",
    tags: ["Compte pro", "Crédit", "Fournisseurs"],
    icon: "CreditCard",
    usefulFor: ["Compte pro", "Trésorerie", "Crédit"],
    href: "https://qonto.com/fr",
    cta: "Voir le financement",
    partner: true,
  },
  {
    slug: "defacto",
    name: "Defacto",
    family: "Affacturage & BFR",
    category: "Affacturage & BFR",
    shortDescription: "Financement BFR, factures, stock et fournisseurs avec un process digital.",
    description:
      "Defacto est un acteur fintech du financement entreprise orienté cash court terme : financement de créances, de stock, de supply chain et autres besoins de trésorerie avec une approche intégrée et rapide.",
    bestFor:
      "Les entreprises qui ont besoin d'accélérer leur cash, financer un décalage d'encaissement ou soutenir leur croissance sans alourdir un process bancaire classique.",
    offerHint: "Startup financement",
    tags: ["BFR", "Affacturage", "Stock"],
    icon: "BadgeEuro",
    usefulFor: ["Trésorerie", "Factures", "Croissance"],
    href: "https://www.getdefacto.com/",
    cta: "Voir le financement",
  },
  {
    slug: "karmen",
    name: "Karmen",
    family: "Affacturage & BFR",
    category: "Affacturage & BFR",
    shortDescription: "Prêt court terme et affacturage digital pour financer le cycle d'exploitation.",
    description:
      "Karmen propose des solutions de prêt court terme et d'affacturage pour aider les PME à financer leur besoin en fonds de roulement, leurs factures clients ou leur stock avec un parcours plus fluide.",
    bestFor:
      "Les PME qui veulent une solution plus rapide qu'un circuit bancaire traditionnel pour absorber un pic d'activité ou un trou de trésorerie.",
    offerHint: "Startup financement",
    tags: ["Prêt", "Affacturage", "BFR"],
    icon: "TrendingUp",
    usefulFor: ["BFR", "Factures", "Stock"],
    href: "https://www.karmen.io/",
    cta: "Voir le financement",
  },
  {
    slug: "factofrance",
    name: "Factofrance",
    family: "Affacturage & BFR",
    category: "Affacturage & BFR",
    shortDescription: "Affacturage et financement de factures pour TPE et PME.",
    description:
      "Factofrance est un acteur reconnu de l'affacturage pour financer les factures clients, réduire les délais d'encaissement et mieux lisser le besoin de trésorerie.",
    bestFor:
      "Les entreprises qui facturent déjà régulièrement et veulent transformer plus vite leurs créances en cash disponible.",
    offerHint: "Affacturage",
    tags: ["Affacturage", "Créances", "Encaissement"],
    icon: "FileSearch",
    usefulFor: ["Factures", "Cash", "Créances"],
    href: "https://www.factofrance.com/fr/index.html",
    cta: "Voir le financement",
  },
  {
    slug: "bibby-factor",
    name: "Bibby Factor",
    family: "Affacturage & BFR",
    category: "Affacturage & BFR",
    shortDescription: "Affacturage souple pour TPE et PME, y compris sur des cas plus atypiques.",
    description:
      "Bibby Factor France propose des solutions d'affacturage pour financer l'activité à partir des factures clients, avec une approche réactive utile pour les secteurs terrain, les situations complexes ou les besoins de cash rapides.",
    bestFor:
      "Les TPE et PME qui veulent accélérer leurs encaissements, sécuriser leur trésorerie ou financer des cycles d'exploitation parfois plus difficiles à faire rentrer dans les cases.",
    offerHint: "Affacturage PME",
    tags: ["Affacturage", "TPE/PME", "Trésorerie"],
    icon: "Handshake",
    usefulFor: ["Factures", "BFR", "Encaissements"],
    href: "https://www.bibbyfactor.fr/",
    cta: "Voir le financement",
  },
  {
    slug: "ayvens",
    name: "Ayvens",
    family: "Leasing & flotte",
    category: "Leasing & flotte",
    shortDescription: "Location longue durée et gestion de flotte pour véhicules professionnels.",
    description:
      "Ayvens couvre les besoins de LLD, utilitaires, flotte et mobilité d'entreprise pour financer l'usage d'un véhicule ou d'un parc sans immobiliser trop de trésorerie.",
    bestFor:
      "Les entreprises terrain, de transport, de livraison ou de service qui ont besoin d'un véhicule pro sans achat comptant.",
    offerHint: "LLD pro",
    tags: ["Leasing", "LLD", "Flotte"],
    icon: "Car",
    usefulFor: ["Véhicules", "Flotte", "Mobilité"],
    href: "https://www.ayvens.com/fr-fr/",
    cta: "Voir le financement",
  },
  {
    slug: "arval",
    name: "Arval",
    family: "Leasing & flotte",
    category: "Leasing & flotte",
    shortDescription: "Location longue durée et gestion de flotte pour véhicules d'entreprise.",
    description:
      "Arval est un acteur reconnu de la location longue durée et de la gestion de flotte, utile pour financer des véhicules professionnels sans immobiliser la trésorerie et mieux structurer la mobilité de l'entreprise.",
    bestFor:
      "Les entreprises qui ont besoin de véhicules de fonction, d'utilitaires ou d'une vraie logique flotte, que ce soit en TPE, PME ou structure de services.",
    offerHint: "LLD & flotte",
    tags: ["Leasing", "Flotte", "Utilitaires"],
    icon: "CarFront",
    usefulFor: ["Flotte", "Utilitaires", "Mobilité"],
    href: "https://www.arval.fr/",
    cta: "Voir le financement",
  },
] as const;

export const financeFamilies = Array.from(
  new Set(demaaFinanceItems.map((item) => item.family)),
) as FinanceFamily[];

const financeBySlug = Object.fromEntries(
  demaaFinanceItems.map((item) => [item.slug, item]),
) as Record<string, DemaaFinanceItem>;

export function getDemaaFinanceItems(): DemaaFinanceItem[] {
  return [...demaaFinanceItems];
}

export function getDemaaFinanceBySlug(slug: string): DemaaFinanceItem | null {
  return financeBySlug[slug] ?? null;
}
