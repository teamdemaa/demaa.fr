import type { ApplicationMetierCaseStudy } from "@/lib/application-metier-case-studies";

export const AUTOMATION_CASE_STUDIES: readonly ApplicationMetierCaseStudy[] = [
  {
    id: "cabinet-expertise-comptable-automation",
    sector: "Cabinet d’expertise comptable",
    cardDescription:
      "Faire circuler les demandes, les pièces manquantes et les relances sans mettre le suivi à jour à la main.",
    title: "Fluidifier la collecte des pièces et le suivi client",
    problem:
      "Les demandes arrivaient par plusieurs canaux. Il fallait attribuer chaque sujet, vérifier les pièces reçues, relancer les clients puis reporter l’avancement dans le suivi du cabinet.",
    application:
      "Les outils déjà utilisés sont reliés pour enregistrer la demande, prévenir le bon collaborateur, déclencher les relances utiles et tenir le suivi à jour.",
    flow: [
      "Demande reçue",
      "Dossier identifié",
      "Collaborateur prévenu",
      "Pièces manquantes repérées",
      "Relance déclenchée",
      "Suivi mis à jour",
    ],
  },
  {
    id: "entreprise-batiment-automation",
    sector: "Entreprise du bâtiment",
    cardDescription:
      "Relier les demandes, les dossiers de chantier, le planning et les informations transmises à l’équipe terrain.",
    title: "Orchestrer le passage de la demande au chantier",
    problem:
      "Les informations étaient reprises entre les messages, les devis, les dossiers et le planning. Chaque nouveau chantier demandait plusieurs créations, vérifications et notifications manuelles.",
    application:
      "La validation d’un chantier déclenche la création de son dossier, la mise à jour du suivi et l’envoi des informations nécessaires aux personnes concernées.",
    flow: [
      "Demande qualifiée",
      "Devis accepté",
      "Dossier créé",
      "Planning mis à jour",
      "Équipe prévenue",
      "Suivi centralisé",
    ],
  },
  {
    id: "maintenance-ascenseurs-automation",
    sector: "Maintenance d’ascenseurs",
    cardDescription:
      "Coordonner les demandes d’intervention, le planning des techniciens, les comptes rendus et les suites à donner.",
    title: "Fluidifier le traitement des interventions techniques",
    problem:
      "Entre la demande du client, l’affectation d’un technicien, le compte rendu et la prochaine action, l’information devait être ressaisie ou transmise plusieurs fois.",
    application:
      "Les étapes sont reliées pour créer l’intervention, prévenir les personnes concernées, classer le compte rendu et déclencher la suite sans ressaisie inutile.",
    flow: [
      "Demande reçue",
      "Intervention créée",
      "Technicien affecté",
      "Client informé",
      "Compte rendu classé",
      "Suite déclenchée",
    ],
  },
] as const;
