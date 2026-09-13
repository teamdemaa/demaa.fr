export const repriseOpportunityCategories = ["Services terrain", "Services professionnels", "Logiciels"] as const;

export type RepriseOpportunityCategory = (typeof repriseOpportunityCategories)[number];

export const repriseOpportunityRegions = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "France entière",
  "Grand Est",
  "Grand Ouest",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Provence-Alpes-Côte d’Azur",
] as const;

export type RepriseOpportunityRegion = (typeof repriseOpportunityRegions)[number];

export type RepriseOpportunity = Readonly<{
  id: string;
  activity: string;
  category: RepriseOpportunityCategory;
  location: string;
  revenue?: string;
  ebe?: string;
  employees?: string;
  askingPrice?: string;
  askingPriceMax?: number;
  askingPriceMin?: number;
  highlights: readonly string[];
  publishedAt: string;
  region: RepriseOpportunityRegion;
  revenueMax?: number;
  revenueMin?: number;
  mapPosition?: Readonly<{
    label: string;
    latitude: number;
    longitude: number;
  }>;
}>;

type RepriseOpportunityListing = Omit<
  RepriseOpportunity,
  "askingPriceMax" | "askingPriceMin" | "publishedAt" | "region" | "revenueMax" | "revenueMin"
>;

const repriseOpportunityListings: readonly RepriseOpportunityListing[] = [
  { id: "sols-murs-alpes-maritimes", activity: "Rénovation de sols et murs", category: "Services terrain", location: "Alpes-Maritimes", revenue: "1,6 M€ projeté en 2026", ebe: "180 k€", employees: "Équipe structurée, conducteur de travaux autonome", askingPrice: "190 k€", highlights: ["Cession de 100 % des parts", "Départ à la retraite"], mapPosition: { label: "Alpes-Maritimes", latitude: 43.7102, longitude: 7.262 } },
  { id: "courant-fibre-securite-alpes-maritimes", activity: "Courant fort et faible, fibre, réseau et sécurité", category: "Services terrain", location: "Alpes-Maritimes", revenue: "2 M€", askingPrice: "1,19 M€", highlights: ["Apport minimum annoncé : 400 k€", "Départ à la retraite"], mapPosition: { label: "Alpes-Maritimes", latitude: 43.7102, longitude: 7.262 } },
  { id: "nettoyage-services-cote-azur", activity: "Nettoyage et services aux entreprises", category: "Services terrain", location: "Côte d’Azur", revenue: "1 M€", ebe: "380 k€ pour un repreneur", askingPrice: "290 k€", highlights: ["Environ 70 clients sous contrat"], mapPosition: { label: "Côte d’Azur", latitude: 43.6, longitude: 6.9 } },
  { id: "informatique-securite-voip-bourgogne", activity: "Informatique, vidéosurveillance, contrôle d’accès et VoIP", category: "Services professionnels", location: "Bourgogne", revenue: "395 k€", ebe: "133,2 k€ EBER", employees: "3 techniciens et 1 assistante commerciale", askingPrice: "242 k€", highlights: ["Revenus récurrents", "Accompagnement du cédant possible"], mapPosition: { label: "Bourgogne", latitude: 47.322, longitude: 5.0415 } },
  { id: "nettoyage-industriel-rhone-alpes", activity: "Nettoyage industriel et multiservices", category: "Services terrain", location: "Rhône-Alpes", revenue: "2 à 3 M€", ebe: "Marge annoncée de 15 à 20 %", employees: "60 à 75 salariés", highlights: ["Plus de 40 ans d’activité", "Clientèle industrielle"], mapPosition: { label: "Rhône-Alpes", latitude: 45.764, longitude: 4.8357 } },
  { id: "maintenance-piscines-auvergne-rhone-alpes", activity: "Maintenance et rénovation de piscines", category: "Services terrain", location: "Auvergne-Rhône-Alpes", revenue: "210 k€ en 2025", employees: "1 technicien autonome", askingPrice: "150 k€", highlights: ["Environ 300 clients", "Environ 100 contrats de maintenance récurrents"], mapPosition: { label: "Auvergne-Rhône-Alpes", latitude: 45.5, longitude: 3.9 } },
  { id: "centrales-solaires-france", activity: "Fondations et montage de centrales solaires au sol", category: "Services terrain", location: "France · localisation non communiquée", revenue: "1,5 à 3 M€ en 2025", employees: "Environ 30 salariés", askingPrice: "600 k€", highlights: ["100 % B2B", "Société annoncée sans dette"] },
  { id: "radiocommunication-france", activity: "Radiocommunication professionnelle", category: "Services professionnels", location: "France · localisation non communiquée", revenue: "750 k€ à 1 M€", ebe: "Marge annoncée de 18 %", askingPrice: "700 k€", highlights: ["Plus de 5 000 clients B2B", "Société annoncée sans dette"] },
  { id: "proprete-var", activity: "Entreprise de propreté", category: "Services terrain", location: "Var · Golfe de Saint-Tropez", revenue: "380 à 410 k€", ebe: "55 à 60 k€ normatif", highlights: ["Trois exercices bénéficiaires", "Clientèle récurrente", "Faible dette annoncée"], mapPosition: { label: "Var", latitude: 43.1242, longitude: 6.0 } },
  { id: "securite-privee-idf", activity: "Sécurité privée pour clientèle tertiaire", category: "Services terrain", location: "Paris et Hauts-de-Seine", revenue: "670 k€", ebe: "38 k€", employees: "17 collaborateurs", highlights: ["100 % B2B", "Contrats annuels récurrents", "Entreprise créée en 1987"], mapPosition: { label: "Île-de-France", latitude: 48.8566, longitude: 2.3522 } },
  { id: "relation-client-lyon", activity: "Gestion de la relation client B2B", category: "Services professionnels", location: "À 45 minutes de Lyon", revenue: "Plus de 1 M€", ebe: "177 k€", employees: "20 collaborateurs", highlights: ["Activité B2B structurée"], mapPosition: { label: "Lyon", latitude: 45.764, longitude: 4.8357 } },
  { id: "second-oeuvre-sud-ouest", activity: "Plâtrerie, isolation, peinture et revêtements de sols", category: "Services terrain", location: "Sud-Ouest", revenue: "4,02 M€", ebe: "450 k€", employees: "32 collaborateurs et 3 agences", highlights: ["Certifications RGE et Qualibat", "Audits annoncés par l’intermédiaire"], mapPosition: { label: "Sud-Ouest", latitude: 44.8378, longitude: -0.5792 } },
  { id: "facades-rennes", activity: "Enduits et ravalement de façades", category: "Services terrain", location: "Nord de Rennes", revenue: "787 k€", ebe: "95 k€ ajusté", askingPrice: "306 880 € FAI TTC", highlights: ["90 % B2B", "Marge brute annoncée de 73 %", "Pas de dette bancaire annoncée"], mapPosition: { label: "Rennes", latitude: 48.1173, longitude: -1.6778 } },
  { id: "agencement-rennes", activity: "Agencement et aménagement intérieur", category: "Services terrain", location: "Nord de Rennes", revenue: "Plus de 600 k€", highlights: ["Au moins 80 k€ de trésorerie transférée annoncée"], mapPosition: { label: "Rennes", latitude: 48.1173, longitude: -1.6778 } },
  { id: "maintenance-informatique-seine-et-marne", activity: "Maintenance informatique, téléassistance et dépannage", category: "Services professionnels", location: "Sud Seine-et-Marne", revenue: "385 k€ en 2025", askingPrice: "245 k€ honoraires inclus", highlights: ["30 ans d’activité", "Clientèle professionnelle", "Contrats en cours"], mapPosition: { label: "Seine-et-Marne", latitude: 48.6, longitude: 2.9 } },
  { id: "regie-publicitaire-grand-ouest", activity: "Régie publicitaire locale et communication", category: "Services professionnels", location: "Grand Ouest", ebe: "Rentabilité annoncée, non chiffrée", employees: "Aucun salarié", highlights: ["Plus de 20 ans d’activité", "Clients publics récurrents", "Faibles coûts fixes"], mapPosition: { label: "Grand Ouest", latitude: 47.2184, longitude: -1.5536 } },
  { id: "logiciels-crm-sage-ebp", activity: "Éditeur de logiciels CRM, Sage et EBP", category: "Logiciels", location: "France · localisation non communiquée", highlights: ["Logiciels métiers et intégrations"] },
  { id: "equipements-sante-france-europe", activity: "Marque d’équipements pour professionnels de santé", category: "Services professionnels", location: "France et Europe", revenue: "500 à 750 k€ en 2025", askingPrice: "500 k€ stock inclus", highlights: ["Fabrication externalisée", "Environ 500 k€ de stock"] },
  { id: "formation-seine-et-marne", activity: "Organisme de formation", category: "Services professionnels", location: "Seine-et-Marne", revenue: "320 k€ en 2024-2025", ebe: "95 k€ ajusté", askingPrice: "385 k€", highlights: ["Accréditations officielles", "Locaux de 150 m²"], mapPosition: { label: "Seine-et-Marne", latitude: 48.6, longitude: 2.9 } },
  { id: "courtage-assurances-hauts-de-seine", activity: "Courtage en assurances", category: "Services professionnels", location: "Hauts-de-Seine", revenue: "200 à 250 k€", employees: "1 salarié", highlights: ["Cession du portefeuille ou de 100 % des titres"], mapPosition: { label: "Île-de-France", latitude: 48.8566, longitude: 2.3522 } },
  { id: "yachts-bouches-du-rhone", activity: "Vente et gestion de yachts premium", category: "Services professionnels", location: "Bouches-du-Rhône", revenue: "2,49 M€ en moyenne", ebe: "150 k€ ajusté moyen", employees: "2 salariés", askingPrice: "275 k€ honoraires inclus", highlights: ["Vente et gestion de yachts premium"], mapPosition: { label: "Bouches-du-Rhône", latitude: 43.2965, longitude: 5.3698 } },
  { id: "couverture-solaire-sud-est", activity: "Couverture, protection du bâtiment et solaire", category: "Services terrain", location: "Sud-Est", revenue: "1,37 M€", ebe: "200 k€ normatif", employees: "6 techniciens, 1 technico-commercial et 1 assistante", highlights: ["Trésorerie annoncée de 395 k€", "Dette financière long terme annoncée de 22 k€"], mapPosition: { label: "Sud-Est", latitude: 43.8, longitude: 5.5 } },
  { id: "terrains-sport-alsace", activity: "Terrains de sport et aménagement paysager", category: "Services terrain", location: "Alsace", revenue: "3,6 M€", ebe: "278 k€", askingPrice: "4,015 M€ pour 100 % des titres", highlights: ["Groupe de 3 entités"], mapPosition: { label: "Alsace", latitude: 48.5734, longitude: 7.7521 } },
  { id: "agence-3d-idf", activity: "Agence numérique 3D, réalité augmentée et réalité virtuelle", category: "Services professionnels", location: "Île-de-France", revenue: "1,2 M€ en 2024", ebe: "300 k€ ajusté", employees: "Moins de 15 salariés", highlights: ["Expériences numériques immersives"], mapPosition: { label: "Île-de-France", latitude: 48.8566, longitude: 2.3522 } },
  { id: "esn-france", activity: "Entreprise de services numériques", category: "Services professionnels", location: "France · localisation non communiquée", revenue: "4,5 M€", ebe: "611 k€", highlights: ["Résultat net annoncé de 504 k€", "Dépendance au dirigeant signalée"] },
  { id: "saas-edtech-ia", activity: "Plateforme SaaS et Edtech avec IA", category: "Logiciels", location: "France · localisation non communiquée", revenue: "800 k€", highlights: ["MRR annoncé de 35 k€", "9 000 utilisateurs payants"] },
  { id: "cvc-plomberie-gironde", activity: "CVC et plomberie pour clients tertiaires", category: "Services terrain", location: "Gironde", revenue: "1,9 M€", highlights: ["Clientèle tertiaire"], mapPosition: { label: "Gironde", latitude: 44.8378, longitude: -0.5792 } },
  { id: "communication-media-calvados", activity: "Agence de communication et média", category: "Services professionnels", location: "Calvados", revenue: "3 M€", highlights: ["Deux marques", "Print et digital"], mapPosition: { label: "Calvados", latitude: 49.1829, longitude: -0.3707 } },
  { id: "forage-fondations-occitanie", activity: "Forage et fondations spéciales", category: "Services terrain", location: "Occitanie", revenue: "Plus de 3 M€", employees: "3 à 5 salariés", highlights: ["Activité technique spécialisée"], mapPosition: { label: "Occitanie", latitude: 43.6047, longitude: 1.4442 } },
  { id: "piscines-spas-bretagne", activity: "Construction de piscines et spas", category: "Services terrain", location: "Bretagne", revenue: "1,5 à 3 M€", employees: "6 à 9 salariés", highlights: ["50 ans d’activité", "Piscines, SAV et spas"], mapPosition: { label: "Bretagne", latitude: 48.1173, longitude: -1.6778 } },
  { id: "fitness-premium-herault", activity: "Club de fitness premium", category: "Services terrain", location: "Hérault", revenue: "Plus de 210 k€", ebe: "Marge EBE supérieure à 23 %", highlights: ["410 abonnés récurrents", "Positionnement premium"], mapPosition: { label: "Hérault", latitude: 43.6108, longitude: 3.8767 } },
  { id: "voyages-aventure-premium", activity: "Voyages d’aventure premium", category: "Services professionnels", location: "France · localisation non communiquée", revenue: "2 à 3 M€", ebe: "Marge EBE annoncée de 10 à 20 %", highlights: ["Voyages d’aventure", "Positionnement premium"] },
  { id: "second-oeuvre-renovation-france", activity: "Second œuvre et rénovation", category: "Services terrain", location: "France · localisation non communiquée", revenue: "2 M€", ebe: "Marge EBE annoncée de 8 %", employees: "16 salariés", highlights: ["Second œuvre", "Activité de rénovation"] },
  { id: "communication-objet-textile-b2b", activity: "Communication par l’objet et textile B2B", category: "Services professionnels", location: "France · localisation non communiquée", revenue: "2 à 3 M€", ebe: "Marge EBE annoncée de 5 à 10 %", highlights: ["Clientèle B2B", "Communication par l’objet et textile"] },
  { id: "services-it-telecoms-manages", activity: "Services IT et télécoms managés", category: "Services professionnels", location: "France · localisation non communiquée", revenue: "500 k€", ebe: "130 k€ projeté", highlights: ["80 % de revenus récurrents", "Services managés"] },
  { id: "machines-speciales-b2b", activity: "Conception de machines spéciales B2B", category: "Services terrain", location: "France · localisation non communiquée", revenue: "5 M€", ebe: "Marge EBE annoncée de 2 %", highlights: ["Machines spéciales", "Clientèle B2B"] },
  { id: "chaudronnerie-maintenance-industrielle", activity: "Chaudronnerie et maintenance industrielle", category: "Services terrain", location: "France · localisation non communiquée", revenue: "1,7 M€", ebe: "Marge EBE annoncée de 12 %", highlights: ["Maintenance industrielle", "Savoir-faire technique"] },
  { id: "travaux-publics-grand-ouest", activity: "Travaux publics", category: "Services terrain", location: "Grand Ouest", revenue: "Environ 4 M€", employees: "15 à 20 salariés", highlights: ["Activité de travaux publics", "Équipe structurée"], mapPosition: { label: "Grand Ouest", latitude: 47.2184, longitude: -1.5536 } },
] as const;

type RepriseOpportunitySearchData = Pick<
  RepriseOpportunity,
  "askingPriceMax" | "askingPriceMin" | "publishedAt" | "region" | "revenueMax" | "revenueMin"
>;

const currentPublicationDate = "2026-09-12";
const searchData = (
  region: RepriseOpportunityRegion,
  values: Omit<RepriseOpportunitySearchData, "publishedAt" | "region"> = {},
  publishedAt = currentPublicationDate,
): RepriseOpportunitySearchData => ({ publishedAt, region, ...values });

const repriseOpportunitySearchData: Record<string, RepriseOpportunitySearchData> = {
  "sols-murs-alpes-maritimes": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 1_600_000, revenueMax: 1_600_000, askingPriceMin: 190_000, askingPriceMax: 190_000 }),
  "courant-fibre-securite-alpes-maritimes": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 2_000_000, revenueMax: 2_000_000, askingPriceMin: 1_190_000, askingPriceMax: 1_190_000 }),
  "nettoyage-services-cote-azur": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 1_000_000, revenueMax: 1_000_000, askingPriceMin: 290_000, askingPriceMax: 290_000 }),
  "informatique-securite-voip-bourgogne": searchData("Bourgogne-Franche-Comté", { revenueMin: 395_000, revenueMax: 395_000, askingPriceMin: 242_000, askingPriceMax: 242_000 }),
  "nettoyage-industriel-rhone-alpes": searchData("Auvergne-Rhône-Alpes", { revenueMin: 2_000_000, revenueMax: 3_000_000 }),
  "maintenance-piscines-auvergne-rhone-alpes": searchData("Auvergne-Rhône-Alpes", { revenueMin: 210_000, revenueMax: 210_000, askingPriceMin: 150_000, askingPriceMax: 150_000 }),
  "centrales-solaires-france": searchData("France entière", { revenueMin: 1_500_000, revenueMax: 3_000_000, askingPriceMin: 600_000, askingPriceMax: 600_000 }),
  "radiocommunication-france": searchData("France entière", { revenueMin: 750_000, revenueMax: 1_000_000, askingPriceMin: 700_000, askingPriceMax: 700_000 }),
  "proprete-var": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 380_000, revenueMax: 410_000 }),
  "securite-privee-idf": searchData("Île-de-France", { revenueMin: 670_000, revenueMax: 670_000 }),
  "relation-client-lyon": searchData("Auvergne-Rhône-Alpes", { revenueMin: 1_000_000 }),
  "second-oeuvre-sud-ouest": searchData("Nouvelle-Aquitaine", { revenueMin: 4_020_000, revenueMax: 4_020_000 }),
  "facades-rennes": searchData("Bretagne", { revenueMin: 787_000, revenueMax: 787_000, askingPriceMin: 306_880, askingPriceMax: 306_880 }),
  "agencement-rennes": searchData("Bretagne", { revenueMin: 600_000 }),
  "maintenance-informatique-seine-et-marne": searchData("Île-de-France", { revenueMin: 385_000, revenueMax: 385_000, askingPriceMin: 245_000, askingPriceMax: 245_000 }),
  "regie-publicitaire-grand-ouest": searchData("Grand Ouest"),
  "logiciels-crm-sage-ebp": searchData("France entière"),
  "equipements-sante-france-europe": searchData("France entière", { revenueMin: 500_000, revenueMax: 750_000, askingPriceMin: 500_000, askingPriceMax: 500_000 }),
  "formation-seine-et-marne": searchData("Île-de-France", { revenueMin: 320_000, revenueMax: 320_000, askingPriceMin: 385_000, askingPriceMax: 385_000 }),
  "courtage-assurances-hauts-de-seine": searchData("Île-de-France", { revenueMin: 200_000, revenueMax: 250_000 }),
  "yachts-bouches-du-rhone": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 2_490_000, revenueMax: 2_490_000, askingPriceMin: 275_000, askingPriceMax: 275_000 }),
  "couverture-solaire-sud-est": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 1_370_000, revenueMax: 1_370_000 }),
  "terrains-sport-alsace": searchData("Grand Est", { revenueMin: 3_600_000, revenueMax: 3_600_000, askingPriceMin: 4_015_000, askingPriceMax: 4_015_000 }),
  "agence-3d-idf": searchData("Île-de-France", { revenueMin: 1_200_000, revenueMax: 1_200_000 }),
  "esn-france": searchData("France entière", { revenueMin: 4_500_000, revenueMax: 4_500_000 }),
  "saas-edtech-ia": searchData("France entière", { revenueMin: 800_000, revenueMax: 800_000 }),
  "cvc-plomberie-gironde": searchData("Nouvelle-Aquitaine", { revenueMin: 1_900_000, revenueMax: 1_900_000 }),
  "communication-media-calvados": searchData("Normandie", { revenueMin: 3_000_000, revenueMax: 3_000_000 }),
  "forage-fondations-occitanie": searchData("Occitanie", { revenueMin: 3_000_000 }),
  "piscines-spas-bretagne": searchData("Bretagne", { revenueMin: 1_500_000, revenueMax: 3_000_000 }),
  "fitness-premium-herault": searchData("Occitanie", { revenueMin: 210_000 }, "2026-09-13"),
  "voyages-aventure-premium": searchData("France entière", { revenueMin: 2_000_000, revenueMax: 3_000_000 }, "2026-09-13"),
  "second-oeuvre-renovation-france": searchData("France entière", { revenueMin: 2_000_000, revenueMax: 2_000_000 }, "2026-09-13"),
  "communication-objet-textile-b2b": searchData("France entière", { revenueMin: 2_000_000, revenueMax: 3_000_000 }, "2026-09-13"),
  "services-it-telecoms-manages": searchData("France entière", { revenueMin: 500_000, revenueMax: 500_000 }, "2026-09-13"),
  "machines-speciales-b2b": searchData("France entière", { revenueMin: 5_000_000, revenueMax: 5_000_000 }, "2026-09-13"),
  "chaudronnerie-maintenance-industrielle": searchData("France entière", { revenueMin: 1_700_000, revenueMax: 1_700_000 }, "2026-09-13"),
  "travaux-publics-grand-ouest": searchData("Grand Ouest", { revenueMin: 4_000_000, revenueMax: 4_000_000 }, "2026-09-13"),
};

export const repriseOpportunities: readonly RepriseOpportunity[] = repriseOpportunityListings.map((opportunity) => ({
  ...opportunity,
  ...repriseOpportunitySearchData[opportunity.id],
}));

export function getRepriseOpportunity(id: string) {
  return repriseOpportunities.find((opportunity) => opportunity.id === id) ?? null;
}

export function getRepriseOpportunityInformationScore(opportunity: RepriseOpportunity) {
  return [opportunity.revenue, opportunity.ebe, opportunity.employees, opportunity.askingPrice]
    .filter(Boolean)
    .length;
}

export function sortRepriseOpportunitiesByInformation(opportunities: readonly RepriseOpportunity[]) {
  return opportunities
    .map((opportunity, originalIndex) => ({ opportunity, originalIndex }))
    .toSorted((left, right) => (
      getRepriseOpportunityInformationScore(right.opportunity)
      - getRepriseOpportunityInformationScore(left.opportunity)
      || left.originalIndex - right.originalIndex
    ))
    .map(({ opportunity }) => opportunity);
}
