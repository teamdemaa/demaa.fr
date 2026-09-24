export type AccompanimentCaseStudy = {
  id: string;
  sector: string;
  cardDescription: string;
  title: string;
  problem: string;
  system: string;
  flow: readonly string[];
  image: {
    src: string;
    alt: string;
  };
};

export const ACCOMPANIMENT_CASE_STUDIES: readonly AccompanimentCaseStudy[] = [
  {
    id: "cabinet-comptable",
    sector: "Cabinet comptable",
    cardDescription: "Les demandes clients, les pièces et les relances sont suivies au même endroit.",
    title: "Ne plus perdre le fil des demandes clients",
    problem: "Les demandes arrivent par e-mail, téléphone ou rendez-vous. Il devient difficile de savoir qui traite le sujet, quelles pièces manquent et quel client doit être relancé.",
    system: "Un suivi partagé par client et par demande : un responsable, les informations attendues, la prochaine action et un état que le client peut comprendre.",
    flow: ["Demande reçue", "Responsable attribué", "Pièces collectées", "Client relancé", "Avancement partagé", "Demande clôturée"],
    image: {
      src: "/images/kits/cabinet-comptable/tableau-suivi-preview.webp",
      alt: "Aperçu illustratif d’un tableau de suivi pour un cabinet comptable",
    },
  },
  {
    id: "securite-incendie",
    sector: "Sécurité incendie",
    cardDescription: "Les contrôles, interventions et prochaines échéances ne reposent plus sur une seule personne.",
    title: "Suivre les contrôles et les interventions par site",
    problem: "Les équipements, les dates de contrôle et les comptes rendus sont dispersés. Le dirigeant doit souvent vérifier lui-même ce qui est prévu, réalisé ou à relancer.",
    system: "Un suivi par site et par équipement, avec les contrôles à venir, l’intervention attribuée, le compte rendu et la prochaine échéance.",
    flow: ["Contrôle à prévoir", "Site et équipement identifiés", "Intervention planifiée", "Technicien affecté", "Compte rendu transmis", "Prochaine échéance créée"],
    image: {
      src: "/images/kits/entreprise-de-securite/tableau-suivi-preview.webp",
      alt: "Aperçu illustratif d’un tableau de suivi pour une entreprise de sécurité",
    },
  },
  {
    id: "renovation",
    sector: "BTP et rénovation",
    cardDescription: "Le devis, le chantier, l’équipe et les changements client sont reliés dans un même suivi.",
    title: "Garder le chantier lisible du devis à la clôture",
    problem: "Les décisions client, les informations terrain et les disponibilités de l’équipe circulent entre appels, messages et documents. Les changements reviennent vers le dirigeant pour être arbitrés.",
    system: "Un suivi qui relie le devis, le chantier, les responsables, les points à valider et les prochaines actions jusqu’à la clôture.",
    flow: ["Demande qualifiée", "Devis envoyé", "Chantier planifié", "Équipe affectée", "Avancement et changements suivis", "Chantier clôturé"],
    image: {
      src: "/images/kits/renovation-interieur/tableau-suivi-preview.webp",
      alt: "Aperçu illustratif d’un tableau de suivi pour une entreprise de rénovation",
    },
  },
  {
    id: "electricite",
    sector: "Entreprise d’électricité",
    cardDescription: "Le bureau et le terrain disposent des mêmes informations avant, pendant et après l’intervention.",
    title: "Faire remonter le terrain dans le suivi de chantier",
    problem: "Après une intervention, les photos, réserves et informations utiles restent dans les téléphones ou les messages. Le bureau doit reconstituer ce qui s’est passé avant de répondre au client ou facturer.",
    system: "Un suivi par chantier qui réunit l’intervention, les documents utiles, les retours terrain, les validations et la suite à donner.",
    flow: ["Intervention préparée", "Technicien affecté", "Retour terrain ajouté", "Réserve ou validation traitée", "Client informé", "Éléments transmis à la facturation"],
    image: {
      src: "/images/kits/electricite-generale/tableau-suivi-preview.webp",
      alt: "Aperçu illustratif d’un tableau de suivi pour une entreprise d’électricité",
    },
  },
  {
    id: "maintenance-informatique",
    sector: "Maintenance informatique",
    cardDescription: "Les demandes urgentes, les interventions et les actions suivantes sont visibles par toute l’équipe.",
    title: "Qualifier, attribuer et suivre les demandes techniques",
    problem: "Les urgences arrivent de partout et l’équipe répond au plus pressé. Sans suivi commun, les demandes récurrentes et les prochaines actions passent après les interruptions du quotidien.",
    system: "Un parcours de demande partagé, avec une qualification, un responsable, le compte rendu d’intervention et une action de suivi visible.",
    flow: ["Demande reçue", "Besoin qualifié", "Intervention attribuée", "Compte rendu ajouté", "Client informé", "Action suivante planifiée"],
    image: {
      src: "/images/kits/reparation-informatique-mobile/tableau-suivi-preview.webp",
      alt: "Aperçu illustratif d’un tableau de suivi pour une activité de maintenance informatique",
    },
  },
] as const;
