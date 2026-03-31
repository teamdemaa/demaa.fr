export interface ServiceRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  icon: string;
  price?: string;
}

const localData: ServiceRecord[] = [
  {
    id: "1",
    slug: "creation-societe",
    name: "Création de société",
    category: "Finance - Juridique",
    shortDescription: "Toutes les étapes de A à Z",
    description: "De l'idée à l'immatriculation complète. On s'occupe du choix du statut juridique adapté à la situation (SAS, SARL, micro-entreprise…), de la rédaction des statuts, du dépôt du capital en banque, de la publication de l'annonce légale et de l'immatriculation au RCS. Le dirigeant reçoit son Kbis sans avoir à gérer la moindre démarche administrative.",
    tags: ["Création", "Juridique", "Kbis"],
    icon: "Building",
    price: "600 €"
  },
  {
    id: "2",
    slug: "fermeture-societe",
    name: "Fermeture de société",
    category: "Finance - Juridique",
    shortDescription: "Toutes les étapes de A à Z",
    description: "Mettre fin à une société sans en faire un cauchemar administratif. On gère l'intégralité du processus : convocation et tenue de l'assemblée générale de dissolution, rédaction et dépôt des actes, publication de l'annonce légale, liquidation des actifs, clôture des comptes et radiation définitive au RCS.",
    tags: ["Fermeture", "Juridique", "Radiation"],
    icon: "Ban",
    price: "1500 €"
  },
  {
    id: "3",
    slug: "previsionnel-financier",
    name: "Prévisionnel financier",
    category: "Finance - Juridique",
    shortDescription: "Clair avec des chiffres réalistes",
    description: "Un document financier solide et crédible pour convaincre banques, investisseurs ou partenaires. On modélise les hypothèses de chiffre d'affaires, les charges fixes et variables, le seuil de rentabilité, les flux de trésorerie mois par mois et le besoin en financement sur 3 ans. Le tout est présenté dans un format clair, professionnel et défendable face à n'importe quel interlocuteur financier.",
    tags: ["Finance", "Banque", "Business Plan"],
    icon: "TrendingUp",
    price: "550 €"
  },
  {
    id: "4",
    slug: "audit-conformite-fiscale",
    name: "Audit de conformité fiscale",
    category: "Finance - Juridique",
    shortDescription: "Payer le moins possible en cas de contrôle",
    description: "Un contrôle fiscal ne s'annonce pas. L'administration peut remonter trois ans en arrière et chercher ce qui ne va pas : TVA mal appliquée, frais injustifiés, incohérence entre chiffre d'affaires déclaré et flux bancaires. On passe en revue les zones à risque en amont de l'expert-comptable. Chaque anomalie est identifiée et corrigée avant qu'elle ne devienne un problème. Vous recevrez un rapport avec les points à corriger et les optimisations fiscales inexploitées.",
    tags: ["Fiscalité", "Audit", "TVA"],
    icon: "FileSearch",
    price: "1250 €"
  },
  {
    id: "5",
    slug: "strategie-marketing-vente",
    name: "Stratégie Marketing & Vente",
    category: "Marketing - Vente",
    shortDescription: "Construisons les fondations",
    description: "Beaucoup de TPE font du marketing sans stratégie. Cette prestation repart de zéro avec méthode. On analyse le marché, les concurrents, le positionnement de l'offre, les canaux d'acquisition les plus pertinents et le parcours client de bout en bout. Le livrable est un plan d'action concret : qui cibler, avec quel message, sur quel canal, avec quel budget, dans quel ordre. On intègre aussi la vente : tunnel, script, relances.",
    tags: ["Marketing", "Vente", "Stratégie"],
    icon: "Target",
    price: "950 €"
  },
  {
    id: "6",
    slug: "site-web",
    name: "Site web",
    category: "Marketing - Vente",
    shortDescription: "5 pages juste l'essentiel pour vos visiteurs",
    description: "Un site vitrine professionnel qui inspire confiance dès le premier regard. On prend en charge le design sur mesure, la rédaction des contenus, l'optimisation pour les moteurs de recherche (SEO), l'hébergement et la configuration du nom de domaine. Le résultat : un site rapide, responsive et conçu pour convertir les visiteurs en contacts.",
    tags: ["Web", "Design", "SEO"],
    icon: "Laptop",
    price: "750 €"
  },
  {
    id: "7",
    slug: "automatisations-taches",
    name: "Automatisations des tâches",
    category: "Opérations - Systèmes",
    shortDescription: "Gagnez des jours par mois",
    description: "Travailler mieux, pas plus. On identifie les tâches répétitives qui font perdre du temps (relances clients, envoi de factures, mise à jour de tableaux, notifications…) et on les automatise via des plateformes comme Make, Zapier ou n8n. Des process qui tournent seuls et des équipes libérées.",
    tags: ["Automatisation", "Productivité", "Outils"],
    icon: "Settings2",
    price: "Sur devis"
  },
  {
    id: "8",
    slug: "recrutement-efficace",
    name: "Recrutez efficacement",
    category: "Equipe",
    shortDescription: "On identifie les profils adaptés",
    description: "Trouver le bon profil sans y passer des semaines. On rédige l'offre d'emploi, la diffusons sur les jobboards adaptés (Indeed, LinkedIn, Welcome to the Jungle…), trions les candidatures, préqualifions les profils par téléphone et présentons au dirigeant une shortlist de candidats sérieux et vérifiés. Le dirigeant n'a plus qu'à choisir.",
    tags: ["Recrutement", "RH", "Talents"],
    icon: "Users",
    price: "10% du salaire annuel"
  },
  {
    id: "9",
    slug: "formation-francais",
    name: "Formation en français",
    category: "Equipe",
    shortDescription: "Meilleure communication interne et clients",
    description: "On propose des formations au français professionnel, adaptées au secteur d'activité de l'entreprise et au niveau de chaque apprenant débutant, intermédiaire ou avancé, en présentiel ou à distance. Thématiques couvertes : français oral du quotidien, vocabulaire métier, rédaction de documents.",
    tags: ["Formation", "Communication", "Langues"],
    icon: "MessageSquare",
    price: "Sur devis"
  }
];

export async function getServices(): Promise<ServiceRecord[]> {
  // Simulate network delay for ultra-realism (optional, kept small so it's ultra fast)
  return new Promise((resolve) => setTimeout(() => resolve(localData), 20));
}

export async function getServiceBySlug(slug: string): Promise<ServiceRecord | null> {
  const all = await getServices();
  return all.find(s => s.slug === slug) || null;
}
