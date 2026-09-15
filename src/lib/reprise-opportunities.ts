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
  presentation?: string;
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
  { id: "sols-murs-alpes-maritimes", activity: "Rénovation de sols et murs", category: "Services terrain", location: "Alpes-Maritimes", presentation: "Entreprise spécialisée dans la rénovation de sols et murs dans les Alpes-Maritimes. La cession porte sur 100 % des parts et intervient dans le cadre du départ à la retraite du dirigeant.", revenue: "1,6 M€ (prévision 2026)", ebe: "180 k€", employees: "Équipe structurée, conducteur de travaux autonome", askingPrice: "190 k€", highlights: ["Cession de 100 % des parts", "Départ à la retraite"], mapPosition: { label: "Alpes-Maritimes", latitude: 43.7102, longitude: 7.262 } },
  { id: "courant-fibre-securite-alpes-maritimes", activity: "Courant fort et faible, fibre, réseau et sécurité", category: "Services terrain", location: "Alpes-Maritimes", presentation: "Entreprise des Alpes-Maritimes intervenant en courant fort, courant faible, fibre, réseaux et sécurité. Le projet de cession est motivé par le départ à la retraite du dirigeant.", revenue: "2 M€", askingPrice: "1,19 M€", highlights: ["Apport minimum : 400 k€", "Départ à la retraite"], mapPosition: { label: "Alpes-Maritimes", latitude: 43.7102, longitude: 7.262 } },
  { id: "nettoyage-services-cote-azur", activity: "Nettoyage et services aux entreprises", category: "Services terrain", location: "Côte d’Azur", presentation: "Entreprise de nettoyage et de services aux entreprises implantée sur la Côte d’Azur. Son portefeuille réunit environ 70 clients sous contrat.", revenue: "1 M€", ebe: "380 k€", askingPrice: "290 k€", highlights: ["Environ 70 clients sous contrat"], mapPosition: { label: "Côte d’Azur", latitude: 43.6, longitude: 6.9 } },
  { id: "informatique-securite-voip-bourgogne", activity: "Informatique, vidéosurveillance, contrôle d’accès et VoIP", category: "Services professionnels", location: "Bourgogne", presentation: "Société bourguignonne spécialisée dans les infrastructures informatiques et de sécurité. Ses revenus sont récurrents et le cédant peut accompagner la transition.", revenue: "395 k€", ebe: "133,2 k€ EBER", employees: "3 techniciens et 1 assistante commerciale", askingPrice: "242 k€", highlights: ["Revenus récurrents", "Accompagnement du cédant possible"], mapPosition: { label: "Bourgogne", latitude: 47.322, longitude: 5.0415 } },
  { id: "nettoyage-industriel-rhone-alpes", activity: "Nettoyage industriel et multiservices", category: "Services terrain", location: "Rhône-Alpes", presentation: "Entreprise de nettoyage industriel et multiservices présente depuis plus de 40 ans en Rhône-Alpes. Elle intervient auprès d’une clientèle industrielle.", revenue: "2 à 3 M€", ebe: "Marge d’EBE de 15 à 20 %", employees: "60 à 75 salariés", highlights: ["Plus de 40 ans d’activité", "Clientèle industrielle"], mapPosition: { label: "Rhône-Alpes", latitude: 45.764, longitude: 4.8357 } },
  { id: "centrales-solaires-france", activity: "Fondations et montage de centrales solaires au sol", category: "Services terrain", location: "France", presentation: "Entreprise spécialisée dans les fondations et le montage de centrales solaires au sol. Son activité est réalisée exclusivement auprès de clients professionnels.", revenue: "1,5 à 3 M€ en 2025", employees: "Environ 30 salariés", askingPrice: "600 k€", highlights: ["100 % B2B", "Société sans dette"] },
  { id: "radiocommunication-france", activity: "Radiocommunication professionnelle", category: "Services professionnels", location: "France", presentation: "Acteur de la radiocommunication professionnelle disposant d’un portefeuille de plus de 5 000 clients B2B.", revenue: "750 k€ à 1 M€", ebe: "Marge d’EBE de 18 %", askingPrice: "700 k€", highlights: ["Plus de 5 000 clients B2B", "Société sans dette"] },
  { id: "proprete-var", activity: "Entreprise de propreté", category: "Services terrain", location: "Var · Golfe de Saint-Tropez", presentation: "Entreprise de propreté implantée dans le golfe de Saint-Tropez. Elle sert une clientèle récurrente et affiche trois exercices bénéficiaires.", revenue: "380 à 410 k€", ebe: "55 à 60 k€ (normatif)", highlights: ["Trois exercices bénéficiaires", "Clientèle récurrente", "Faible dette"], mapPosition: { label: "Var", latitude: 43.1242, longitude: 6.0 } },
  { id: "securite-privee-idf", activity: "Sécurité privée pour clientèle tertiaire", category: "Services terrain", location: "Paris et Hauts-de-Seine", presentation: "Entreprise de sécurité privée créée en 1987 et implantée en Île-de-France. Elle travaille exclusivement pour une clientèle tertiaire au moyen de contrats annuels.", revenue: "670 k€", ebe: "38 k€", employees: "17 collaborateurs", highlights: ["100 % B2B", "Contrats annuels récurrents", "Entreprise créée en 1987"], mapPosition: { label: "Île-de-France", latitude: 48.8566, longitude: 2.3522 } },
  { id: "relation-client-lyon", activity: "Gestion de la relation client B2B", category: "Services professionnels", location: "À 45 minutes de Lyon", presentation: "Entreprise de la région lyonnaise spécialisée dans la gestion de la relation client B2B. L’activité repose sur une équipe de 20 collaborateurs.", revenue: "Plus de 1 M€", ebe: "177 k€", employees: "20 collaborateurs", highlights: ["Activité B2B structurée"], mapPosition: { label: "Lyon", latitude: 45.764, longitude: 4.8357 } },
  { id: "second-oeuvre-sud-ouest", activity: "Plâtrerie, isolation, peinture et revêtements de sols", category: "Services terrain", location: "Sud-Ouest", presentation: "Entreprise de second œuvre organisée autour de trois agences dans le Sud-Ouest. Elle réalise des travaux de plâtrerie, isolation, peinture et revêtements de sols et dispose des certifications RGE et Qualibat.", revenue: "4,02 M€", ebe: "450 k€", employees: "32 collaborateurs et 3 agences", highlights: ["Certifications RGE et Qualibat"], mapPosition: { label: "Sud-Ouest", latitude: 44.8378, longitude: -0.5792 } },
  { id: "facades-rennes", activity: "Enduits et ravalement de façades", category: "Services terrain", location: "Nord de Rennes", presentation: "Entreprise de ravalement et d’enduits de façade située au nord de Rennes. Elle réalise 90 % de son activité auprès de professionnels.", revenue: "787 k€", ebe: "95 k€ (ajusté)", askingPrice: "306 880 € FAI TTC", highlights: ["90 % B2B", "Marge brute de 73 %", "Sans dette bancaire"], mapPosition: { label: "Rennes", latitude: 48.1173, longitude: -1.6778 } },
  { id: "agencement-rennes", activity: "Agencement et aménagement intérieur", category: "Services terrain", location: "Nord de Rennes", presentation: "Entreprise d’agencement et d’aménagement intérieur située au nord de Rennes. La cession comprend au moins 80 k€ de trésorerie.", revenue: "Plus de 600 k€", highlights: ["Au moins 80 k€ de trésorerie transférée"], mapPosition: { label: "Rennes", latitude: 48.1173, longitude: -1.6778 } },
  { id: "maintenance-informatique-seine-et-marne", activity: "Maintenance informatique, téléassistance et dépannage", category: "Services professionnels", location: "Sud Seine-et-Marne", presentation: "Entreprise de maintenance informatique, téléassistance et dépannage active depuis 30 ans dans le sud de la Seine-et-Marne. Elle travaille avec une clientèle professionnelle et dispose de contrats en cours.", revenue: "385 k€ en 2025", askingPrice: "245 k€ honoraires inclus", highlights: ["30 ans d’activité", "Clientèle professionnelle", "Contrats en cours"], mapPosition: { label: "Seine-et-Marne", latitude: 48.6, longitude: 2.9 } },
  { id: "logiciels-crm-sage-ebp", activity: "Éditeur de logiciels CRM, Sage et EBP", category: "Logiciels", location: "France", highlights: ["Logiciels métiers et intégrations"] },
  { id: "equipements-sante-france-europe", activity: "Marque d’équipements pour professionnels de santé", category: "Services professionnels", location: "France et Europe", presentation: "Marque d’équipements destinée aux professionnels de santé, commercialisée en France et en Europe. La fabrication est externalisée et le stock est inclus dans la cession.", revenue: "500 à 750 k€ en 2025", askingPrice: "500 k€ stock inclus", highlights: ["Fabrication externalisée", "Environ 500 k€ de stock"] },
  { id: "couverture-solaire-sud-est", activity: "Couverture, protection du bâtiment et solaire", category: "Services terrain", location: "Sud-Est", presentation: "Entreprise du Sud-Est spécialisée dans la couverture, la protection du bâtiment et les installations solaires. L’équipe réunit six techniciens, un technico-commercial et une assistante.", revenue: "1,37 M€", ebe: "200 k€ (normatif)", employees: "6 techniciens, 1 technico-commercial et 1 assistante", highlights: ["Trésorerie : 395 k€", "Dette financière long terme : 22 k€"], mapPosition: { label: "Sud-Est", latitude: 43.8, longitude: 5.5 } },
  { id: "terrains-sport-alsace", activity: "Terrains de sport et aménagement paysager", category: "Services terrain", location: "Alsace", presentation: "Groupe alsacien de trois entités spécialisé dans la réalisation de terrains de sport et l’aménagement paysager.", revenue: "3,6 M€", ebe: "278 k€", askingPrice: "4,015 M€ pour 100 % des titres", highlights: ["Groupe de 3 entités"], mapPosition: { label: "Alsace", latitude: 48.5734, longitude: 7.7521 } },
  { id: "esn-france", activity: "Entreprise de services numériques", category: "Services professionnels", location: "France", revenue: "4,5 M€", ebe: "611 k€", highlights: ["Résultat net : 504 k€", "Dépendance au dirigeant"] },
  { id: "cvc-plomberie-gironde", activity: "CVC et plomberie pour clients tertiaires", category: "Services terrain", location: "Gironde", presentation: "Entreprise de CVC et plomberie intervenant auprès de clients tertiaires en Gironde.", revenue: "1,9 M€", highlights: ["Clientèle tertiaire"], mapPosition: { label: "Gironde", latitude: 44.8378, longitude: -0.5792 } },
  { id: "forage-fondations-occitanie", activity: "Forage et fondations spéciales", category: "Services terrain", location: "Occitanie", presentation: "Entreprise spécialisée dans le forage et les fondations spéciales en Occitanie, avec une équipe de 3 à 5 salariés.", revenue: "Plus de 3 M€", employees: "3 à 5 salariés", highlights: ["Activité technique spécialisée"], mapPosition: { label: "Occitanie", latitude: 43.6047, longitude: 1.4442 } },
  { id: "second-oeuvre-renovation-france", activity: "Second œuvre et rénovation", category: "Services terrain", location: "France", revenue: "2 M€", ebe: "Marge d’EBE de 8 %", employees: "16 salariés", highlights: ["Second œuvre", "Activité de rénovation"] },
  { id: "services-it-telecoms-manages", activity: "Services IT et télécoms managés", category: "Services professionnels", location: "France", presentation: "Entreprise de services IT et télécoms managés dont 80 % des revenus sont récurrents.", revenue: "500 k€", ebe: "130 k€ (prévisionnel)", highlights: ["80 % de revenus récurrents", "Services managés"] },
  { id: "machines-speciales-b2b", activity: "Conception de machines spéciales B2B", category: "Services terrain", location: "France", revenue: "5 M€", ebe: "Marge d’EBE de 2 %", highlights: ["Machines spéciales", "Clientèle B2B"] },
  { id: "chaudronnerie-maintenance-industrielle", activity: "Chaudronnerie et maintenance industrielle", category: "Services terrain", location: "France", revenue: "1,7 M€", ebe: "Marge d’EBE de 12 %", highlights: ["Maintenance industrielle", "Savoir-faire technique"] },
  { id: "travaux-publics-grand-ouest", activity: "Travaux publics", category: "Services terrain", location: "Grand Ouest", presentation: "Entreprise de travaux publics implantée dans le Grand Ouest et structurée autour d’une équipe de 15 à 20 salariés.", revenue: "Près de 4 M€", employees: "15 à 20 salariés", highlights: ["Activité de travaux publics", "Équipe structurée"], mapPosition: { label: "Grand Ouest", latitude: 47.2184, longitude: -1.5536 } },
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
  "centrales-solaires-france": searchData("France entière", { revenueMin: 1_500_000, revenueMax: 3_000_000, askingPriceMin: 600_000, askingPriceMax: 600_000 }),
  "radiocommunication-france": searchData("France entière", { revenueMin: 750_000, revenueMax: 1_000_000, askingPriceMin: 700_000, askingPriceMax: 700_000 }),
  "proprete-var": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 380_000, revenueMax: 410_000 }),
  "securite-privee-idf": searchData("Île-de-France", { revenueMin: 670_000, revenueMax: 670_000 }),
  "relation-client-lyon": searchData("Auvergne-Rhône-Alpes", { revenueMin: 1_000_000 }),
  "second-oeuvre-sud-ouest": searchData("Nouvelle-Aquitaine", { revenueMin: 4_020_000, revenueMax: 4_020_000 }),
  "facades-rennes": searchData("Bretagne", { revenueMin: 787_000, revenueMax: 787_000, askingPriceMin: 306_880, askingPriceMax: 306_880 }),
  "agencement-rennes": searchData("Bretagne", { revenueMin: 600_000 }),
  "maintenance-informatique-seine-et-marne": searchData("Île-de-France", { revenueMin: 385_000, revenueMax: 385_000, askingPriceMin: 245_000, askingPriceMax: 245_000 }),
  "logiciels-crm-sage-ebp": searchData("France entière"),
  "equipements-sante-france-europe": searchData("France entière", { revenueMin: 500_000, revenueMax: 750_000, askingPriceMin: 500_000, askingPriceMax: 500_000 }),
  "couverture-solaire-sud-est": searchData("Provence-Alpes-Côte d’Azur", { revenueMin: 1_370_000, revenueMax: 1_370_000 }),
  "terrains-sport-alsace": searchData("Grand Est", { revenueMin: 3_600_000, revenueMax: 3_600_000, askingPriceMin: 4_015_000, askingPriceMax: 4_015_000 }),
  "esn-france": searchData("France entière", { revenueMin: 4_500_000, revenueMax: 4_500_000 }),
  "cvc-plomberie-gironde": searchData("Nouvelle-Aquitaine", { revenueMin: 1_900_000, revenueMax: 1_900_000 }),
  "forage-fondations-occitanie": searchData("Occitanie", { revenueMin: 3_000_000 }),
  "second-oeuvre-renovation-france": searchData("France entière", { revenueMin: 2_000_000, revenueMax: 2_000_000 }, "2026-09-13"),
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
