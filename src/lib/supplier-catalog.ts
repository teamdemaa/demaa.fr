export type SupplierCategory =
  | "Banque"
  | "Assurance"
  | "Mutuelle"
  | "Matériaux"
  | "Équipement"
  | "Grossiste"
  | "Paiement"
  | "Téléphonie"
  | "Énergie"
  | "Transport"
  | "Support";

export type SupplierFamily =
  | "Finance & protection"
  | "Équipement & exploitation";

export const supplierFamilyDescriptions: Record<SupplierFamily, string> = {
  "Finance & protection":
    "Banques, paiements, assurances, mutuelles, avantages salariés et protections utiles pour sécuriser et piloter l'activité.",
  "Équipement & exploitation":
    "Matériaux, grossistes, équipements, énergie, téléphonie, véhicules et moyens utiles pour faire tourner l'activité au quotidien.",
};

export type SupplierCta = "Voir le fournisseur" | "Demander une mise en relation" | "Comparer les options";

export type DemaaSupplier = {
  slug: string;
  name: string;
  family: SupplierFamily;
  category: SupplierCategory;
  shortDescription: string;
  description: string;
  bestFor: string;
  offerHint: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  href: string;
  cta: SupplierCta;
  partner?: boolean;
};

export const demaaSuppliers: readonly DemaaSupplier[] = [
  {
    slug: "assurance-pro",
    name: "Assurance pro",
    family: "Finance & protection",
    category: "Assurance",
    shortDescription: "RC pro, multirisque, local, flotte ou décennale.",
    description:
      "Comparer les protections indispensables selon l'activité, le local, les salariés, les véhicules et les risques métier.",
    bestFor: "Toutes les activités exposées à un risque client, local, matériel ou chantier.",
    offerHint: "Comparaison partenaire",
    tags: ["RC Pro", "Multirisque", "Décennale"],
    icon: "Shield",
    usefulFor: ["Protection", "Obligations", "Chantier", "Local"],
    href: "/annuaire-fournisseurs?q=assurance",
    cta: "Comparer les options",
    partner: true,
  },
  {
    slug: "qonto",
    name: "Qonto",
    family: "Finance & protection",
    category: "Banque",
    shortDescription: "Compte pro, cartes, virements et justificatifs.",
    description:
      "Compte professionnel pour suivre les dépenses, cartes, virements, justificatifs et la gestion financière courante.",
    bestFor: "Les indépendants, TPE et sociétés qui veulent un compte pro simple à piloter.",
    offerHint: "Offre partenaire à venir",
    tags: ["Compte pro", "Cartes", "Dépenses"],
    icon: "CreditCard",
    usefulFor: ["Compte pro", "Dépenses", "Justificatifs"],
    href: "https://qonto.com/fr",
    cta: "Voir le fournisseur",
    partner: true,
  },
  {
    slug: "revolut-business",
    name: "Revolut Business",
    family: "Finance & protection",
    category: "Banque",
    shortDescription: "Compte business, cartes et paiements internationaux.",
    description:
      "Compte pro orienté paiements internationaux, cartes d'équipe, devises et dépenses multi-pays.",
    bestFor: "Les activités avec paiements internationaux, achats en devises ou équipes mobiles.",
    offerHint: "-10% sur la plateforme",
    tags: ["Compte pro", "International", "Cartes"],
    icon: "CreditCard",
    usefulFor: ["International", "Cartes", "Dépenses"],
    href: "https://www.revolut.com/business/",
    cta: "Voir le fournisseur",
    partner: true,
  },
  {
    slug: "wise-business",
    name: "Wise Business",
    family: "Finance & protection",
    category: "Banque",
    shortDescription: "Paiements, virements et devises à l'international.",
    description:
      "Compte international pour paiements, virements, devises et frais réduits sur opérations multi-pays.",
    bestFor: "Les entreprises qui paient des prestataires ou fournisseurs à l'étranger.",
    offerHint: "À vérifier",
    tags: ["Compte pro", "International", "Devises"],
    icon: "Globe2",
    usefulFor: ["International", "Devises", "Prestataires"],
    href: "https://wise.com/business/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "shine",
    name: "Shine",
    family: "Finance & protection",
    category: "Banque",
    shortDescription: "Compte pro avec facturation et aides administratives.",
    description:
      "Compte pro en ligne avec cartes, facturation, justificatifs, aides administratives et suivi indépendant/TPE.",
    bestFor: "Les indépendants et petites entreprises qui veulent simplifier banque et administratif.",
    offerHint: "À vérifier",
    tags: ["Compte pro", "Indépendant", "Facturation"],
    icon: "CreditCard",
    usefulFor: ["Indépendants", "Facturation", "Administratif"],
    href: "https://www.shine.fr/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "alan",
    name: "Alan",
    family: "Finance & protection",
    category: "Mutuelle",
    shortDescription: "Mutuelle santé et prévention pour les équipes.",
    description:
      "Mutuelle et services santé pour simplifier la couverture des équipes et le suivi RH.",
    bestFor: "Les entreprises avec salariés qui veulent une mutuelle claire et simple à gérer.",
    offerHint: "Offre partenaire à venir",
    tags: ["Mutuelle", "Santé", "RH"],
    icon: "HeartPulse",
    usefulFor: ["Salariés", "Santé", "RH"],
    href: "https://alan.com/fr-fr",
    cta: "Voir le fournisseur",
    partner: true,
  },
  {
    slug: "swile",
    name: "Swile",
    family: "Finance & protection",
    category: "Support",
    shortDescription: "Titres-resto et avantages salariés.",
    description:
      "Solution d'avantages salariés : titres-resto, avantages d'équipe et gestion sociale du quotidien.",
    bestFor: "Les entreprises qui structurent leurs avantages salariés.",
    offerHint: "Offre partenaire à venir",
    tags: ["Avantages", "Titres-resto", "RH"],
    icon: "Gift",
    usefulFor: ["Salariés", "Avantages", "Restauration"],
    href: "https://www.swile.co/fr",
    cta: "Voir le fournisseur",
    partner: true,
  },
  {
    slug: "plateforme-du-batiment",
    name: "Plateforme du Bâtiment",
    family: "Équipement & exploitation",
    category: "Matériaux",
    shortDescription: "Matériaux, outillage et approvisionnement BTP.",
    description:
      "Distributeur professionnel pour artisans et entreprises du bâtiment : matériaux, outillage, retrait et conditions pro.",
    bestFor: "Les artisans et entreprises BTP qui doivent s'approvisionner vite et régulièrement.",
    offerHint: "Conditions pro à vérifier",
    tags: ["BTP", "Matériaux", "Outillage"],
    icon: "Building2",
    usefulFor: ["Bâtiment", "Approvisionnement", "Chantier"],
    href: "https://www.laplateforme.com/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "point-p",
    name: "Point.P",
    family: "Équipement & exploitation",
    category: "Matériaux",
    shortDescription: "Matériaux de construction et négoce bâtiment.",
    description:
      "Négoce de matériaux pour construction, rénovation, gros oeuvre, second oeuvre et livraison chantier.",
    bestFor: "Les entreprises BTP avec besoins réguliers en matériaux et livraison.",
    offerHint: "Conditions pro à vérifier",
    tags: ["BTP", "Matériaux", "Livraison"],
    icon: "Boxes",
    usefulFor: ["Bâtiment", "Matériaux", "Livraison"],
    href: "https://www.pointp.fr/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "kiloutou",
    name: "Kiloutou",
    family: "Équipement & exploitation",
    category: "Équipement",
    shortDescription: "Location de matériel professionnel.",
    description:
      "Location de matériel et équipements pour chantier, manutention, événementiel, nettoyage ou travaux ponctuels.",
    bestFor: "Les métiers qui ont besoin de matériel sans l'acheter.",
    offerHint: "Conditions pro à vérifier",
    tags: ["Location", "Matériel", "Chantier"],
    icon: "Wrench",
    usefulFor: ["Location", "Chantier", "Équipement"],
    href: "https://www.kiloutou.fr/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "wurth",
    name: "Würth",
    family: "Équipement & exploitation",
    category: "Équipement",
    shortDescription: "Consommables, visserie, outillage et EPI.",
    description:
      "Fournisseur professionnel pour outillage, visserie, consommables, produits techniques et équipements de protection.",
    bestFor: "Les artisans, ateliers, garages, mainteneurs et entreprises terrain.",
    offerHint: "Conditions pro à vérifier",
    tags: ["Outillage", "Consommables", "EPI"],
    icon: "Hammer",
    usefulFor: ["Artisanat", "Atelier", "Sécurité"],
    href: "https://eshop.wurth.fr/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "rexel",
    name: "Rexel",
    family: "Équipement & exploitation",
    category: "Matériaux",
    shortDescription: "Matériel électrique et solutions énergie.",
    description:
      "Distributeur de matériel électrique pour installateurs, maintenance, rénovation, énergie et équipements professionnels.",
    bestFor: "Les électriciens, mainteneurs, entreprises BTP et sites avec besoins électriques.",
    offerHint: "Conditions pro à vérifier",
    tags: ["Électricité", "BTP", "Énergie"],
    icon: "Zap",
    usefulFor: ["Électricité", "Maintenance", "Bâtiment"],
    href: "https://www.rexel.fr/",
    cta: "Voir le fournisseur",
  },
  {
    slug: "grossiste-alimentaire",
    name: "Grossiste alimentaire",
    family: "Équipement & exploitation",
    category: "Grossiste",
    shortDescription: "Approvisionnement alimentaire professionnel.",
    description:
      "Sélection de grossistes alimentaires selon le type de restauration, les volumes, la fraîcheur et les délais de livraison.",
    bestFor: "Restaurants, traiteurs, boulangeries, snacks, commerces alimentaires et dark kitchens.",
    offerHint: "Sélection à venir",
    tags: ["Restauration", "Alimentaire", "Livraison"],
    icon: "Utensils",
    usefulFor: ["Restauration", "Stock", "Frais"],
    href: "/annuaire-fournisseurs?q=grossiste",
    cta: "Demander une mise en relation",
    partner: true,
  },
  {
    slug: "fournisseur-boissons",
    name: "Fournisseur boissons",
    family: "Équipement & exploitation",
    category: "Grossiste",
    shortDescription: "Boissons, brasserie, café et bar.",
    description:
      "Fournisseurs de boissons, café, cave, brasserie ou softs pour bars, restaurants et événements.",
    bestFor: "Bars, cafés, restaurants, discothèques, traiteurs et événementiel.",
    offerHint: "Sélection à venir",
    tags: ["Boissons", "Bar", "Restauration"],
    icon: "CupSoda",
    usefulFor: ["Bar", "Restaurant", "Événementiel"],
    href: "/annuaire-fournisseurs?q=boissons",
    cta: "Demander une mise en relation",
    partner: true,
  },
  {
    slug: "emballages-pro",
    name: "Emballages pro",
    family: "Équipement & exploitation",
    category: "Grossiste",
    shortDescription: "Emballages, sacs, cartons et consommables.",
    description:
      "Fournisseurs d'emballages pour livraison, vente à emporter, e-commerce, boutique et expédition.",
    bestFor: "Restaurants, commerces, e-commerce, boutiques et artisans.",
    offerHint: "Sélection à venir",
    tags: ["Emballage", "Livraison", "E-commerce"],
    icon: "Package",
    usefulFor: ["Livraison", "Boutique", "E-commerce"],
    href: "/annuaire-fournisseurs?q=emballages",
    cta: "Demander une mise en relation",
    partner: true,
  },
  {
    slug: "terminal-paiement",
    name: "Terminal de paiement",
    family: "Finance & protection",
    category: "Paiement",
    shortDescription: "Encaissement, TPE et paiement en magasin.",
    description:
      "Solutions de paiement pour encaisser en boutique, sur place, en mobilité ou pendant les interventions.",
    bestFor: "Commerces, restaurants, artisans, santé, beauté, livraison et événementiel.",
    offerHint: "Comparaison à venir",
    tags: ["Paiement", "TPE", "Caisse"],
    icon: "BadgeEuro",
    usefulFor: ["Encaissement", "Commerce", "Mobilité"],
    href: "/annuaire-fournisseurs?q=paiement",
    cta: "Comparer les options",
    partner: true,
  },
  {
    slug: "telephonie-pro",
    name: "Téléphonie pro",
    family: "Équipement & exploitation",
    category: "Téléphonie",
    shortDescription: "Forfaits, numéros pro et standard simple.",
    description:
      "Fournisseurs téléphonie et internet pour gérer les appels, numéros professionnels, équipes terrain et standard.",
    bestFor: "Toutes les activités avec appels clients, équipes mobiles ou besoin de ligne professionnelle.",
    offerHint: "Bon plan à venir",
    tags: ["Téléphonie", "Internet", "Standard"],
    icon: "Phone",
    usefulFor: ["Appels", "Équipe", "Standard"],
    href: "/annuaire-fournisseurs?q=téléphonie",
    cta: "Comparer les options",
    partner: true,
  },
  {
    slug: "energie-pro",
    name: "Énergie pro",
    family: "Équipement & exploitation",
    category: "Énergie",
    shortDescription: "Électricité, gaz et contrats professionnels.",
    description:
      "Comparer les contrats énergie selon local, cuisine, froid, machines, atelier ou forte consommation.",
    bestFor: "Restaurants, commerces, ateliers, laveries, boulangeries et locaux professionnels.",
    offerHint: "Comparaison à venir",
    tags: ["Énergie", "Électricité", "Gaz"],
    icon: "Zap",
    usefulFor: ["Local", "Machines", "Froid"],
    href: "/annuaire-fournisseurs?q=énergie",
    cta: "Comparer les options",
    partner: true,
  },
  {
    slug: "leasing-vehicule",
    name: "Leasing véhicule",
    family: "Équipement & exploitation",
    category: "Transport",
    shortDescription: "Véhicule, utilitaire, flotte ou mobilité pro.",
    description:
      "Solutions d'achat, location longue durée, leasing ou flotte pour véhicules professionnels.",
    bestFor: "Artisans, livraison, transport, services à domicile et équipes terrain.",
    offerHint: "Sélection à venir",
    tags: ["Véhicule", "Leasing", "Utilitaire"],
    icon: "Car",
    usefulFor: ["Mobilité", "Livraison", "Terrain"],
    href: "/annuaire-fournisseurs?q=véhicule",
    cta: "Comparer les options",
    partner: true,
  },
  {
    slug: "hygiene-nettoyage",
    name: "Hygiène & nettoyage",
    family: "Équipement & exploitation",
    category: "Support",
    shortDescription: "Produits d'hygiène, entretien et consommables.",
    description:
      "Fournisseurs de produits d'entretien, hygiène, consommables, désinfection et matériel de nettoyage.",
    bestFor: "Restaurants, santé, beauté, commerces, bureaux, crèches et lieux recevant du public.",
    offerHint: "Sélection à venir",
    tags: ["Hygiène", "Nettoyage", "Consommables"],
    icon: "Sparkles",
    usefulFor: ["Hygiène", "Local", "Public"],
    href: "/annuaire-fournisseurs?q=hygiène",
    cta: "Demander une mise en relation",
    partner: true,
  },
  {
    slug: "protection-juridique",
    name: "Protection juridique",
    family: "Finance & protection",
    category: "Assurance",
    shortDescription: "Appui juridique en cas de litige professionnel.",
    description:
      "Protection juridique professionnelle pour contrats, litiges clients, fournisseurs, salariés ou bail commercial.",
    bestFor: "Les petites entreprises qui veulent se protéger sans internaliser le juridique.",
    offerHint: "Comparaison à venir",
    tags: ["Juridique", "Litige", "Protection"],
    icon: "Scale",
    usefulFor: ["Contrats", "Litiges", "Bail"],
    href: "/annuaire-fournisseurs?q=juridique",
    cta: "Comparer les options",
    partner: true,
  },
] as const;

export type DemaaSupplierSlug = (typeof demaaSuppliers)[number]["slug"];

export const supplierCategories = Array.from(
  new Set(demaaSuppliers.map((supplier) => supplier.category)),
) as SupplierCategory[];

export const supplierFamilies = Array.from(
  new Set(demaaSuppliers.map((supplier) => supplier.family)),
) as SupplierFamily[];

export const supplierBySlug = Object.fromEntries(
  demaaSuppliers.map((supplier) => [supplier.slug, supplier]),
) as Partial<Record<DemaaSupplierSlug, DemaaSupplier>>;

export function getDemaaSuppliers(): DemaaSupplier[] {
  return [...demaaSuppliers];
}

export function getDemaaSupplierBySlug(slug: string): DemaaSupplier | null {
  return supplierBySlug[slug as DemaaSupplierSlug] ?? null;
}

export function getMemberSuppliers(): DemaaSupplier[] {
  return demaaSuppliers.filter((supplier) => supplier.partner);
}
