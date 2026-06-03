export type FreeToolSeo = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  useCases: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  related: Array<{
    label: string;
    href: string;
  }>;
};

export const freeToolSeo = {
  "generation-de-qr-code": {
    slug: "generation-de-qr-code",
    path: "/outils/generation-de-qr-code",
    title: "Générateur de QR code gratuit",
    metaTitle: "Générateur de QR code gratuit - Demaa",
    metaDescription:
      "Créez un QR code personnalisé pour un lien, une page, un menu ou un support imprimé. Gratuit, rapide et exportable.",
    intro:
      "Ce générateur permet de créer un QR code propre pour envoyer vers une URL, une page de réservation, un formulaire ou un support commercial. Il est pensé pour les TPE qui veulent produire un visuel utilisable sans outil compliqué.",
    useCases: [
      "Ajouter un QR code sur une affiche, un flyer ou une carte de visite.",
      "Envoyer vers une page de prise de rendez-vous ou un formulaire.",
      "Créer un QR code avec une couleur et un logo cohérents avec la marque.",
    ],
    faqs: [
      {
        question: "Le QR code expire-t-il ?",
        answer: "Non. Le QR code reste lisible tant que le lien de destination existe.",
      },
      {
        question: "Puis-je l'imprimer ?",
        answer: "Oui, vous pouvez exporter le visuel et l'utiliser sur un support imprimé.",
      },
      {
        question: "Puis-je ajouter mon logo ?",
        answer: "Oui, l'outil permet d'ajouter un logo au centre du QR code.",
      },
    ],
    related: [
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Menu QR code", href: "/outils/generation-de-menu-qr-code" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "carte-de-visite-qr-code-whatsapp": {
    slug: "carte-de-visite-qr-code-whatsapp",
    path: "/outils/carte-de-visite-qr-code-whatsapp",
    title: "Carte de visite QR code WhatsApp",
    metaTitle: "Carte de visite QR code WhatsApp - Demaa",
    metaDescription:
      "Générez un QR code WhatsApp pour carte de visite et facilitez le premier contact avec vos clients.",
    intro:
      "Cet outil crée un QR code qui ouvre une conversation WhatsApp avec un message préparé. Il est utile pour les commerciaux, artisans, indépendants et commerces locaux qui veulent rendre le contact plus direct.",
    useCases: [
      "Mettre un QR code WhatsApp sur une carte de visite.",
      "Faciliter les demandes de devis après un rendez-vous.",
      "Partager un contact rapide sur un comptoir, une vitrine ou un flyer.",
    ],
    faqs: [
      {
        question: "Le client doit-il enregistrer mon numéro ?",
        answer: "Non, le scan ouvre directement une conversation WhatsApp avec le numéro indiqué.",
      },
      {
        question: "Puis-je préparer un message par défaut ?",
        answer: "Oui, vous pouvez définir le texte qui s'affiche avant l'envoi.",
      },
      {
        question: "Est-ce adapté à l'impression ?",
        answer: "Oui, le QR code peut être utilisé sur une carte de visite ou un support imprimé.",
      },
    ],
    related: [
      { label: "Générateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "qr-code-pour-avis-client": {
    slug: "qr-code-pour-avis-client",
    path: "/outils/qr-code-pour-avis-client",
    title: "QR code pour avis client",
    metaTitle: "QR code pour avis client - Demaa",
    metaDescription:
      "Créez un QR code pour demander des avis clients et envoyer vos visiteurs vers votre page d'avis.",
    intro:
      "Ce générateur aide à demander un avis au bon moment, avec un support simple à scanner. Il convient aux restaurants, artisans, instituts, boutiques et entreprises locales qui veulent renforcer leur preuve sociale.",
    useCases: [
      "Afficher un QR code avis client en caisse ou en salle.",
      "Ajouter une demande d'avis sur une facture ou une carte de remerciement.",
      "Diriger les clients satisfaits vers une page d'avis précise.",
    ],
    faqs: [
      {
        question: "Puis-je utiliser un lien Google Avis ?",
        answer: "Oui, collez simplement le lien de votre page d'avis dans l'outil.",
      },
      {
        question: "Est-ce réservé aux avis Google ?",
        answer: "Non, vous pouvez utiliser tout lien public vers une page d'avis.",
      },
      {
        question: "Où placer ce QR code ?",
        answer: "Les meilleurs endroits sont la caisse, le ticket, la table, le comptoir ou un email post-prestation.",
      },
    ],
    related: [
      { label: "Création de fiche Google optimisée", href: "/outils/creation-de-fiche-google-optimisee" },
      { label: "Générateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "Menu QR code", href: "/outils/generation-de-menu-qr-code" },
    ],
  },
  "qr-code-commande-rapide": {
    slug: "qr-code-commande-rapide",
    path: "/outils/qr-code-commande-rapide",
    title: "QR code commande rapide",
    metaTitle: "QR code commande rapide - Demaa",
    metaDescription:
      "Créez un QR code de commande rapide pour envoyer vos clients vers une page de commande, paiement ou réservation.",
    intro:
      "Cet outil sert à transformer un support physique en point d'entrée vers une commande. Il est pratique pour les restaurants, commerces, snacks, prestations locales et offres simples à acheter ou réserver.",
    useCases: [
      "Envoyer vers une page de commande depuis une table ou un comptoir.",
      "Ajouter un accès rapide à une offre sur un flyer.",
      "Faciliter un paiement ou une réservation depuis un support imprimé.",
    ],
    faqs: [
      {
        question: "Quel lien utiliser ?",
        answer: "Utilisez le lien de votre page de commande, paiement, réservation ou formulaire.",
      },
      {
        question: "Puis-je changer la destination après impression ?",
        answer: "Seulement si le lien imprimé redirige vers une page que vous contrôlez.",
      },
      {
        question: "Est-ce utile sans site web ?",
        answer: "Oui, vous pouvez pointer vers un formulaire, une page de paiement ou un lien de messagerie.",
      },
    ],
    related: [
      { label: "Menu QR code", href: "/outils/generation-de-menu-qr-code" },
      { label: "Générateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
    ],
  },
  "generation-de-menu-qr-code": {
    slug: "generation-de-menu-qr-code",
    path: "/outils/generation-de-menu-qr-code",
    title: "Générateur de menu QR code",
    metaTitle: "Générateur de menu QR code - Demaa",
    metaDescription:
      "Créez un QR code pour menu digital et facilitez l'accès à votre carte depuis une table, une vitrine ou un flyer.",
    intro:
      "Ce générateur est conçu pour les restaurants, snacks, traiteurs et bars qui veulent afficher leur menu sans multiplier les impressions. Le QR code peut pointer vers une carte en ligne, un PDF ou une page de commande.",
    useCases: [
      "Placer un QR code menu sur les tables.",
      "Afficher la carte depuis une vitrine ou un comptoir.",
      "Envoyer vers un PDF, une page Notion, un site ou une commande en ligne.",
    ],
    faqs: [
      {
        question: "Dois-je avoir un site web ?",
        answer: "Non, un PDF en ligne ou une page partageable peut suffire.",
      },
      {
        question: "Puis-je changer le menu après impression ?",
        answer: "Oui si le lien pointe vers une page ou un PDF que vous pouvez mettre à jour.",
      },
      {
        question: "Est-ce adapté aux restaurants ?",
        answer: "Oui, c'est l'un des usages les plus fréquents pour ce type de QR code.",
      },
    ],
    related: [
      { label: "QR code commande rapide", href: "/outils/qr-code-commande-rapide" },
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Générateur de QR code", href: "/outils/generation-de-qr-code" },
    ],
  },
  "creation-de-fiche-google-optimisee": {
    slug: "creation-de-fiche-google-optimisee",
    path: "/outils/creation-de-fiche-google-optimisee",
    title: "Création de fiche Google optimisée",
    metaTitle: "Création de fiche Google optimisée - Demaa",
    metaDescription:
      "Préparez une fiche Google Business Profile plus claire avec description, catégories, services et éléments SEO local.",
    intro:
      "Cet outil aide à structurer les informations importantes d'une fiche Google Business Profile. Il ne remplace pas la validation Google, mais il aide à préparer une fiche plus claire pour la recherche locale.",
    useCases: [
      "Rédiger une description locale plus précise.",
      "Lister les services importants à afficher.",
      "Vérifier les éléments essentiels avant publication ou mise à jour.",
    ],
    faqs: [
      {
        question: "L'outil publie-t-il la fiche Google ?",
        answer: "Non, il aide à préparer les contenus. La publication se fait dans Google Business Profile.",
      },
      {
        question: "Pourquoi la ville est importante ?",
        answer: "Elle aide à clarifier la zone servie et la pertinence locale de votre activité.",
      },
      {
        question: "Puis-je l'utiliser pour une fiche existante ?",
        answer: "Oui, il est utile pour améliorer une fiche déjà publiée.",
      },
    ],
    related: [
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Générateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "generation-de-tampon": {
    slug: "generation-de-tampon",
    path: "/outils/generation-de-tampon",
    title: "Générateur de tampon entreprise",
    metaTitle: "Générateur de tampon entreprise - Demaa",
    metaDescription:
      "Créez un visuel de tampon d'entreprise pour vos documents, devis, factures ou supports administratifs.",
    intro:
      "Ce générateur permet de créer rapidement un tampon visuel avec les informations principales de l'entreprise. Il sert surtout à produire un rendu propre pour documents internes, devis, factures et supports administratifs.",
    useCases: [
      "Créer un tampon visuel pour documents commerciaux.",
      "Uniformiser les supports administratifs d'une TPE.",
      "Préparer un visuel simple avant impression ou export.",
    ],
    faqs: [
      {
        question: "Ce tampon a-t-il une valeur légale ?",
        answer: "Non, c'est un visuel. La valeur dépend du document et du contexte d'utilisation.",
      },
      {
        question: "Quelles informations ajouter ?",
        answer: "Nom, activité, SIRET, ville et contact suffisent dans la plupart des cas.",
      },
      {
        question: "Puis-je l'utiliser sur une facture ?",
        answer: "Oui comme élément visuel, si vos mentions obligatoires figurent bien sur la facture.",
      },
    ],
    related: [
      { label: "Signature email pro", href: "/outils/signature-pro" },
      { label: "Kit du dirigeant organisé", href: "/outils/kit-du-dirigeant-organise" },
      { label: "Signer un document électroniquement", href: "/outils/signez-un-document-electroniquement" },
    ],
  },
  "signature-pro": {
    slug: "signature-pro",
    path: "/outils/signature-pro",
    title: "Générateur de signature email pro",
    metaTitle: "Générateur de signature email pro - Demaa",
    metaDescription:
      "Créez une signature email professionnelle pour votre entreprise avec nom, poste, logo, téléphone et liens.",
    intro:
      "Cet outil permet de créer une signature email claire et réutilisable. Il aide les TPE à présenter leurs coordonnées de manière cohérente dans les emails commerciaux, devis, relances et échanges clients.",
    useCases: [
      "Uniformiser les signatures email de l'équipe.",
      "Ajouter téléphone, site, adresse et réseaux utiles.",
      "Donner une image plus professionnelle aux emails sortants.",
    ],
    faqs: [
      {
        question: "Puis-je copier la signature dans Gmail ?",
        answer: "Oui, copiez le rendu ou le HTML selon le mode proposé, puis collez-le dans les paramètres de signature.",
      },
      {
        question: "Faut-il mettre un logo ?",
        answer: "Ce n'est pas obligatoire, mais cela aide à renforcer l'identité visuelle.",
      },
      {
        question: "Quelle longueur garder ?",
        answer: "Une signature efficace reste courte : nom, rôle, entreprise, téléphone, site et un lien utile.",
      },
    ],
    related: [
      { label: "Carte QR code WhatsApp", href: "/outils/carte-de-visite-qr-code-whatsapp" },
      { label: "Création de fiche Google optimisée", href: "/outils/creation-de-fiche-google-optimisee" },
      { label: "Générateur de tampon", href: "/outils/generation-de-tampon" },
    ],
  },
  "signez-un-document-electroniquement": {
    slug: "signez-un-document-electroniquement",
    path: "/outils/signez-un-document-electroniquement",
    title: "Signer un document électroniquement",
    metaTitle: "Signer un document électroniquement - Demaa",
    metaDescription:
      "Ajoutez une signature électronique simple sur un document et préparez un fichier signé sans outil complexe.",
    intro:
      "Cet outil aide à signer rapidement un document courant sans passer par un logiciel lourd. Il convient aux besoins simples : validation, accord, bon pour accord, document interne ou pièce à retourner signée.",
    useCases: [
      "Signer un document reçu par email.",
      "Ajouter une signature simple sur un PDF ou document courant.",
      "Retourner rapidement un accord ou une validation.",
    ],
    faqs: [
      {
        question: "Est-ce une signature électronique qualifiée ?",
        answer: "Non, c'est une signature simple. Pour des actes sensibles, utilisez une solution certifiée adaptée.",
      },
      {
        question: "Quels documents signer avec cet outil ?",
        answer: "Il est adapté aux documents courants, validations simples et usages internes.",
      },
      {
        question: "Dois-je créer un compte ?",
        answer: "Non, l'objectif est de signer rapidement sans parcours complexe.",
      },
    ],
    related: [
      { label: "Générateur de tampon", href: "/outils/generation-de-tampon" },
      { label: "Kit du dirigeant organisé", href: "/outils/kit-du-dirigeant-organise" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "kit-du-dirigeant-organise": {
    slug: "kit-du-dirigeant-organise",
    path: "/outils/kit-du-dirigeant-organise",
    title: "Kit du dirigeant organisé",
    metaTitle: "Kit du dirigeant organisé - Demaa",
    metaDescription:
      "Retrouvez des modèles de documents utiles pour organiser une TPE : obligations, prévisionnel, systèmes et suivi.",
    intro:
      "Ce kit rassemble des ressources pratiques pour mieux cadrer l'activité d'une petite entreprise. L'objectif est simple : partir de documents clairs plutôt que repartir de zéro à chaque besoin administratif ou organisationnel.",
    useCases: [
      "Structurer les documents essentiels d'une TPE.",
      "Préparer un suivi financier ou opérationnel plus clair.",
      "Gagner du temps sur les supports récurrents du dirigeant.",
    ],
    faqs: [
      {
        question: "À qui s'adresse ce kit ?",
        answer: "Aux indépendants, dirigeants de TPE et petites équipes qui veulent mieux organiser leurs documents.",
      },
      {
        question: "Les modèles remplacent-ils un conseil juridique ?",
        answer: "Non, ils servent de base de travail. Les situations sensibles doivent être validées par un professionnel.",
      },
      {
        question: "Le kit sera-t-il enrichi ?",
        answer: "Oui, de nouvelles ressources peuvent être ajoutées selon les besoins les plus fréquents.",
      },
    ],
    related: [
      { label: "Signer un document électroniquement", href: "/outils/signez-un-document-electroniquement" },
      { label: "Générateur de tampon", href: "/outils/generation-de-tampon" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
} satisfies Record<string, FreeToolSeo>;
