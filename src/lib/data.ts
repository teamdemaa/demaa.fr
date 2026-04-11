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
  { id: "t8", slug: "signez-un-document-electroniquement", name: "Signez un document", category: "Juridique", description: "Apposez votre signature électronique sur n'importe quel contrat PDF.", shortDescription: "e-Signature légale", tags: ["Signature", "PDF"], icon: "PenTool", price: "Gratuit" },
  { id: "t11", slug: "chatgpt", name: "ChatGPT", category: "IA bureautique", description: "Rédaction, synthèse, recherche d'idées, emails, tableaux et assistance quotidienne pour gagner du temps sur les tâches de bureau.", shortDescription: "Assistant IA généraliste", tags: ["IA", "Bureautique", "Rédaction"], icon: "MessageSquare", price: "Freemium" },
  { id: "t12", slug: "claude", name: "Claude", category: "IA bureautique", description: "Assistant IA utile pour analyser des documents longs, structurer des idées, écrire des contenus et préparer des notes claires.", shortDescription: "Analyse et rédaction", tags: ["IA", "Bureautique", "Documents"], icon: "Brain", price: "Freemium" },
  { id: "t13", slug: "gemini", name: "Gemini", category: "IA bureautique", description: "Assistant IA intégré à l'écosystème Google pour aider à écrire, résumer, organiser et travailler plus vite sur les contenus du quotidien.", shortDescription: "IA Google Workspace", tags: ["IA", "Google", "Bureautique"], icon: "Sparkles", price: "Freemium" },
  { id: "t14", slug: "notion-ai", name: "Notion AI", category: "IA bureautique", description: "Aide à transformer vos notes, bases de connaissances et comptes rendus en documents plus clairs et mieux organisés.", shortDescription: "Notes et organisation", tags: ["IA", "Notes", "Organisation"], icon: "NotebookPen", price: "Payant" },
  { id: "t15", slug: "microsoft-copilot", name: "Microsoft Copilot", category: "IA bureautique", description: "Assistant IA pour Microsoft 365, utile pour accélérer la rédaction, les présentations, les emails et l'analyse de fichiers.", shortDescription: "IA Microsoft 365", tags: ["IA", "Bureautique", "Microsoft"], icon: "FileText", price: "Payant" },
  { id: "t16", slug: "codex", name: "Codex", category: "IA développement", description: "Assistant de développement pour comprendre une base de code, proposer des modifications, automatiser des tâches techniques et accélérer les itérations.", shortDescription: "Agent de code", tags: ["IA", "Développement", "Code"], icon: "Terminal", price: "Payant" },
  { id: "t17", slug: "cursor", name: "Cursor", category: "IA développement", description: "Éditeur de code avec IA intégrée pour écrire, modifier et comprendre du code plus rapidement dans les projets techniques.", shortDescription: "Éditeur IA", tags: ["IA", "Code", "IDE"], icon: "Code2", price: "Freemium" },
  { id: "t18", slug: "github-copilot", name: "GitHub Copilot", category: "IA développement", description: "Assistant de code dans l'éditeur pour générer des fonctions, compléter du code et aider les équipes à développer plus vite.", shortDescription: "Assistant code", tags: ["IA", "Développement", "GitHub"], icon: "Code2", price: "Payant" },
  { id: "t19", slug: "lovable", name: "Lovable", category: "IA développement", description: "Outil pour générer rapidement des interfaces et prototypes web à partir d'instructions en langage naturel.", shortDescription: "Prototype web IA", tags: ["IA", "No-code", "Prototype"], icon: "Workflow", price: "Freemium" },
  { id: "t20", slug: "replit", name: "Replit", category: "IA développement", description: "Environnement de développement en ligne avec assistance IA pour créer, tester et déployer des projets rapidement.", shortDescription: "Dev en ligne", tags: ["IA", "Développement", "Cloud"], icon: "Terminal", price: "Freemium" },
  { id: "t21", slug: "descript", name: "Descript", category: "Création de contenu", description: "Montage audio et vidéo orienté texte, pratique pour podcasts, formations, interviews et contenus courts.", shortDescription: "Montage audio vidéo", tags: ["Vidéo", "Audio", "IA"], icon: "Video", price: "Freemium" },
  { id: "t22", slug: "heygen", name: "HeyGen", category: "Création de contenu", description: "Création de vidéos avec avatars IA, doublage et traduction pour produire plus vite des contenus marketing ou pédagogiques.", shortDescription: "Avatars vidéo IA", tags: ["Vidéo", "Avatar", "IA"], icon: "MonitorPlay", price: "Freemium" },
  { id: "t23", slug: "canva", name: "Canva", category: "Création de contenu", description: "Création de visuels, présentations, documents et contenus social media avec modèles prêts à personnaliser.", shortDescription: "Design simple", tags: ["Design", "Contenu", "Social"], icon: "PenTool", price: "Freemium" },
  { id: "t24", slug: "capcut", name: "CapCut", category: "Création de contenu", description: "Montage vidéo rapide pour formats courts, sous-titres, templates social media et contenus orientés réseaux sociaux.", shortDescription: "Montage réseaux sociaux", tags: ["Vidéo", "Social", "Montage"], icon: "Video", price: "Freemium" },
  { id: "t25", slug: "elevenlabs", name: "ElevenLabs", category: "Création de contenu", description: "Génération de voix IA et doublage pour vidéos, podcasts, modules de formation ou contenus multilingues.", shortDescription: "Voix IA", tags: ["Audio", "Voix", "IA"], icon: "Mic", price: "Freemium" },
  { id: "t26", slug: "digiforma", name: "Digiforma", category: "Organismes de formation", description: "Gestion administrative d'un organisme de formation : sessions, conventions, émargement, documents et suivi Qualiopi.", shortDescription: "Gestion formation", tags: ["Formation", "Qualiopi", "Gestion"], icon: "GraduationCap", price: "Payant" },
  { id: "t27", slug: "360learning", name: "360Learning", category: "Organismes de formation", description: "Plateforme LMS collaborative pour créer, diffuser et suivre des parcours de formation en ligne.", shortDescription: "LMS collaboratif", tags: ["Formation", "LMS", "E-learning"], icon: "School", price: "Payant" },
  { id: "t28", slug: "teachizy", name: "Teachizy", category: "Organismes de formation", description: "Plateforme française pour vendre et héberger des formations en ligne, avec pages, paiements et espace apprenant.", shortDescription: "Vendre ses formations", tags: ["Formation", "LMS", "Vente"], icon: "BookOpen", price: "Payant" },
  { id: "t29", slug: "learndash", name: "LearnDash", category: "Organismes de formation", description: "Extension LMS pour WordPress permettant de créer des cours, quiz, parcours et espaces apprenants.", shortDescription: "LMS WordPress", tags: ["Formation", "WordPress", "LMS"], icon: "BookOpen", price: "Payant" },
  { id: "t30", slug: "livestorm", name: "Livestorm", category: "Organismes de formation", description: "Outil de webinaire et classe virtuelle pour organiser des sessions live, suivre les participants et automatiser les relances.", shortDescription: "Webinaires formation", tags: ["Formation", "Webinaire", "Classe virtuelle"], icon: "Presentation", price: "Freemium" },
  { id: "t31", slug: "dendreo", name: "Dendreo", category: "Organismes de formation", description: "Logiciel de gestion pour organismes de formation : planning, documents, évaluations, suivi administratif et qualité.", shortDescription: "ERP formation", tags: ["Formation", "Qualiopi", "Administration"], icon: "ClipboardList", price: "Payant" }
];

export const systemsData: ServiceRecord[] = [
  { id: "s1", slug: "agence-immobiliere", name: "Agence immobilière", category: "Système Sectoriel", description: "Optimisez vos mandats et la gestion de vos visites.", tags: ["Immo", "Système"], icon: "Home", price: "" },
  { id: "s2", slug: "agence-marketing", name: "Agence marketing", category: "Système Sectoriel", description: "Automatisez votre prospection et le reporting client.", tags: ["Marketing", "Système"], icon: "Megaphone", price: "" },
  { id: "s3", slug: "agence-web", name: "Agence web", category: "Système Sectoriel", description: "Structurez votre production technique et vos livrables.", tags: ["Web", "Système"], icon: "Code", price: "" },
  { id: "s4", slug: "artisanat", name: "Artisanat", category: "Système Sectoriel", description: "Suivez vos chantiers et factures sans perdre de temps.", tags: ["Artisan", "Système"], icon: "Hammer", price: "" },
  { id: "s5", slug: "btp", name: "BTP", category: "Système Sectoriel", description: "Gérez vos équipes et vos approvisionnements en temps réel.", tags: ["BTP", "Système"], icon: "Building2", price: "" },
  { id: "s6", slug: "boulangerie", name: "Boulangerie", category: "Système Sectoriel", description: "Optimisez vos stocks et vos ventes en boutique.", tags: ["Boulangerie", "Système"], icon: "Croissant", price: "" },
  { id: "s7", slug: "coaching", name: "Coaching", category: "Système Sectoriel", description: "Automatisez vos prises de rendez-vous et vos suivis.", tags: ["Coaching", "Système"], icon: "UserCheck", price: "" },
  { id: "s8", slug: "commerce-de-detail", name: "Commerce de détail", category: "Système Sectoriel", description: "Un système d'inventaire et de fidélisation clients.", tags: ["Retail", "Système"], icon: "Store", price: "" },
  { id: "s9", slug: "conciergerie-airbnb", name: "Conciergerie Airbnb", category: "Système Sectoriel", description: "Automatisez les arrivées et le ménage de vos locations.", tags: ["Airbnb", "Système"], icon: "Key", price: "" },
  { id: "s10", slug: "consulting", name: "Consulting", category: "Système Sectoriel", description: "Industrialisez votre expertise pour croître sans limite.", tags: ["Consulting", "Système"], icon: "Briefcase", price: "" },
  { id: "s11", slug: "creation-de-contenu", name: "Création de contenu", category: "Système Sectoriel", description: "Un workflow de production fluide de l'idée à la publication.", tags: ["Contenu", "Système"], icon: "Camera", price: "" },
  { id: "s12", slug: "demenagement", name: "Déménagement", category: "Système Sectoriel", description: "Optimisez vos devis et la planification de vos tournées.", tags: ["Déménagement", "Système"], icon: "Truck", price: "" },
  { id: "s13", slug: "evenementiel", name: "Événementiel", category: "Système Sectoriel", description: "Un pilotage de projet rigoureux pour des événements sans stress.", tags: ["Événement", "Système"], icon: "PartyPopper", price: "" },
  { id: "s14", slug: "e-commerce", name: "E-commerce", category: "Système Sectoriel", description: "Optimisez vos conversions et votre logistique d'expédition.", tags: ["Ecommerce", "Système"], icon: "ShoppingBag", price: "" },
  { id: "s15", slug: "formation-en-ligne", name: "Formation en ligne", category: "Système Sectoriel", description: "Scalez votre transmission de savoir avec un LMS automatisé.", tags: ["Formation", "Système"], icon: "GraduationCap", price: "" },
  { id: "s16", slug: "freelance", name: "Freelance", category: "Système Sectoriel", description: "Ne courez plus après vos clients, structurez votre offre.", tags: ["Freelance", "Système"], icon: "Laptop", price: "" },
  { id: "s17", slug: "garage-automobile", name: "Garage automobile", category: "Système Sectoriel", description: "Suivez vos réparations et optimisez votre planning atelier.", tags: ["Garage", "Système"], icon: "Wrench", price: "" },
  { id: "s18", slug: "gestion-comptable", name: "Gestion comptable", category: "Système Sectoriel", description: "Fluidifiez vos échanges de documents avec vos clients.", tags: ["Compta", "Système"], icon: "Calculator", price: "" },
  { id: "s19", slug: "institut-de-beaute", name: "Institut de beauté", category: "Système Sectoriel", description: "Optimisez vos agendas et vos ventes de produits.", tags: ["Beauté", "Système"], icon: "Flower2", price: "" },
  { id: "s20", slug: "investissement-locatif", name: "Investissement locatif", category: "Système Sectoriel", description: "Suivez votre rentabilité et vos travaux en un seul endroit.", tags: ["Immo", "Système"], icon: "Landmark", price: "" },
  { id: "s21", slug: "livraison-dernier-kilometre", name: "Livraison dernier kilomètre", category: "Système Sectoriel", description: "Un système de routage efficace pour vos livreurs.", tags: ["Livraison", "Système"], icon: "Navigation", price: "" },
  { id: "s22", slug: "location-de-materiel", name: "Location de matériel", category: "Système Sectoriel", description: "Gérez vos stocks et vos contrats de location.", tags: ["Location", "Système"], icon: "Dolly", price: "" },
  { id: "s23", slug: "maintenance-informatique", name: "Maintenance informatique", category: "Système Sectoriel", description: "Un système de ticketing et de maintenance préventive.", tags: ["IT", "Système"], icon: "Cpu", price: "" },
  { id: "s24", slug: "marketplace", name: "Marketplace", category: "Système Sectoriel", description: "Structurez vos flux vendeurs et paiements complexes.", tags: ["Marketplace", "Système"], icon: "Layers", price: "" },
  { id: "s25", slug: "media", name: "Média", category: "Système Sectoriel", description: "Gérez votre régie publicitaire et vos publications.", tags: ["Média", "Système"], icon: "Newspaper", price: "" },
  { id: "s26", slug: "nettoyage-professionnel", name: "Nettoyage professionnel", category: "Système Sectoriel", description: "Contrôlez vos passages et optimisez vos tournées.", tags: ["Nettoyage", "Système"], icon: "Sparkles", price: "" },
  { id: "s27", slug: "organisme-de-formation", name: "Organisme de formation", category: "Système Sectoriel", description: "Simplifiez votre conformité Qualiopi et vos inscriptions.", tags: ["Formation", "Système"], icon: "FileCheck2", price: "" },
  { id: "s28", slug: "photographe-videaste", name: "Photographe / vidéaste", category: "Système Sectoriel", description: "Workflows d'édition et galeries clients automatisées.", tags: ["Photo", "Système"], icon: "Aperture", price: "" },
  { id: "s29", slug: "reparation-telephonique", name: "Réparation téléphonique", category: "Système Sectoriel", description: "Gérez vos pièces détachées et le suivi client.", tags: ["Reparation", "Système"], icon: "Smartphone", price: "" },
  { id: "s30", slug: "restaurant", name: "Restaurant", category: "Système Sectoriel", description: "Optimisez vos ratios et simplifiez votre service.", tags: ["Restaurant", "Système"], icon: "Utensils", price: "" },
  { id: "s31", slug: "saas", name: "SaaS", category: "Système Sectoriel", description: "Optimisez votre MRR et le support client.", tags: ["SaaS", "Système"], icon: "Cloud", price: "" },
  { id: "s32", slug: "salle-de-sport", name: "Salle de sport", category: "Système Sectoriel", description: "Gérez vos abonnements et vos plannings de cours.", tags: ["Sport", "Système"], icon: "Dumbbell", price: "" },
  { id: "s33", slug: "salon-de-coiffure", name: "Salon de coiffure", category: "Système Sectoriel", description: "Une gestion d'agenda sans failles et des ventes upsell.", tags: ["Coiffure", "Système"], icon: "Scissors", price: "" },
  { id: "s34", slug: "securite-privee", name: "Sécurité privée", category: "Système Sectoriel", description: "Planification des agents et rapports d'intervention.", tags: ["Sécurité", "Système"], icon: "Shield", price: "" },
  { id: "s35", slug: "services-a-la-personne", name: "Services à la personne", category: "Système Sectoriel", description: "Une coordination d'intervenants pour un service irréprochable.", tags: ["Services", "Système"], icon: "HeartHandshake", price: "" },
  { id: "s36", slug: "traiteur", name: "Traiteur", category: "Système Sectoriel", description: "Optimisez vos fiches techniques et vos événements.", tags: ["Traiteur", "Système"], icon: "ChefHat", price: "" },
  { id: "s37", slug: "transport-de-marchandise", name: "Transport de marchandise", category: "Système Sectoriel", description: "Un suivi de flotte et de fret en temps réel.", tags: ["Logistique", "Système"], icon: "Box", price: "" },
  { id: "s38", slug: "transport-de-personnes", name: "Transport de personnes", category: "Système Sectoriel", description: "Optimisez vos trajets et votre gestion de chauffeurs.", tags: ["VTC", "Système"], icon: "Car", price: "" }
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
