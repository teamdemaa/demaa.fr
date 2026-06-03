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
    title: "Generateur de QR code gratuit",
    metaTitle: "Generateur de QR code gratuit - Demaa",
    metaDescription:
      "Creez un QR code personnalise pour un lien, une page, un menu ou un support imprime. Gratuit, rapide et exportable.",
    intro:
      "Ce generateur permet de creer un QR code propre pour envoyer vers une URL, une page de reservation, un formulaire ou un support commercial. Il est pense pour les TPE qui veulent produire un visuel utilisable sans outil complique.",
    useCases: [
      "Ajouter un QR code sur une affiche, un flyer ou une carte de visite.",
      "Envoyer vers une page de prise de rendez-vous ou un formulaire.",
      "Creer un QR code avec une couleur et un logo coherents avec la marque.",
    ],
    faqs: [
      {
        question: "Le QR code expire-t-il ?",
        answer: "Non. Le QR code reste lisible tant que le lien de destination existe.",
      },
      {
        question: "Puis-je l'imprimer ?",
        answer: "Oui, vous pouvez exporter le visuel et l'utiliser sur un support imprime.",
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
      "Generez un QR code WhatsApp pour carte de visite et facilitez le premier contact avec vos clients.",
    intro:
      "Cet outil cree un QR code qui ouvre une conversation WhatsApp avec un message prepare. Il est utile pour les commerciaux, artisans, independants et commerces locaux qui veulent rendre le contact plus direct.",
    useCases: [
      "Mettre un QR code WhatsApp sur une carte de visite.",
      "Faciliter les demandes de devis apres un rendez-vous.",
      "Partager un contact rapide sur un comptoir, une vitrine ou un flyer.",
    ],
    faqs: [
      {
        question: "Le client doit-il enregistrer mon numero ?",
        answer: "Non, le scan ouvre directement une conversation WhatsApp avec le numero indique.",
      },
      {
        question: "Puis-je preparer un message par defaut ?",
        answer: "Oui, vous pouvez definir le texte qui s'affiche avant l'envoi.",
      },
      {
        question: "Est-ce adapte a l'impression ?",
        answer: "Oui, le QR code peut etre utilise sur une carte de visite ou un support imprime.",
      },
    ],
    related: [
      { label: "Generateur de QR code", href: "/outils/generation-de-qr-code" },
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
      "Creez un QR code pour demander des avis clients et envoyer vos visiteurs vers votre page d'avis.",
    intro:
      "Ce generateur aide a demander un avis au bon moment, avec un support simple a scanner. Il convient aux restaurants, artisans, instituts, boutiques et entreprises locales qui veulent renforcer leur preuve sociale.",
    useCases: [
      "Afficher un QR code avis client en caisse ou en salle.",
      "Ajouter une demande d'avis sur une facture ou une carte de remerciement.",
      "Diriger les clients satisfaits vers une page d'avis precise.",
    ],
    faqs: [
      {
        question: "Puis-je utiliser un lien Google Avis ?",
        answer: "Oui, collez simplement le lien de votre page d'avis dans l'outil.",
      },
      {
        question: "Est-ce reserve aux avis Google ?",
        answer: "Non, vous pouvez utiliser tout lien public vers une page d'avis.",
      },
      {
        question: "Ou placer ce QR code ?",
        answer: "Les meilleurs endroits sont la caisse, le ticket, la table, le comptoir ou un email post-prestation.",
      },
    ],
    related: [
      { label: "Creation de fiche Google optimisee", href: "/outils/creation-de-fiche-google-optimisee" },
      { label: "Generateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "Menu QR code", href: "/outils/generation-de-menu-qr-code" },
    ],
  },
  "qr-code-commande-rapide": {
    slug: "qr-code-commande-rapide",
    path: "/outils/qr-code-commande-rapide",
    title: "QR code commande rapide",
    metaTitle: "QR code commande rapide - Demaa",
    metaDescription:
      "Creez un QR code de commande rapide pour envoyer vos clients vers une page de commande, paiement ou reservation.",
    intro:
      "Cet outil sert a transformer un support physique en point d'entree vers une commande. Il est pratique pour les restaurants, commerces, snacks, prestations locales et offres simples a acheter ou reserver.",
    useCases: [
      "Envoyer vers une page de commande depuis une table ou un comptoir.",
      "Ajouter un acces rapide a une offre sur un flyer.",
      "Faciliter un paiement ou une reservation depuis un support imprime.",
    ],
    faqs: [
      {
        question: "Quel lien utiliser ?",
        answer: "Utilisez le lien de votre page de commande, paiement, reservation ou formulaire.",
      },
      {
        question: "Puis-je changer la destination apres impression ?",
        answer: "Seulement si le lien imprime redirige vers une page que vous controlez.",
      },
      {
        question: "Est-ce utile sans site web ?",
        answer: "Oui, vous pouvez pointer vers un formulaire, une page de paiement ou un lien de messagerie.",
      },
    ],
    related: [
      { label: "Menu QR code", href: "/outils/generation-de-menu-qr-code" },
      { label: "Generateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
    ],
  },
  "generation-de-menu-qr-code": {
    slug: "generation-de-menu-qr-code",
    path: "/outils/generation-de-menu-qr-code",
    title: "Generateur de menu QR code",
    metaTitle: "Generateur de menu QR code - Demaa",
    metaDescription:
      "Creez un QR code pour menu digital et facilitez l'acces a votre carte depuis une table, une vitrine ou un flyer.",
    intro:
      "Ce generateur est concu pour les restaurants, snacks, traiteurs et bars qui veulent afficher leur menu sans multiplier les impressions. Le QR code peut pointer vers une carte en ligne, un PDF ou une page de commande.",
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
        question: "Puis-je changer le menu apres impression ?",
        answer: "Oui si le lien pointe vers une page ou un PDF que vous pouvez mettre a jour.",
      },
      {
        question: "Est-ce adapte aux restaurants ?",
        answer: "Oui, c'est l'un des usages les plus frequents pour ce type de QR code.",
      },
    ],
    related: [
      { label: "QR code commande rapide", href: "/outils/qr-code-commande-rapide" },
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Generateur de QR code", href: "/outils/generation-de-qr-code" },
    ],
  },
  "creation-de-fiche-google-optimisee": {
    slug: "creation-de-fiche-google-optimisee",
    path: "/outils/creation-de-fiche-google-optimisee",
    title: "Creation de fiche Google optimisee",
    metaTitle: "Creation de fiche Google optimisee - Demaa",
    metaDescription:
      "Preparez une fiche Google Business Profile plus claire avec description, categories, services et elements SEO local.",
    intro:
      "Cet outil aide a structurer les informations importantes d'une fiche Google Business Profile. Il ne remplace pas la validation Google, mais il aide a preparer une fiche plus claire pour la recherche locale.",
    useCases: [
      "Rediger une description locale plus precise.",
      "Lister les services importants a afficher.",
      "Verifier les elements essentiels avant publication ou mise a jour.",
    ],
    faqs: [
      {
        question: "L'outil publie-t-il la fiche Google ?",
        answer: "Non, il aide a preparer les contenus. La publication se fait dans Google Business Profile.",
      },
      {
        question: "Pourquoi la ville est importante ?",
        answer: "Elle aide a clarifier la zone servie et la pertinence locale de votre activite.",
      },
      {
        question: "Puis-je l'utiliser pour une fiche existante ?",
        answer: "Oui, il est utile pour ameliorer une fiche deja publiee.",
      },
    ],
    related: [
      { label: "QR code pour avis client", href: "/outils/qr-code-pour-avis-client" },
      { label: "Generateur de QR code", href: "/outils/generation-de-qr-code" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "generation-de-tampon": {
    slug: "generation-de-tampon",
    path: "/outils/generation-de-tampon",
    title: "Generateur de tampon entreprise",
    metaTitle: "Generateur de tampon entreprise - Demaa",
    metaDescription:
      "Creez un visuel de tampon d'entreprise pour vos documents, devis, factures ou supports administratifs.",
    intro:
      "Ce generateur permet de creer rapidement un tampon visuel avec les informations principales de l'entreprise. Il sert surtout a produire un rendu propre pour documents internes, devis, factures et supports administratifs.",
    useCases: [
      "Creer un tampon visuel pour documents commerciaux.",
      "Uniformiser les supports administratifs d'une TPE.",
      "Preparer un visuel simple avant impression ou export.",
    ],
    faqs: [
      {
        question: "Ce tampon a-t-il une valeur legale ?",
        answer: "Non, c'est un visuel. La valeur depend du document et du contexte d'utilisation.",
      },
      {
        question: "Quelles informations ajouter ?",
        answer: "Nom, activite, SIRET, ville et contact suffisent dans la plupart des cas.",
      },
      {
        question: "Puis-je l'utiliser sur une facture ?",
        answer: "Oui comme element visuel, si vos mentions obligatoires figurent bien sur la facture.",
      },
    ],
    related: [
      { label: "Signature email pro", href: "/outils/signature-pro" },
      { label: "Kit du dirigeant organise", href: "/outils/kit-du-dirigeant-organise" },
      { label: "Signer un document electroniquement", href: "/outils/signez-un-document-electroniquement" },
    ],
  },
  "signature-pro": {
    slug: "signature-pro",
    path: "/outils/signature-pro",
    title: "Generateur de signature email pro",
    metaTitle: "Generateur de signature email pro - Demaa",
    metaDescription:
      "Creez une signature email professionnelle pour votre entreprise avec nom, poste, logo, telephone et liens.",
    intro:
      "Cet outil permet de creer une signature email claire et reutilisable. Il aide les TPE a presenter leurs coordonnees de maniere coherente dans les emails commerciaux, devis, relances et echanges clients.",
    useCases: [
      "Uniformiser les signatures email de l'equipe.",
      "Ajouter telephone, site, adresse et reseaux utiles.",
      "Donner une image plus professionnelle aux emails sortants.",
    ],
    faqs: [
      {
        question: "Puis-je copier la signature dans Gmail ?",
        answer: "Oui, copiez le rendu ou le HTML selon le mode propose, puis collez-le dans les parametres de signature.",
      },
      {
        question: "Faut-il mettre un logo ?",
        answer: "Ce n'est pas obligatoire, mais cela aide a renforcer l'identite visuelle.",
      },
      {
        question: "Quelle longueur garder ?",
        answer: "Une signature efficace reste courte: nom, role, entreprise, telephone, site et un lien utile.",
      },
    ],
    related: [
      { label: "Carte QR code WhatsApp", href: "/outils/carte-de-visite-qr-code-whatsapp" },
      { label: "Creation de fiche Google optimisee", href: "/outils/creation-de-fiche-google-optimisee" },
      { label: "Generateur de tampon", href: "/outils/generation-de-tampon" },
    ],
  },
  "signez-un-document-electroniquement": {
    slug: "signez-un-document-electroniquement",
    path: "/outils/signez-un-document-electroniquement",
    title: "Signer un document electroniquement",
    metaTitle: "Signer un document electroniquement - Demaa",
    metaDescription:
      "Ajoutez une signature electronique simple sur un document et preparez un fichier signe sans outil complexe.",
    intro:
      "Cet outil aide a signer rapidement un document courant sans passer par un logiciel lourd. Il convient aux besoins simples: validation, accord, bon pour accord, document interne ou piece a retourner signee.",
    useCases: [
      "Signer un document recu par email.",
      "Ajouter une signature simple sur un PDF ou document courant.",
      "Retourner rapidement un accord ou une validation.",
    ],
    faqs: [
      {
        question: "Est-ce une signature electronique qualifiee ?",
        answer: "Non, c'est une signature simple. Pour des actes sensibles, utilisez une solution certifiee adaptee.",
      },
      {
        question: "Quels documents signer avec cet outil ?",
        answer: "Il est adapte aux documents courants, validations simples et usages internes.",
      },
      {
        question: "Dois-je creer un compte ?",
        answer: "Non, l'objectif est de signer rapidement sans parcours complexe.",
      },
    ],
    related: [
      { label: "Generateur de tampon", href: "/outils/generation-de-tampon" },
      { label: "Kit du dirigeant organise", href: "/outils/kit-du-dirigeant-organise" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
  "kit-du-dirigeant-organise": {
    slug: "kit-du-dirigeant-organise",
    path: "/outils/kit-du-dirigeant-organise",
    title: "Kit du dirigeant organise",
    metaTitle: "Kit du dirigeant organise - Demaa",
    metaDescription:
      "Retrouvez des modeles de documents utiles pour organiser une TPE: obligations, previsionnel, systemes et suivi.",
    intro:
      "Ce kit rassemble des ressources pratiques pour mieux cadrer l'activite d'une petite entreprise. L'objectif est simple: partir de documents clairs plutot que repartir de zero a chaque besoin administratif ou organisationnel.",
    useCases: [
      "Structurer les documents essentiels d'une TPE.",
      "Preparer un suivi financier ou operationnel plus clair.",
      "Gagner du temps sur les supports recurrents du dirigeant.",
    ],
    faqs: [
      {
        question: "A qui s'adresse ce kit ?",
        answer: "Aux independants, dirigeants de TPE et petites equipes qui veulent mieux organiser leurs documents.",
      },
      {
        question: "Les modeles remplacent-ils un conseil juridique ?",
        answer: "Non, ils servent de base de travail. Les situations sensibles doivent etre validees par un professionnel.",
      },
      {
        question: "Le kit sera-t-il enrichi ?",
        answer: "Oui, de nouvelles ressources peuvent etre ajoutees selon les besoins les plus frequents.",
      },
    ],
    related: [
      { label: "Signer un document electroniquement", href: "/outils/signez-un-document-electroniquement" },
      { label: "Generateur de tampon", href: "/outils/generation-de-tampon" },
      { label: "Signature email pro", href: "/outils/signature-pro" },
    ],
  },
} satisfies Record<string, FreeToolSeo>;
