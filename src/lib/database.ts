import { Tool, Service, Template, System } from './types';

// Base de données centralisée
export const database = {
  tools: [
    {
      id: "t2",
      slug: "carte-de-visite-qr-code-whatsapp",
      name: "Carte de Visite QR Code WhatsApp",
      category: "Outils visuels",
      description: "Créez facilement des QR codes optimisés pour vos cartes de visite.",
      shortDescription: "Pour carte de visite",
      tags: ["QRCode", "Card", "Vente"],
      icon: "QrCode",
      price: "Gratuit"
    },
    {
      id: "t3",
      slug: "generation-de-tampon",
      name: "Génération de Tampon",
      category: "Outils visuels",
      description: "Un outil pour concevoir et générer votre tampon d'entreprise virtuel personnalisé.",
      shortDescription: "Créez votre tampon",
      tags: ["Design", "Admin"],
      icon: "Stamp",
      price: "Gratuit"
    },
    {
      id: "t4",
      slug: "qr-code-pour-avis-client",
      name: "QR code pour avis client",
      category: "Marketing",
      description: "Incitez vos clients à laisser un avis positif avec ce QR code magique.",
      shortDescription: "Collecte d'avis",
      tags: ["Avis", "QRCode", "Marketing"],
      icon: "Star",
      price: "Gratuit"
    },
    {
      id: "t5",
      slug: "creation-de-fiche-google-optimisee",
      name: "Création de fiche Google",
      category: "Marketing",
      description: "Optimisez votre référencement local grâce à une fiche Google parfaitement remplie.",
      shortDescription: "Boostez votre SEO local",
      tags: ["Google", "SEO", "Marketing"],
      icon: "MapPin",
      price: "Gratuit"
    },
    {
      id: "t6",
      slug: "signature-pro",
      name: "Signature email pro",
      category: "Outils visuels",
      description: "Générez une signature mail esthétique et responsive pour toute votre équipe.",
      shortDescription: "Emails premium",
      tags: ["Email", "Signature", "Design"],
      icon: "Signature",
      price: "Gratuit"
    },
    {
      id: "t7",
      slug: "qr-code-commande-rapide",
      name: "QR code commande rapide",
      category: "Vente",
      description: "Facilitez la commande de vos produits grâce à un QR code menant directement au paiement.",
      shortDescription: "Vente express",
      tags: ["Vente", "QRCode", "E-commerce"],
      icon: "ShoppingCart",
      price: "Gratuit"
    },
    {
      id: "t8",
      slug: "signez-un-document-electroniquement",
      name: "Signez un document",
      category: "Juridique",
      description: "Apposez votre signature électronique sur n'importe quel contrat PDF.",
      shortDescription: "e-Signature légale",
      tags: ["Signature", "PDF", "Juridique"],
      icon: "PenTool",
      price: "Gratuit"
    },
    {
      id: "t9",
      slug: "generation-de-menu-qr-code",
      name: "Génération menu QR code",
      category: "Automatisation",
      description: "Transformez votre carte de restaurant en menu digital scannable.",
      shortDescription: "Menu sans contact",
      tags: ["Restaurant", "QRCode", "Digital"],
      icon: "Utensils",
      price: "Gratuit"
    },
    {
      id: "t10",
      slug: "generation-de-qr-code",
      name: "Génération de QR code",
      category: "Outils visuels",
      description: "Créez un simple QR code pointant vers l'URL de votre choix.",
      shortDescription: "QR code simple",
      tags: ["QRCode", "Lien"],
      icon: "Link",
      price: "Gratuit"
    }
  ] as Tool[],

  services: [
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
      description: "Travailler mieux, pas plus. On identifie les tâches répétitives qui font perdre du temps (relances clients, envoi de factures, mise à jour de tableaux, notifications…) et on les automatise via des plateformes comme Make, Zapier ou n8n. Des processus qui tournent seuls et des équipes libérées.",
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
      name: "Publicité TikTok",
      category: "Croissance - Ads",
      shortDescription: "Captez l'attention de la nouvelle génération",
      description: "Le levier le plus puissant du moment. On vous accompagne sur la création de contenus natifs 'User Generated Content' (UGC) et le pilotage de vos TikTok Ads. Profitez de coûts d'acquisition encore très bas pour développer vos ventes rapidement.",
      tags: ["TikTok", "UGC", "Viral"],
      icon: "Music",
      price: "Frais de gestion %"
    }
  ] as Service[],

  templates: [
    {
      id: "m1",
      slug: "obligations-tpe",
      name: "Les Obligations d'une TPE",
      category: "Juridique & Admin",
      description: "Un guide complet sur vos obligations fiscales, sociales, comptables et juridiques pour ne rien oublier.",
      shortDescription: "Fiscales, sociales, comptables et juridiques",
      link: "https://canva.link/obligationstpe",
      image: "/images/templates/obligations_tpe.png"
    },
    {
      id: "m2",
      slug: "previsionnel-financier",
      name: "Suivi et prévisionnel financier",
      category: "Finance",
      description: "L'outil indispensable pour piloter votre trésorerie, le nerf de la guerre de toute entreprise.",
      shortDescription: "Trésorerie le nerf de la guerre",
      link: "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
      image: "/images/templates/previsionnel_financier.png"
    },
    {
      id: "m3",
      slug: "systeme-operationnel",
      name: "Système opérationnel",
      category: "Opérations",
      description: "La structure dont vous avez besoin pour que votre activité soit solide et scalable.",
      shortDescription: "Sans système en place, tout est fragile",
      link: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
      image: "/images/templates/systeme_operationnel.png"
    }
  ] as Template[],

  systems: [
    { id: "s1", slug: "agence-immobiliere", name: "Agence immobilière", category: "Services & Conseil", description: "Optimisez vos mandats et la gestion de vos visites.", tags: ["Immo", "Système"], icon: "Home", price: "" },
    { id: "s2", slug: "agence-marketing", name: "Agence marketing", category: "Agences & Digital", description: "Automatisez votre prospection et le reporting client.", tags: ["Marketing", "Système"], icon: "Megaphone", price: "" },
    { id: "s3", slug: "agence-web", name: "Agence web", category: "Agences & Digital", description: "Structurez votre production technique et vos livrables.", tags: ["Web", "Système"], icon: "Code", price: "" },
    { id: "s4", slug: "artisanat", name: "Artisanat", category: "Artisans & BTP", description: "Suivez vos chantiers et factures sans perdre de temps.", tags: ["Artisan", "Système"], icon: "Hammer", price: "" },
    { id: "s5", slug: "btp", name: "BTP", category: "Artisans & BTP", description: "Gérez vos équipes et vos approvisionnements en temps réel.", tags: ["BTP", "Système"], icon: "Building2", price: "" },
    { id: "s6", slug: "boulangerie", name: "Boulangerie", category: "Commerce & Restauration", description: "Optimisez vos stocks et vos ventes en boutique.", tags: ["Boulangerie", "Système"], icon: "Croissant", price: "" },
    { id: "s7", slug: "coaching", name: "Coaching", category: "Formation & Coaching", description: "Automatisez vos prises de rendez-vous et vos suivis.", tags: ["Coaching", "Système"], icon: "UserCheck", price: "" },
    { id: "s8", slug: "commerce-de-detail", name: "Commerce de détail", category: "Commerce & Restauration", description: "Un système d'inventaire et de fidélisation clients.", tags: ["Retail", "Système"], icon: "Store", price: "" },
    { id: "s9", slug: "conciergerie-airbnb", name: "Conciergerie Airbnb", category: "Services & Conseil", description: "Automatisez les arrivées et le ménage de vos locations.", tags: ["Airbnb", "Système"], icon: "Key", price: "" },
    { id: "s10", slug: "consulting", name: "Consulting", category: "Services & Conseil", description: "Industrialisez votre expertise pour croître sans limite.", tags: ["Consulting", "Système"], icon: "Briefcase", price: "" },
    { id: "s11", slug: "creation-de-contenu", name: "Création de contenu", category: "Agences & Digital", description: "Un workflow de production fluide de l'idée à la publication.", tags: ["Contenu", "Système"], icon: "Camera", price: "" },
    { id: "s12", slug: "demenagement", name: "Déménagement", category: "Services & Conseil", description: "Optimisez vos devis et la planification de vos tournées.", tags: ["Déménagement", "Système"], icon: "Truck", price: "" },
    { id: "s13", slug: "evenementiel", name: "Événementiel", category: "Services & Conseil", description: "Un pilotage de projet rigoureux pour des événements sans stress.", tags: ["Événement", "Système"], icon: "PartyPopper", price: "" },
    { id: "s14", slug: "e-commerce", name: "E-commerce", category: "Commerce & Restauration", description: "Optimisez vos conversions et votre logistique d'expédition.", tags: ["Ecommerce", "Système"], icon: "ShoppingBag", price: "" },
    { id: "s15", slug: "formation-en-ligne", name: "Formation en ligne", category: "Formation & Coaching", description: "Scalez votre transmission de savoir avec un LMS automatisé.", tags: ["Formation", "Système"], icon: "GraduationCap", price: "" },
    { id: "s16", slug: "freelance", name: "Freelance", category: "Services & Conseil", description: "Ne courez plus après vos clients, structurez votre offre.", tags: ["Freelance", "Système"], icon: "Laptop", price: "" },
    { id: "s17", slug: "garage-automobile", name: "Garage automobile", category: "Services & Conseil", description: "Suivez vos réparations et optimisez votre planning atelier.", tags: ["Garage", "Système"], icon: "Wrench", price: "" },
    { id: "s18", slug: "gestion-comptable", name: "Gestion comptable", category: "Services & Conseil", description: "Fluidifiez vos échanges de documents avec vos clients.", tags: ["Compta", "Système"], icon: "Calculator", price: "" },
    { id: "s19", slug: "institut-de-beaute", name: "Institut de beauté", category: "Santé & Beauté", description: "Optimisez vos agendas et vos ventes de produits.", tags: ["Beauté", "Système"], icon: "Flower2", price: "" },
    { id: "s20", slug: "investissement-locatif", name: "Investissement locatif", category: "Services & Conseil", description: "Suivez votre rentabilité et vos travaux en un seul endroit.", tags: ["Immo", "Système"], icon: "Landmark", price: "" },
    { id: "s21", slug: "livraison-dernier-kilometre", name: "Livraison dernier kilomètre", category: "Logistique & Transport", description: "Un système de routage efficace pour vos livreurs.", tags: ["Livraison", "Système"], icon: "Navigation", price: "" },
    { id: "s22", slug: "location-de-materiel", name: "Location de matériel", category: "Services & Conseil", description: "Gérez vos stocks et vos contrats de location.", tags: ["Location", "Système"], icon: "Dolly", price: "" },
    { id: "s23", slug: "maintenance-informatique", name: "Maintenance informatique", category: "Agences & Digital", description: "Un système de ticketing et de maintenance préventive.", tags: ["IT", "Système"], icon: "Cpu", price: "" },
    { id: "s24", slug: "marketplace", name: "Marketplace", category: "Agences & Digital", description: "Structurez vos flux vendeurs et paiements complexes.", tags: ["Marketplace", "Système"], icon: "Layers", price: "" },
    { id: "s25", slug: "media", name: "Média", category: "Agences & Digital", description: "Gérez votre régie publicitaire et vos publications.", tags: ["Média", "Système"], icon: "Newspaper", price: "" },
    { id: "s26", slug: "nettoyage-professionnel", name: "Nettoyage professionnel", category: "Services & Conseil", description: "Contrôlez vos passages et optimisez vos tournées.", tags: ["Nettoyage", "Système"], icon: "Sparkles", price: "" },
    { id: "s27", slug: "organisme-de-formation", name: "Organisme de formation", category: "Formation & Coaching", description: "Simplifiez votre conformité Qualiopi et vos inscriptions.", tags: ["Formation", "Système"], icon: "FileCheck2", price: "" },
    { id: "s28", slug: "photographe-videaste", name: "Photographe / vidéaste", category: "Services & Conseil", description: "Workflows d'édition et galeries clients automatisées.", tags: ["Photo", "Système"], icon: "Aperture", price: "" },
    { id: "s29", slug: "reparation-telephonique", name: "Réparation téléphonique", category: "Services & Conseil", description: "Gérez vos pièces détachées et le suivi client.", tags: ["Réparation", "Système"], icon: "Smartphone", price: "" },
    { id: "s30", slug: "restaurant", name: "Restaurant", category: "Commerce & Restauration", description: "Optimisez vos ratios et simplifiez votre service.", tags: ["Restaurant", "Système"], icon: "Utensils", price: "" },
    { id: "s31", slug: "saas", name: "SaaS", category: "Agences & Digital", description: "Optimisez votre MRR et le support client.", tags: ["SaaS", "Système"], icon: "Cloud", price: "" },
    { id: "s32", slug: "salle-de-sport", name: "Salle de sport", category: "Santé & Beauté", description: "Gérez vos abonnements et vos plannings de cours.", tags: ["Sport", "Système"], icon: "Dumbbell", price: "" },
    { id: "s33", slug: "salon-de-coiffure", name: "Salon de coiffure", category: "Santé & Beauté", description: "Une gestion d'agenda sans failles et des ventes upsell.", tags: ["Coiffure", "Système"], icon: "Scissors", price: "" },
    { id: "s34", slug: "securite-privee", name: "Sécurité privée", category: "Services & Conseil", description: "Planification des agents et rapports d'intervention.", tags: ["Sécurité", "Système"], icon: "Shield", price: "" },
    { id: "s35", slug: "services-a-la-personne", name: "Services à la personne", category: "Services & Conseil", description: "Une coordination d'intervenants pour un service irréprochable.", tags: ["Services", "Système"], icon: "HeartHandshake", price: "" },
    { id: "s36", slug: "traiteur", name: "Traiteur", category: "Commerce & Restauration", description: "Optimisez vos fiches techniques et vos événements.", tags: ["Traiteur", "Système"], icon: "ChefHat", price: "" },
    { id: "s37", slug: "transport-de-marchandise", name: "Transport de marchandise", category: "Logistique & Transport", description: "Un suivi de flotte et de fret en temps réel.", tags: ["Logistique", "Système"], icon: "Box", price: "" },
    { id: "s38", slug: "transport-de-personnes", name: "Transport de personnes", category: "Logistique & Transport", description: "Optimisez vos trajets et votre gestion de chauffeurs.", tags: ["VTC", "Système"], icon: "Car", price: "" }
  ] as System[]
};

// Index de recherche optimisé
const searchIndexes = {
  tools: new Map<string, Tool>(),
  services: new Map<string, Service>(),
  templates: new Map<string, Template>(),
  systems: new Map<string, System>()
};

// Pré-calcul des index de recherche
Object.entries(database.tools).forEach(([key, item]) => {
  const searchText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
  searchIndexes.tools.set(searchText, item);
});

Object.entries(database.services).forEach(([key, item]) => {
  const searchText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
  searchIndexes.services.set(searchText, item);
});

Object.entries(database.templates).forEach(([key, item]) => {
  const searchText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
  searchIndexes.templates.set(searchText, item);
});

Object.entries(database.systems).forEach(([key, item]) => {
  const searchText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
  searchIndexes.systems.set(searchText, item);
});

export { searchIndexes };
