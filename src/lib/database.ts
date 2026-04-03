import { Tool, Service, Template } from './types';

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
      tags: ["QR", "Card"],
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
      tags: ["Avis", "QR"],
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
      tags: ["Google", "SEO"],
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
      tags: ["Email", "Pro"],
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
      tags: ["Vente", "QR"],
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
      tags: ["Signature", "PDF"],
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
      tags: ["Restaurant", "QR"],
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
      tags: ["QR", "Lien"],
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
  ] as Template[]
};

// Index de recherche optimisé
const searchIndexes = {
  tools: new Map<string, Tool>(),
  services: new Map<string, Service>(),
  templates: new Map<string, Template>()
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

export { searchIndexes };
