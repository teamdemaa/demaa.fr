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
  /*
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
  */
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
    id: "7",
    slug: "automatisations-taches",
    name: "Automatisation des tâches",
    category: "Opérations - Systèmes",
    shortDescription: "Gagnez des jours par mois",
    description: "Travailler mieux, pas plus. On identifie les tâches répétitives qui font perdre du temps (relances clients, envoi de factures, mise à jour de tableaux, notifications…) et on les automatise via des plateformes comme Make, Zapier ou n8n. Des process qui tournent seuls et des équipes libérées.",
    tags: ["Automatisation", "Productivité", "Outils"],
    icon: "Settings2",
    price: "Sur devis"
  },
  {
    id: "6",
    slug: "site-web",
    name: "Site web",
    category: "Opérations - Systèmes",
    shortDescription: "5 pages juste l'essentiel pour vos visiteurs",
    description: "Un site vitrine professionnel qui inspire confiance dès le premier regard. On prend en charge le design sur mesure, la rédaction des contenus, l'optimisation pour les moteurs de recherche (SEO), l'hébergement et la configuration du nom de domaine. Le résultat : un site rapide, responsive et conçu pour convertir les visiteurs en contacts.",
    tags: ["Web", "Design", "SEO"],
    icon: "Laptop",
    price: "750 €"
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

export const toolsData: ServiceRecord[] = [
  { id: "t2", slug: "generation-de-qr-code-pour-card", name: "Génération de QR code pour card", category: "Outils visuels", description: "Créez facilement des QR codes optimisés pour vos cartes de visite.", shortDescription: "Pour carte de visite", tags: ["QR", "Card"], icon: "QrCode", price: "Gratuit" },
  { id: "t3", slug: "generation-de-tampon", name: "Génération de Tampon", category: "Outils visuels", description: "Un outil pour concevoir et générer votre tampon d'entreprise virtuel personnalisé.", shortDescription: "Créez votre tampon", tags: ["Design", "Admin"], icon: "Stamp", price: "Gratuit" },
  { id: "t4", slug: "qr-code-pour-avis-client", name: "QR code pour avis client", category: "Marketing", description: "Incitez vos clients à laisser un avis positif avec ce QR code magique.", shortDescription: "Collecte d'avis", tags: ["Avis", "QR"], icon: "Star", price: "Gratuit" },
  { id: "t5", slug: "creation-de-fiche-google-optimisee", name: "Création de fiche Google", category: "Marketing", description: "Optimisez votre référencement local grâce à une fiche Google parfaitement remplie.", shortDescription: "Boostez votre SEO local", tags: ["Google", "SEO"], icon: "MapPin", price: "Gratuit" },
  { id: "t6", slug: "signature-email-pro", name: "Signature email pro", category: "Outils visuels", description: "Générez une signature mail esthétique et responsive pour toute votre équipe.", shortDescription: "Emails premium", tags: ["Email", "Pro"], icon: "MailSignature", price: "Gratuit" },
  { id: "t7", slug: "qr-code-commande-rapide", name: "QR code commande rapide", category: "Vente", description: "Facilitez la commande de vos produits grâce à un QR code menant directement au paiement.", shortDescription: "Vente express", tags: ["Vente", "QR"], icon: "ShoppingCart", price: "Gratuit" },
  { id: "t8", slug: "signez-un-document-electroniquement", name: "Signez un document", category: "Juridique", description: "Apposez votre signature électronique sur n'importe quel contrat PDF.", shortDescription: "e-Signature légale", tags: ["Signature", "PDF"], icon: "PenTool", price: "Gratuit" },
  { id: "t9", slug: "generation-de-menu-avec-qr-code", name: "Génération menu QR code", category: "Automatisation", description: "Transformez votre carte de restaurant en menu digital scannable.", shortDescription: "Menu sans contact", tags: ["Restaurant", "QR"], icon: "Utensils", price: "Gratuit" },
  { id: "t10", slug: "generation-de-qr-code", name: "Génération de QR code", category: "Outils visuels", description: "Créez un simple QR code pointant vers l'URL de votre choix.", shortDescription: "QR code simple", tags: ["QR", "Lien"], icon: "Link", price: "Gratuit" }
];

export async function getTools(): Promise<ServiceRecord[]> {
  return new Promise((resolve) => setTimeout(() => resolve(toolsData), 10));
}

export async function getToolBySlug(slug: string): Promise<ServiceRecord | null> {
  const all = await getTools();
  return all.find(t => t.slug === slug) || null;
}
