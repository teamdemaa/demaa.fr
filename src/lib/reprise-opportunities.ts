export type RepriseOpportunityCategory = "Services terrain" | "Services professionnels" | "Logiciels";

export type RepriseOpportunity = Readonly<{
  id: string;
  activity: string;
  category: RepriseOpportunityCategory;
  location: string;
  revenue?: string;
  ebe?: string;
  employees?: string;
  askingPrice?: string;
  highlights: readonly string[];
}>;

export const repriseOpportunities: readonly RepriseOpportunity[] = [
  { id: "sols-murs-alpes-maritimes", activity: "Rénovation de sols et murs", category: "Services terrain", location: "Alpes-Maritimes", revenue: "1,6 M€ projeté en 2026", ebe: "180 k€", employees: "Équipe structurée, conducteur de travaux autonome", askingPrice: "190 k€", highlights: ["Cession de 100 % des parts", "Départ à la retraite"] },
  { id: "courant-fibre-securite-alpes-maritimes", activity: "Courant fort et faible, fibre, réseau et sécurité", category: "Services terrain", location: "Alpes-Maritimes", revenue: "2 M€", askingPrice: "1,19 M€", highlights: ["Apport minimum annoncé : 400 k€", "Départ à la retraite"] },
  { id: "nettoyage-services-cote-azur", activity: "Nettoyage et services aux entreprises", category: "Services terrain", location: "Côte d’Azur", revenue: "1 M€", ebe: "380 k€ pour un repreneur", askingPrice: "290 k€", highlights: ["Environ 70 clients sous contrat"] },
  { id: "informatique-securite-voip-bourgogne", activity: "Informatique, vidéosurveillance, contrôle d’accès et VoIP", category: "Services professionnels", location: "Bourgogne", revenue: "395 k€", ebe: "133,2 k€ EBER", employees: "3 techniciens et 1 assistante commerciale", askingPrice: "242 k€", highlights: ["Revenus récurrents", "Accompagnement du cédant possible"] },
  { id: "nettoyage-industriel-rhone-alpes", activity: "Nettoyage industriel et multiservices", category: "Services terrain", location: "Rhône-Alpes", revenue: "2 à 3 M€", ebe: "Marge annoncée de 15 à 20 %", employees: "60 à 75 salariés", highlights: ["Plus de 40 ans d’activité", "Clientèle industrielle"] },
  { id: "maintenance-piscines-auvergne-rhone-alpes", activity: "Maintenance et rénovation de piscines", category: "Services terrain", location: "Auvergne-Rhône-Alpes", revenue: "210 k€ en 2025", employees: "1 technicien autonome", askingPrice: "150 k€", highlights: ["Environ 300 clients", "Environ 100 contrats de maintenance récurrents"] },
  { id: "centrales-solaires-france", activity: "Fondations et montage de centrales solaires au sol", category: "Services terrain", location: "France · région à confirmer", revenue: "1,5 à 3 M€ en 2025", employees: "Environ 30 salariés", askingPrice: "600 k€", highlights: ["100 % B2B", "Société annoncée sans dette"] },
  { id: "radiocommunication-france", activity: "Radiocommunication professionnelle", category: "Services professionnels", location: "France · région à confirmer", revenue: "750 k€ à 1 M€", ebe: "Marge annoncée de 18 %", askingPrice: "700 k€", highlights: ["Plus de 5 000 clients B2B", "Société annoncée sans dette"] },
  { id: "proprete-var", activity: "Entreprise de propreté", category: "Services terrain", location: "Var · Golfe de Saint-Tropez", revenue: "380 à 410 k€", ebe: "55 à 60 k€ normatif", highlights: ["Trois exercices bénéficiaires", "Clientèle récurrente", "Faible dette annoncée"] },
  { id: "securite-privee-idf", activity: "Sécurité privée pour clientèle tertiaire", category: "Services terrain", location: "Paris et Hauts-de-Seine", revenue: "670 k€", ebe: "38 k€", employees: "17 collaborateurs", highlights: ["100 % B2B", "Contrats annuels récurrents", "Entreprise créée en 1987"] },
  { id: "relation-client-lyon", activity: "Gestion de la relation client B2B", category: "Services professionnels", location: "À 45 minutes de Lyon", revenue: "Plus de 1 M€", ebe: "177 k€", employees: "20 collaborateurs", highlights: ["Activité B2B structurée"] },
  { id: "second-oeuvre-sud-ouest", activity: "Plâtrerie, isolation, peinture et revêtements de sols", category: "Services terrain", location: "Sud-Ouest", revenue: "4,02 M€", ebe: "450 k€", employees: "32 collaborateurs et 3 agences", highlights: ["Certifications RGE et Qualibat", "Audits annoncés par l’intermédiaire"] },
  { id: "facades-rennes", activity: "Enduits et ravalement de façades", category: "Services terrain", location: "Nord de Rennes", revenue: "787 k€", ebe: "95 k€ ajusté", askingPrice: "306 880 € FAI TTC", highlights: ["90 % B2B", "Marge brute annoncée de 73 %", "Pas de dette bancaire annoncée"] },
  { id: "agencement-rennes", activity: "Agencement et aménagement intérieur", category: "Services terrain", location: "Nord de Rennes", revenue: "Plus de 600 k€", highlights: ["Au moins 80 k€ de trésorerie transférée annoncée"] },
  { id: "maintenance-informatique-seine-et-marne", activity: "Maintenance informatique, téléassistance et dépannage", category: "Services professionnels", location: "Sud Seine-et-Marne", revenue: "385 k€ en 2025 · à confirmer", askingPrice: "245 k€ honoraires inclus · à confirmer", highlights: ["30 ans d’activité", "Clientèle professionnelle", "Contrats en cours"] },
  { id: "regie-publicitaire-grand-ouest", activity: "Régie publicitaire locale et communication", category: "Services professionnels", location: "Grand Ouest", ebe: "Rentabilité annoncée, non chiffrée", employees: "Aucun salarié", highlights: ["Plus de 20 ans d’activité", "Clients publics récurrents", "Faibles coûts fixes"] },
  { id: "logiciels-crm-sage-ebp", activity: "Éditeur de logiciels CRM, Sage et EBP", category: "Logiciels", location: "France · région à confirmer", highlights: ["Logiciels métiers et intégrations"] },
  { id: "equipements-sante-france-europe", activity: "Marque d’équipements pour professionnels de santé", category: "Services professionnels", location: "France et Europe", revenue: "500 à 750 k€ en 2025", askingPrice: "500 k€ stock inclus", highlights: ["Fabrication externalisée", "Environ 500 k€ de stock"] },
  { id: "formation-seine-et-marne", activity: "Organisme de formation", category: "Services professionnels", location: "Seine-et-Marne", revenue: "320 k€ en 2024-2025", ebe: "95 k€ ajusté", askingPrice: "385 k€", highlights: ["Accréditations officielles", "Locaux de 150 m²"] },
  { id: "courtage-assurances-hauts-de-seine", activity: "Courtage en assurances", category: "Services professionnels", location: "Hauts-de-Seine", revenue: "200 à 250 k€", employees: "1 salarié", highlights: ["Cession du portefeuille ou de 100 % des titres"] },
  { id: "yachts-bouches-du-rhone", activity: "Vente et gestion de yachts premium", category: "Services professionnels", location: "Bouches-du-Rhône", revenue: "2,49 M€ en moyenne", ebe: "150 k€ ajusté moyen", employees: "2 salariés", askingPrice: "275 k€ honoraires inclus", highlights: ["Vente et gestion de yachts premium"] },
  { id: "couverture-solaire-sud-est", activity: "Couverture, protection du bâtiment et solaire", category: "Services terrain", location: "Sud-Est · à confirmer", revenue: "1,37 M€", ebe: "200 k€ normatif", employees: "6 techniciens, 1 technico-commercial et 1 assistante", highlights: ["Trésorerie annoncée de 395 k€", "Dette financière long terme annoncée de 22 k€"] },
  { id: "terrains-sport-alsace", activity: "Terrains de sport et aménagement paysager", category: "Services terrain", location: "Alsace", revenue: "3,6 M€", ebe: "278 k€", askingPrice: "4,015 M€ pour 100 % des titres", highlights: ["Groupe de 3 entités"] },
  { id: "agence-3d-idf", activity: "Agence numérique 3D, réalité augmentée et réalité virtuelle", category: "Services professionnels", location: "Île-de-France", revenue: "1,2 M€ en 2024", ebe: "300 k€ ajusté", employees: "Moins de 15 salariés", highlights: ["Expériences numériques immersives"] },
  { id: "esn-france", activity: "Entreprise de services numériques", category: "Services professionnels", location: "France · région non précisée", revenue: "4,5 M€", ebe: "611 k€", highlights: ["Résultat net annoncé de 504 k€", "Dépendance au dirigeant signalée", "Piste hors marché à confirmer"] },
  { id: "saas-edtech-ia", activity: "Plateforme SaaS et Edtech avec IA", category: "Logiciels", location: "France · région non précisée", revenue: "800 k€", highlights: ["MRR annoncé de 35 k€", "9 000 utilisateurs payants", "Mandat à confirmer"] },
  { id: "cvc-plomberie-gironde", activity: "CVC et plomberie pour clients tertiaires", category: "Services terrain", location: "Gironde", revenue: "1,9 M€", highlights: ["Clientèle tertiaire", "Mandat à confirmer"] },
  { id: "communication-media-calvados", activity: "Agence de communication et média", category: "Services professionnels", location: "Calvados", revenue: "3 M€", highlights: ["Deux marques", "Print et digital", "Mandat à confirmer"] },
  { id: "forage-fondations-occitanie", activity: "Forage et fondations spéciales", category: "Services terrain", location: "Occitanie", revenue: "Plus de 3 M€", employees: "3 à 5 salariés", highlights: ["Activité technique spécialisée", "Mandat à confirmer"] },
  { id: "piscines-spas-bretagne", activity: "Construction de piscines et spas", category: "Services terrain", location: "Bretagne", revenue: "1,5 à 3 M€", employees: "6 à 9 salariés", highlights: ["50 ans d’activité", "Piscines, SAV et spas", "Mandat à confirmer"] },
] as const;

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
