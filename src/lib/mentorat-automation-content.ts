import { AUTOMATION_OFFER } from "@/lib/automation-offer";

export const AUTOMATION_ACCOMPANIMENT_PATH = "/automatisation";

export const mentoratAutomationContent = {
  hero: {
    title: "Faites gagner du temps à votre équipe grâce à l’automatisation.",
    description: `Pendant ${AUTOMATION_OFFER.durationLabel}, nous partons de votre travail réel pour simplifier les ressaisies, les relances et les mises à jour inutiles, puis transmettre la méthode à la personne qui la fera vivre dans votre équipe.`,
  },
  offer: {
    duration: AUTOMATION_OFFER.durationLabel,
    price: AUTOMATION_OFFER.price.label,
  },
  outcomes: [
    {
      title: "Moins de ressaisies et de relances",
      description:
        "Les tâches répétitives sont simplifiées pour éviter les copier-coller, les rappels manuels et les mises à jour en double.",
    },
    {
      title: "Une information qui circule",
      description:
        "Les bons outils communiquent entre eux : le dossier se crée, la bonne personne est prévenue et le suivi reste à jour.",
    },
    {
      title: "Une équipe qui garde la main",
      description:
        "Votre équipe comprend ce qui a été mis en place et sait contrôler, maintenir et faire évoluer les automatisations.",
    },
  ],
  included: [
    "Un diagnostic des tâches chronophages",
    "La définition des priorités selon votre fonctionnement et leur complexité",
    "Le passage du cadrage à la mise en service dans votre environnement de travail",
    "Des tests et ajustements avec l’équipe",
    "La documentation des solutions retenues",
    "Le transfert de compétences pour continuer sans nous",
  ],
  notIncluded: [
    "Les abonnements et consommations des outils utilisés",
    "Un développement logiciel ou une intégration complexe hors périmètre",
    "La réalisation illimitée d’automatisations à la place de l’équipe",
    "Une promesse uniforme de temps gagné sans mesure préalable",
  ],
  faq: [
    {
      question: "Qui doit suivre l’accompagnement ?",
      answer:
        "Le dirigeant peut le suivre lui-même ou désigner un référent interne proche des opérations. Un binôme de la même entreprise peut participer pour sécuriser le transfert.",
    },
    {
      question: "Faut-il déjà connaître les outils no-code ?",
      answer:
        "Non. Le niveau de départ est évalué lors du diagnostic et les outils sont choisis en fonction du besoin, pas l’inverse.",
    },
    {
      question: `Pourquoi répartir le programme sur ${AUTOMATION_OFFER.durationLabel} ?`,
      answer:
        "Le temps entre les séances permet de tester les solutions dans le travail réel, de les ajuster et de consolider progressivement l’autonomie.",
    },
    {
      question: "Une prise en charge est-elle possible ?",
      answer:
        "Elle peut être étudiée selon le statut du participant, l’OPCO ou le fonds d’assurance formation concerné. Elle n’est jamais garantie avant l’accord écrit du financeur.",
    },
  ],
} as const;
