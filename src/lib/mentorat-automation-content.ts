import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/accompagnement";

export const mentoratAutomationContent = {
  hero: {
    lead: "De la demande client à la facture,",
    emphasis: "sans ressaisir les mêmes informations.",
    description:
      "Nous mettons en place les automatisations & l’IA qui relient vos demandes, vos devis, votre planning, vos interventions ou chantiers, vos comptes rendus et votre facturation.",
    ctaLabel: "Faire mon diagnostic Automatisation & IA",
  },
  sectors: {
    title: "Pour les entreprises de services qui travaillent sur le terrain.",
    items: [
      "Maintenance",
      "Installation",
      "Dépannage",
      "BTP",
      "Entretien",
      "Propreté",
    ],
  },
  implementation: {
    title: "Vous ne configurez rien. Nous le mettons en place pour vous.",
    description:
      "Nous regardons comment votre entreprise fonctionne, choisissons avec vous ce qu’il faut automatiser en premier, puis nous construisons et testons la solution avec vos outils.",
    steps: [
      { title: "Nous observons", description: "Vos demandes, vos outils et les pertes de temps." },
      { title: "Nous choisissons", description: "Ce qui sera le plus utile à automatiser en premier." },
      { title: "Nous construisons", description: "L’automatisation et les connexions avec vos outils." },
      { title: "Nous testons", description: "Sur des situations réelles avec votre équipe." },
    ],
  },
  journey: [
    {
      title: "La demande devient une intervention ou un chantier",
      description:
        "Les informations sont regroupées, attribuées et prêtes à être utilisées pour le devis ou le planning.",
    },
    {
      title: "Le terrain alimente le suivi",
      description:
        "Les notes et les photos prises pendant le travail sont regroupées au même endroit.",
    },
    {
      title: "La fin du travail déclenche la suite",
      description:
        "Le compte rendu est préparé, le client est informé et les éléments de facturation sont transmis.",
    },
  ],
  human: {
    title: "L’humain reste indispensable. L’automatisation et l’IA prennent en charge le répétitif.",
    description:
      "Vos équipes gardent la relation client, leur savoir-faire et les décisions importantes. L’automatisation et l’IA préparent, classent et transmettent les informations qui leur prennent du temps.",
    items: [
      { title: "Informations regroupées", description: "Demandes, notes, photos et documents", status: "Automatique" },
      { title: "Document préparé", description: "Devis, compte rendu ou message client", status: "Automatique" },
      { title: "Décision importante", description: "Contrôle et validation par votre équipe", status: "Humain" },
    ],
  },
  impacts: [
    { title: "Sur le terrain", description: "Moins de documents à remplir et moins d’informations à transmettre plusieurs fois." },
    { title: "Au bureau", description: "Des informations complètes, faciles à retrouver et prêtes à utiliser." },
    { title: "Pour le dirigeant", description: "Moins de choses à vérifier, à relancer ou à garder en tête." },
    { title: "Pour les clients", description: "Des réponses plus rapides et un meilleur suivi du travail." },
  ],
  advantage: {
    title: "Prenez de l’avance maintenant.",
    description:
      "L’avantage ne vient pas du nombre d’outils utilisés. Il vient d’un fonctionnement plus rapide, dans lequel les informations circulent mieux et les équipes consacrent plus de temps aux clients et au terrain.",
  },
  fieldExamples: {
    title: "La même logique, adaptée à votre métier.",
    items: [
      {
        sector: "Entreprise de nettoyage",
        description:
          "Une demande, une photo ou une anomalie signalée sur le terrain arrive au bureau avec le bon client et le bon site.",
      },
      {
        sector: "Sécurité incendie",
        description:
          "Les informations du technicien préparent le compte rendu et les prochaines actions à suivre.",
      },
      {
        sector: "Maintenance d’ascenseurs",
        description:
          "La fin de l’intervention transmet les éléments utiles au client, au suivi et à la facturation.",
      },
    ],
  },
  proof: {
    value: "Je peux m’absenter sans que l’activité s’arrête.",
    quote:
      "Les responsabilités sont claires, les méthodes sont documentées et l’équipe sait quoi faire. L’entreprise ne repose plus uniquement sur moi : c’est devenu un véritable actif qu’un acheteur peut comprendre, reprendre et valoriser.",
    attribution: "Dirigeant",
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
    title: "Six mois pour structurer et automatiser durablement votre entreprise.",
    scope:
      "Nous examinons l’ensemble de votre fonctionnement, puis nous choisissons avec vous ce qu’il faut mettre en place en premier. Nous réalisons cette automatisation en entier.",
  },
  offerIncludes: [
    "Analyse de votre fonctionnement",
    "Liste des automatisations possibles",
    "Choix de ce qui sera réalisé",
    "Construction et connexion avec vos outils",
    "Tests et ajustements",
    "Documentation et prise en main",
  ],
  applicationBridge: {
    title: "Vous souhaitez une application métier sur mesure ?",
    description:
      "Lorsque vos outils actuels ne peuvent pas suivre votre façon de travailler, Demaa conçoit une application adaptée à votre métier, à vos équipes et à vos clients.",
    ctaLabel: "Découvrir le sur mesure",
    href: "/sur-mesure",
  },
  faq: [
    {
      question: "Est-ce adapté à notre entreprise ?",
      answer:
        "Oui si vous gérez régulièrement des demandes, des devis, des interventions ou chantiers, des comptes rendus et de la facturation.",
    },
    {
      question: "Faut-il changer nos outils ?",
      answer:
        "Pas nécessairement. Nous conservons ce qui fonctionne et proposons un changement uniquement si un outil bloque réellement le travail.",
    },
    {
      question: "Utilisez-vous toujours de l’IA ?",
      answer:
        "Non. Nous l’utilisons seulement lorsqu’elle apporte un gain concret, par exemple pour classer une demande, résumer des notes ou préparer un compte rendu. Une automatisation simple suffit souvent pour le reste.",
    },
    {
      question: "Que peut-on structurer en six mois ?",
      answer:
        "Nous priorisons les fonctionnements qui créent le plus de dépendance ou de perte de temps, puis les structurons progressivement avec votre équipe pendant les six mois.",
    },
    {
      question: "Combien de temps cela demande-t-il à notre équipe ?",
      answer:
        "Nous prenons en charge la conception et la mise en place. Votre équipe nous montre la réalité du terrain, valide les choix et teste le fonctionnement.",
    },
  ],
  finalCta: {
    title: "Qu’est-ce qui vous fait perdre du temps aujourd’hui ?",
    description:
      "Demandes dispersées, devis, planning, comptes rendus ou facturation : regardons ce que Demaa peut automatiser et mettre en place pour votre entreprise.",
  },
} as const;
