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
    id: "8",
    slug: "expert-comptable",
    name: "Expert comptable",
    category: "Finance - Juridique",
    shortDescription: "Comptabilité et fiscalité sans stress",
    description: "La tenue complète de votre comptabilité par des professionnels. Nous gérons la saisie des pièces, vos déclarations de TVA, le bilan annuel, la liasse fiscale et le compte de résultat. Un accompagnement rigoureux pour garantir la conformité de votre entreprise face à l'administration.",
    tags: ["Comptabilité", "Bilan", "Fiscalité"],
    icon: "Calculator",
    price: "À partir de 250 €"
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
  },
  {
    id: "9",
    slug: "marketing-vente",
    name: "Système Marketing & Vente",
    category: "Croissance - Ads",
    shortDescription: "Attirer et convertir en automatique",
    description: "Une machine à transformer les prospects en clients. On conçoit votre tunnel de vente complet : aimant à prospects, pages de capture, séquences email automatisées et intégration CRM. Un système clé en main pour que votre équipe commerciale se concentre uniquement sur les rendez-vous qualifiés.",
    tags: ["Marketing", "Vente", "Tunnel"],
    icon: "Target",
    price: "Sur devis"
  },
  {
    id: "13",
    slug: "montage-video",
    name: "Montage Vidéo",
    category: "Croissance - Ads",
    shortDescription: "Des vidéos qui arrêtent le scroll",
    description: "Du brief à la livraison, on monte vos contenus pour les réseaux sociaux, la pub et votre site : rythme, sous-titres, habillage graphique et exports aux bons formats. Des coupes qui servent votre message et renforcent votre image de marque, sans prise de tête technique de votre côté.",
    tags: ["Vidéo", "Social", "Ads"],
    icon: "Video",
    price: "Sur devis"
  },
  {
    id: "10",
    slug: "publicite-google",
    name: "Publicité Google",
    category: "Croissance - Ads",
    shortDescription: "Apparaissez en haut des recherches",
    description: "Ciblez les clients qui vous cherchent activement. Nous créons et gérons vos campagnes Google Search, Shopping et Display. Optimisation maximale du coût par clic (CPC) et du retour sur investissement publicitaire (ROAS). Ne perdez plus un centime en diffusion inutile.",
    tags: ["Google Ads", "Search", "SEA"],
    icon: "Search",
    price: "Frais de gestion %"
  },
  {
    id: "11",
    slug: "publicite-facebook",
    name: "Publicité Facebook",
    category: "Croissance - Ads",
    shortDescription: "Le réseau social n°1 pour convertir",
    description: "Exploitez la puissance de l'algorithme Meta. Création de visuels percutants, micro-ciblage d'audience et gestion de campagnes Facebook & Instagram. Idéal pour bâtir une notoriété massive ou générer des ventes directes sur un catalogue produit.",
    tags: ["Facebook", "Instagram", "Meta"],
    icon: "Share2",
    price: "Frais de gestion %"
  },
  {
    id: "12",
    slug: "publicite-tiktok",
    name: "Publicité Tiktok",
    category: "Croissance - Ads",
    shortDescription: "Captez l'attention de la nouvelle génération",
    description: "Le levier le plus puissant du moment. On vous accompagne sur la création de contenus natifs 'User Generated Content' (UGC) et le pilotage de vos TikTok Ads. Profitez de coûts d'acquisition encore très bas pour développer vos ventes rapidement.",
    tags: ["TikTok", "UGC", "Viral"],
    icon: "Music",
    price: "Frais de gestion %"
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
  { id: "t10", slug: "generation-de-qr-code", name: "Génération de QR code", category: "Outils visuels", description: "Créez un simple QR code pointant vers l'URL de votre choix.", shortDescription: "QR code simple", tags: ["QR", "Lien"], icon: "Link", price: "Gratuit" },
  { id: "t2", slug: "carte-de-visite-qr-code-whatsapp", name: "Carte de Visite QR Code WhatsApp", category: "Outils visuels", description: "Créez facilement des QR codes optimisés pour vos cartes de visite.", shortDescription: "Pour carte de visite", tags: ["QR", "Card"], icon: "QrCode", price: "Gratuit" },
  { id: "t4", slug: "qr-code-pour-avis-client", name: "QR code pour avis client", category: "Marketing", description: "Incitez vos clients à laisser un avis positif avec ce QR code magique.", shortDescription: "Collecte d'avis", tags: ["Avis", "QR"], icon: "Star", price: "Gratuit" },
  { id: "t7", slug: "qr-code-commande-rapide", name: "QR code commande rapide", category: "Vente", description: "Facilitez la commande de vos produits grâce à un QR code menant directement au paiement.", shortDescription: "Vente express", tags: ["Vente", "QR"], icon: "ShoppingCart", price: "Gratuit" },
  { id: "t9", slug: "generation-de-menu-qr-code", name: "Génération menu QR code", category: "Automatisation", description: "Transformez votre carte de restaurant en menu digital scannable.", shortDescription: "Menu sans contact", tags: ["Restaurant", "QR"], icon: "Utensils", price: "Gratuit" },
  { id: "t5", slug: "creation-de-fiche-google-optimisee", name: "Création de fiche Google", category: "Marketing", description: "Optimisez votre référencement local grâce à une fiche Google parfaitement remplie.", shortDescription: "Boostez votre SEO local", tags: ["Google", "SEO"], icon: "MapPin", price: "Gratuit" },
  { id: "t3", slug: "generation-de-tampon", name: "Génération de Tampon", category: "Outils visuels", description: "Un outil pour concevoir et générer votre tampon d'entreprise virtuel personnalisé.", shortDescription: "Créez votre tampon", tags: ["Design", "Admin"], icon: "Stamp", price: "Gratuit" },
  { id: "t6", slug: "signature-pro", name: "Signature email pro", category: "Outils visuels", description: "Générez une signature mail esthétique et responsive pour toute votre équipe.", shortDescription: "Emails premium", tags: ["Email", "Pro"], icon: "Signature", price: "Gratuit" },
  { id: "t8", slug: "signez-un-document-electroniquement", name: "Signez un document", category: "Juridique", description: "Apposez votre signature électronique sur n'importe quel contrat PDF.", shortDescription: "e-Signature légale", tags: ["Signature", "PDF"], icon: "PenTool", price: "Gratuit" }
];

export const systemsData: ServiceRecord[] = [
  { id: "s1", slug: "agence-immobiliere", name: "Agence immobilière", category: "Système Sectoriel", description: "Optimisez vos mandats et la gestion de vos visites.", tags: ["Immo", "Système"], icon: "Home", price: "Audit Gratuit" },
  { id: "s2", slug: "agence-marketing", name: "Agence marketing", category: "Système Sectoriel", description: "Automatisez votre prospection et le reporting client.", tags: ["Marketing", "Système"], icon: "Megaphone", price: "Audit Gratuit" },
  { id: "s3", slug: "agence-web", name: "Agence web", category: "Système Sectoriel", description: "Structurez votre production technique et vos livrables.", tags: ["Web", "Système"], icon: "Code", price: "Audit Gratuit" },
  { id: "s4", slug: "artisanat", name: "Artisanat", category: "Système Sectoriel", description: "Suivez vos chantiers et factures sans perdre de temps.", tags: ["Artisan", "Système"], icon: "Hammer", price: "Audit Gratuit" },
  { id: "s5", slug: "btp", name: "BTP", category: "Système Sectoriel", description: "Gérez vos équipes et vos approvisionnements en temps réel.", tags: ["BTP", "Système"], icon: "Building2", price: "Audit Gratuit" },
  { id: "s6", slug: "boulangerie", name: "Boulangerie", category: "Système Sectoriel", description: "Optimisez vos stocks et vos ventes en boutique.", tags: ["Boulangerie", "Système"], icon: "Croissant", price: "Audit Gratuit" },
  { id: "s7", slug: "coaching", name: "Coaching", category: "Système Sectoriel", description: "Automatisez vos prises de rendez-vous et vos suivis.", tags: ["Coaching", "Système"], icon: "UserCheck", price: "Audit Gratuit" },
  { id: "s8", slug: "commerce-de-detail", name: "Commerce de détail", category: "Système Sectoriel", description: "Un système d'inventaire et de fidélisation clients.", tags: ["Retail", "Système"], icon: "Store", price: "Audit Gratuit" },
  { id: "s9", slug: "conciergerie-airbnb", name: "Conciergerie Airbnb", category: "Système Sectoriel", description: "Automatisez les arrivées et le ménage de vos locations.", tags: ["Airbnb", "Système"], icon: "Key", price: "Audit Gratuit" },
  { id: "s10", slug: "consulting", name: "Consulting", category: "Système Sectoriel", description: "Industrialisez votre expertise pour croître sans limite.", tags: ["Consulting", "Système"], icon: "Briefcase", price: "Audit Gratuit" },
  { id: "s11", slug: "creation-de-contenu", name: "Création de contenu", category: "Système Sectoriel", description: "Un workflow de production fluide de l'idée à la publication.", tags: ["Contenu", "Système"], icon: "Camera", price: "Audit Gratuit" },
  { id: "s12", slug: "demenagement", name: "Déménagement", category: "Système Sectoriel", description: "Optimisez vos devis et la planification de vos tournées.", tags: ["Déménagement", "Système"], icon: "Truck", price: "Audit Gratuit" },
  { id: "s13", slug: "evenementiel", name: "Événementiel", category: "Système Sectoriel", description: "Un pilotage de projet rigoureux pour des événements sans stress.", tags: ["Événement", "Système"], icon: "PartyPopper", price: "Audit Gratuit" },
  { id: "s14", slug: "e-commerce", name: "E-commerce", category: "Système Sectoriel", description: "Optimisez vos conversions et votre logistique d'expédition.", tags: ["Ecommerce", "Système"], icon: "ShoppingBag", price: "Audit Gratuit" },
  { id: "s15", slug: "formation-en-ligne", name: "Formation en ligne", category: "Système Sectoriel", description: "Scalez votre transmission de savoir avec un LMS automatisé.", tags: ["Formation", "Système"], icon: "GraduationCap", price: "Audit Gratuit" },
  { id: "s16", slug: "freelance", name: "Freelance", category: "Système Sectoriel", description: "Ne courez plus après vos clients, structurez votre offre.", tags: ["Freelance", "Système"], icon: "Laptop", price: "Audit Gratuit" },
  { id: "s17", slug: "garage-automobile", name: "Garage automobile", category: "Système Sectoriel", description: "Suivez vos réparations et optimisez votre planning atelier.", tags: ["Garage", "Système"], icon: "Wrench", price: "Audit Gratuit" },
  { id: "s18", slug: "gestion-comptable", name: "Gestion comptable", category: "Système Sectoriel", description: "Fluidifiez vos échanges de documents avec vos clients.", tags: ["Compta", "Système"], icon: "Calculator", price: "Audit Gratuit" },
  { id: "s19", slug: "institut-de-beaute", name: "Institut de beauté", category: "Système Sectoriel", description: "Optimisez vos agendas et vos ventes de produits.", tags: ["Beauté", "Système"], icon: "Flower2", price: "Audit Gratuit" },
  { id: "s20", slug: "investissement-locatif", name: "Investissement locatif", category: "Système Sectoriel", description: "Suivez votre rentabilité et vos travaux en un seul endroit.", tags: ["Immo", "Système"], icon: "Landmark", price: "Audit Gratuit" },
  { id: "s21", slug: "livraison-dernier-kilometre", name: "Livraison dernier kilomètre", category: "Système Sectoriel", description: "Un système de routage efficace pour vos livreurs.", tags: ["Livraison", "Système"], icon: "Navigation", price: "Audit Gratuit" },
  { id: "s22", slug: "location-de-materiel", name: "Location de matériel", category: "Système Sectoriel", description: "Gérez vos stocks et vos contrats de location.", tags: ["Location", "Système"], icon: "Dolly", price: "Audit Gratuit" },
  { id: "s23", slug: "maintenance-informatique", name: "Maintenance informatique", category: "Système Sectoriel", description: "Un système de ticketing et de maintenance préventive.", tags: ["IT", "Système"], icon: "Cpu", price: "Audit Gratuit" },
  { id: "s24", slug: "marketplace", name: "Marketplace", category: "Système Sectoriel", description: "Structurez vos flux vendeurs et paiements complexes.", tags: ["Marketplace", "Système"], icon: "Layers", price: "Audit Gratuit" },
  { id: "s25", slug: "media", name: "Média", category: "Système Sectoriel", description: "Gérez votre régie publicitaire et vos publications.", tags: ["Média", "Système"], icon: "Newspaper", price: "Audit Gratuit" },
  { id: "s26", slug: "nettoyage-professionnel", name: "Nettoyage professionnel", category: "Système Sectoriel", description: "Contrôlez vos passages et optimisez vos tournées.", tags: ["Nettoyage", "Système"], icon: "Sparkles", price: "Audit Gratuit" },
  { id: "s27", slug: "organisme-de-formation", name: "Organisme de formation", category: "Système Sectoriel", description: "Simplifiez votre conformité Qualiopi et vos inscriptions.", tags: ["Formation", "Système"], icon: "FileCheck2", price: "Audit Gratuit" },
  { id: "s28", slug: "photographe-videaste", name: "Photographe / vidéaste", category: "Système Sectoriel", description: "Workflows d'édition et galeries clients automatisées.", tags: ["Photo", "Système"], icon: "Aperture", price: "Audit Gratuit" },
  { id: "s29", slug: "reparation-telephonique", name: "Réparation téléphonique", category: "Système Sectoriel", description: "Gérez vos pièces détachées et le suivi client.", tags: ["Reparation", "Système"], icon: "Smartphone", price: "Audit Gratuit" },
  { id: "s30", slug: "restaurant", name: "Restaurant", category: "Système Sectoriel", description: "Optimisez vos ratios et simplifiez votre service.", tags: ["Restaurant", "Système"], icon: "Utensils", price: "Audit Gratuit" },
  { id: "s31", slug: "saas", name: "SaaS", category: "Système Sectoriel", description: "Optimisez votre MRR et le support client.", tags: ["SaaS", "Système"], icon: "Cloud", price: "Audit Gratuit" },
  { id: "s32", slug: "salle-de-sport", name: "Salle de sport", category: "Système Sectoriel", description: "Gérez vos abonnements et vos plannings de cours.", tags: ["Sport", "Système"], icon: "Dumbbell", price: "Audit Gratuit" },
  { id: "s33", slug: "salon-de-coiffure", name: "Salon de coiffure", category: "Système Sectoriel", description: "Une gestion d'agenda sans failles et des ventes upsell.", tags: ["Coiffure", "Système"], icon: "Scissors", price: "Audit Gratuit" },
  { id: "s34", slug: "securite-privee", name: "Sécurité privée", category: "Système Sectoriel", description: "Planification des agents et rapports d'intervention.", tags: ["Sécurité", "Système"], icon: "Shield", price: "Audit Gratuit" },
  { id: "s35", slug: "services-a-la-personne", name: "Services à la personne", category: "Système Sectoriel", description: "Une coordination d'intervenants pour un service irréprochable.", tags: ["Services", "Système"], icon: "HeartHandshake", price: "Audit Gratuit" },
  { id: "s36", slug: "traiteur", name: "Traiteur", category: "Système Sectoriel", description: "Optimisez vos fiches techniques et vos événements.", tags: ["Traiteur", "Système"], icon: "ChefHat", price: "Audit Gratuit" },
  { id: "s37", slug: "transport-de-marchandise", name: "Transport de marchandise", category: "Système Sectoriel", description: "Un suivi de flotte et de fret en temps réel.", tags: ["Logistique", "Système"], icon: "Box", price: "Audit Gratuit" },
  { id: "s38", slug: "transport-de-personnes", name: "Transport de personnes", category: "Système Sectoriel", description: "Optimisez vos trajets et votre gestion de chauffeurs.", tags: ["VTC", "Système"], icon: "Car", price: "Audit Gratuit" }
];

export async function getTools(): Promise<ServiceRecord[]> {
  return new Promise((resolve) => setTimeout(() => resolve(toolsData), 10));
}

export async function getSystems(): Promise<ServiceRecord[]> {
  return new Promise((resolve) => setTimeout(() => resolve(systemsData), 10));
}

export async function getToolBySlug(slug: string): Promise<ServiceRecord | null> {
  const all = await getTools();
  return all.find(t => t.slug === slug) || null;
}

export async function getSystemBySlug(slug: string): Promise<ServiceRecord | null> {
  const all = await getSystems();
  return all.find(s => s.slug === slug) || null;
}
