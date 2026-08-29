export type ApplicationMetierCaseStudy = {
  id: string;
  sector: string;
  cardDescription: string;
  title: string;
  problem: string;
  application: string;
  flow: readonly string[];
  results?: readonly string[];
};

export const APPLICATION_METIER_CASE_STUDIES: readonly ApplicationMetierCaseStudy[] = [
  {
    id: "entreprise-batiment",
    sector: "Entreprise du bâtiment",
    cardDescription:
      "Gérer les chantiers et organiser le planning des collaborateurs au même endroit.",
    title: "Organiser les chantiers et le planning des équipes",
    problem:
      "Les informations sur les chantiers et les disponibilités des collaborateurs étaient difficiles à suivre ensemble. L’entreprise devait pouvoir savoir quelles personnes intervenaient, sur quel chantier et à quel moment.",
    application:
      "Une application permettant de centraliser les chantiers, d’affecter les collaborateurs et d’organiser leur planning.",
    flow: [
      "Chantier créé",
      "Collaborateurs affectés",
      "Intervention planifiée",
      "Planning mis à jour",
      "Chantier suivi",
      "Intervention clôturée",
    ],
  },
  {
    id: "entreprise-nettoyage",
    sector: "Entreprise de nettoyage",
    cardDescription:
      "Planifier les interventions, suivre les clients et vérifier quand chaque site a été nettoyé.",
    title: "Suivre les interventions et le pointage des équipes",
    problem:
      "L’entreprise devait gérer plusieurs clients, plusieurs sites et des interventions récurrentes. Elle avait besoin de savoir qui était intervenu, à quelle heure et quand le nettoyage avait réellement été effectué.",
    application:
      "Une application réunissant les clients, les sites, les interventions, les collaborateurs et le pointage, avec un historique par site.",
    flow: [
      "Client enregistré",
      "Site ajouté",
      "Intervention planifiée",
      "Collaborateur affecté",
      "Arrivée et départ pointés",
      "Nettoyage enregistré",
    ],
  },
  {
    id: "cabinet-expertise-comptable",
    sector: "Cabinet d’expertise comptable",
    cardDescription:
      "Fluidifier le suivi des demandes, attribuer chaque sujet et donner de la visibilité aux clients.",
    title: "Fluidifier le suivi des demandes clients",
    problem:
      "Le cabinet devait savoir quelles demandes étaient en cours, qui en était responsable et quels clients devaient être relancés. Les clients avaient également besoin de voir l’état de leurs propres demandes.",
    application:
      "Une application permettant de centraliser les demandes, d’attribuer un responsable, de suivre les relances et de partager l’avancement avec le client.",
    flow: [
      "Demande reçue",
      "Responsable attribué",
      "Informations collectées",
      "Client relancé",
      "Avancement partagé",
      "Demande clôturée",
    ],
  },
] as const;
