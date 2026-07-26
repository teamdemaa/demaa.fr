export const plumbingPilotSupportFormats = [
  "Google Docs",
  "Google Sheets",
] as const;

export type PlumbingPilotSupportFormat =
  (typeof plumbingPilotSupportFormats)[number];

export type PlumbingPilotSupportDefinition = {
  name: string;
  format: PlumbingPilotSupportFormat;
  purpose: string;
  sections: string[];
  demoAndBlankRequired: true;
  demoUrl?: string;
  blankUrl?: string;
  guardrail?: string;
};

/**
 * Périmètre documentaire du pilote Plomberie.
 *
 * Un process garde un support principal unique. Un support peut contenir
 * plusieurs onglets ou sections, mais il ne devient jamais un dossier de
 * fichiers dispersés. Chaque support devra exister en deux variantes :
 * une démonstration remplie et un modèle vierge à copier.
 */
export const plumbingPilotSupportDefinitionsByProcessId: Record<
  string,
  PlumbingPilotSupportDefinition
> = {
  "process.btp.direction.savoir-ou-va-lentreprise": {
    name: "Tableau du cap annuel et des objectifs",
    format: "Google Sheets",
    purpose:
      "Choisir les priorités de l’entreprise et suivre les objectifs mensuels sans créer un second tableau de bord général.",
    sections: [
      "Cap annuel",
      "Prestations et zones prioritaires",
      "Objectifs mensuels",
      "Décisions de revue",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1leYDWohluy1XjVZBpIUmkckup1qgtpLi3XAgSiVP1Sg/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1sa7uKq_KGwsrIr8cKgdB9vB6S0a-b0FVDnXkUsE9x1o/edit?usp=sharing",
  },
  "process.btp.direction.decider-au-quotidien-sans-le-dirigeant": {
    name: "Grille d’autorité et d’escalade",
    format: "Google Sheets",
    purpose:
      "Préciser qui peut décider quoi, jusqu’à quel montant et dans quels cas le dirigeant doit être alerté.",
    sections: [
      "Décisions courantes",
      "Seuils d’autorisation",
      "Situations d’escalade",
      "Remplaçant du dirigeant",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1IPHjzqOKVf_JAObN-J45Yx21MCCBzzvpSGfrK6h4v_I/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/17F-uUPIW23GRjzWk3zlwcRekAJ8zc357fcQFo2tm3S4/edit?usp=sharing",
  },
  "process.btp.direction.donner-acces-a-lessentiel": {
    name: "Registre des accès et contacts critiques",
    format: "Google Sheets",
    purpose:
      "Identifier les outils, responsables, niveaux d’accès et contacts de secours nécessaires au fonctionnement.",
    sections: [
      "Outils et accès",
      "Responsables",
      "Contacts critiques",
      "Revue des droits",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/19d8dOlWHmsXqsqCzjjtYVgt_MIrhPjOxsdk-b71MK7M/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1SYUwOpqr6HHfXNEKtA1QrqTdzBQBrV6RO8IbK64PDB0/edit?usp=sharing",
    guardrail:
      "Ne jamais stocker de mots de passe ou de codes secrets dans ce support.",
  },
  "process.btp.direction.garder-une-visibilite-sans-reprendre-la-main": {
    name: "Trame du point mensuel de direction",
    format: "Google Docs",
    purpose:
      "Transformer les chiffres de la Synthèse en décisions courtes, responsables et échéances.",
    sections: [
      "Chiffres à retenir",
      "Écarts et causes",
      "Décisions",
      "Trois actions prioritaires",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/document/d/1mr9NvYOrLHvzp8TEDbWXaW-As6WKQvuHBdWxrILDTOw/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/document/d/1RXDjN2fGU2k3-up5hdHyv7FturproI-fNO3m43iZ4To/edit?usp=sharing",
  },
  "process.btp.marketing-vente.attirer-et-vendre-un-chantier": {
    name: "Fiche offre, devis et argumentaire chantier",
    format: "Google Docs",
    purpose:
      "Présenter clairement les prestations, qualifier une demande et répondre aux objections avant l’envoi du devis.",
    sections: [
      "Prestations et exclusions",
      "Questions de qualification",
      "Structure du devis",
      "Arguments et objections",
      "Relances J+2 et J+7",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/document/d/1xbA3Ber0np7dD2g8I5_c1JmcXZjujDQCpduzt1g1agY/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/document/d/1VKfu3A1aTKTNC8iEk7hDXxxHUO-fD0knzgenorDOnW0/edit?usp=sharing",
  },
  "process.btp.marketing-vente.faire-revenir-les-clients": {
    name: "Modèles d’avis, de recommandation et de rappel d’entretien",
    format: "Google Docs",
    purpose:
      "Donner des messages prêts à envoyer après une intervention et avant les prochaines échéances utiles.",
    sections: [
      "Demande d’avis Google",
      "Demande de recommandation",
      "Rappel d’entretien",
      "Rappel de fin de garantie",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/document/d/1hisrXlZf4G_gZXpvvSPWDtkBNz_6NorW_bc9UcRzdWg/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/document/d/18izxn30YAPtlTDvDbULXFk8Bf8Gh7JqIpGxa6x16sDo/edit?usp=sharing",
  },
  "process.btp.marketing-vente.traiter-une-reclamation-ou-un-litige-client": {
    name: "Registre et trames de traitement des réclamations",
    format: "Google Sheets",
    purpose:
      "Suivre les faits, pièces, décisions, réponses et délais de chaque réclamation jusqu’à sa clôture.",
    sections: [
      "Registre des réclamations",
      "Pièces à réunir",
      "Réponse sous 24 heures",
      "Décision et clôture",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1iaJ6Ge0C-cTb4-EPKHJ9SYlnIs2UpZFt0n9oU0AmqmU/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1R-dGoGaxZiK0GbRJPDHKucLd1dkauLlK2lOXLzt7a28/edit?usp=sharing",
  },
  "process.btp.operations.suivre-lavancement-dun-chantier": {
    name: "Suivi d’avancement chantier",
    format: "Google Sheets",
    purpose:
      "Conserver un état fiable du chantier, du prochain passage, des blocages et du reste à faire.",
    sections: [
      "Identité du chantier",
      "Statut et avancement",
      "Interventions et photos",
      "Blocages",
      "Prochaine étape",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1QJ660-GYhbfN-MBOQg1_nQtl5N_djCKrWsYr2FsWt-k/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1YmU5aZs-DfPQ6ShXdjGwtz_yk1FZLTZgh_ZCBZHTnjc/edit?usp=sharing",
  },
  "process.btp.operations.demarrer-et-cloturer-un-chantier": {
    name: "Checklist de démarrage et de réception chantier",
    format: "Google Sheets",
    purpose:
      "Vérifier les prérequis avant le départ puis les essais, preuves et documents avant la clôture.",
    sections: [
      "Avant départ",
      "Ouverture du chantier",
      "Contrôles techniques",
      "Réception client",
      "Documents de clôture",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1rFV0rePIOfkeXCEYAtF1ZOzdrb80jNt4Ny9ZNTdHczA/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1wDZaZIV6RQPoTDsfRmfO8yMeLO--zIQLulSmEcI3JRg/edit?usp=sharing",
  },
  "process.btp.operations.tenir-chaque-corps-de-metier": {
    name: "Checklists techniques par type d’intervention",
    format: "Google Sheets",
    purpose:
      "Standardiser les interventions récurrentes avec les pièces, outils, contrôles et preuves attendus.",
    sections: [
      "Dépannage fuite",
      "Chauffe-eau",
      "Chaudière",
      "Sanitaire",
      "Salle de bain",
      "Contrôle qualité",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/11pKSo5yoC572yBY8Q7VpQojZbEuGiR9I-XHB0ToKr3s/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1iO5tTIjHqmgYBbyGBpXr7fZZjum6U7NSzTyE-yfYy9o/edit?usp=sharing",
  },
  "process.btp.operations.gerer-un-retard-ou-un-imprevu": {
    name: "Registre des retards, imprévus et actions correctives",
    format: "Google Sheets",
    purpose:
      "Tracer l’aléa, la communication client, l’impact, la solution et l’action qui évitera sa répétition.",
    sections: [
      "Incident",
      "Impact client et planning",
      "Décision immédiate",
      "Cause",
      "Action corrective",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1xmJ31AD7g6UgT_yAVB2vxsiFNPTBAZEdQ7uYURfkr6k/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1bJcaycFd0-PlA1Xm-O_SGEpUjbEqNFzIHnowI28si2s/edit?usp=sharing",
  },
  "process.btp.equipe.organiser-les-equipes-remplacer-un-absent": {
    name: "Planning, polyvalence et remplacements",
    format: "Google Sheets",
    purpose:
      "Affecter les bonnes compétences aux interventions et trouver rapidement un remplacement adapté.",
    sections: [
      "Planning hebdomadaire",
      "Compétences et habilitations",
      "Disponibilités",
      "Remplaçants et sous-traitants",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1dCp06b47Z6ScZH8E1HPg5dNI9uKodvwrMKqSN0UNQ5U/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1am48U6V7kPVAB1dXF4qv-hVE7fGPV_y_389yN4bbSzA/edit?usp=sharing",
  },
  "process.btp.equipe.integrer-un-nouvel-employe": {
    name: "Parcours d’intégration et validation d’autonomie",
    format: "Google Sheets",
    purpose:
      "Préparer l’arrivée, suivre les passages en binôme et valider les tâches réalisables en autonomie.",
    sections: [
      "Avant l’arrivée",
      "Première semaine",
      "Interventions en binôme",
      "Compétences à valider",
      "Décision d’autonomie",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/10bagYhVMKQiYjt2aR1O1VB6_-br8yvb4fEKURqZ4tSc/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1fXQ2jhW-YRuvlkozfOCVO1E9dPcCQJZ07ZMnBGVBxTg/edit?usp=sharing",
  },
  "process.btp.finance-admin.suivre-la-rentabilite": {
    name: "Rentabilité par chantier - devis vs réalisé",
    format: "Google Sheets",
    purpose:
      "Comparer pour chaque chantier le prix vendu, les achats, les heures, la sous-traitance et la marge réelle.",
    sections: [
      "Données du devis",
      "Coûts réels",
      "Temps prévus et réalisés",
      "Marge",
      "Écarts à corriger",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1hI_mX6G8LjkhM3fO70BMNd5RgKiOTVvce8pAr0tZwn8/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1L6yr6qVEmC2VcsZlNEWBIhYLpTEzqklfSL8nCiE404Y/edit?usp=sharing",
  },
  "process.btp.finance-admin.payer-a-temps": {
    name: "Calendrier des échéances et paiements",
    format: "Google Sheets",
    purpose:
      "Anticiper les paiements récurrents et ponctuels avec leurs justificatifs et leur impact de trésorerie.",
    sections: [
      "Échéances récurrentes",
      "Factures fournisseurs",
      "Paiements à venir",
      "Justificatifs transmis",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1YPDs0ltwbHtFHDUUK03QHOPtENNfRe1C_1wkG9c3zNs/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1GP-SKclmGlbDgBuxAoGeKUReL8g9RDOhyfiXqnaHrQw/edit?usp=sharing",
  },
  "process.btp.finance-admin.se-faire-payer": {
    name: "Facturation, encaissements et relances",
    format: "Google Sheets",
    purpose:
      "Suivre acomptes, situations, soldes et retards jusqu’à l’encaissement complet.",
    sections: [
      "Échéancier client",
      "Factures émises",
      "Encaissements",
      "Relances",
      "Litiges de paiement",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1oYzHnmPJevCPtL0nbizgLsCdcPqWkwPZ8u3re7E3qHQ/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1SMW51MtQmLnOPCXHJ8d3J6EW8l9h9cYe_PIg19V2t5s/edit?usp=sharing",
  },
  "process.btp.conformite-metier.securite-et-couverture-assurance": {
    name: "Registre sécurité, assurances et habilitations",
    format: "Google Sheets",
    purpose:
      "Suivre les attestations, contrôles, équipements et habilitations avant leur expiration.",
    sections: [
      "Assurances",
      "Habilitations",
      "Équipements de protection",
      "Contrôles périodiques",
      "Incidents",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1MlABqgDulUnXQ4JyYXOHJtpIK_wtTvm8BnleED0-lnY/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/17lSBjWmsQzz7bFotNjJ2-NVtDDcPU8Jym6MZrQKmtjQ/edit?usp=sharing",
  },
  "process.btp.materiel-approvisionnement.materiel-et-fournisseurs": {
    name: "Stock, matériel, commandes et fournisseurs",
    format: "Google Sheets",
    purpose:
      "Suivre le stock critique, l’affectation des outils, les commandes, les réceptions et la qualité fournisseur.",
    sections: [
      "Stock critique",
      "Matériel affecté",
      "Commandes",
      "Contrôle des réceptions",
      "Fournisseurs",
    ],
    demoAndBlankRequired: true,
    demoUrl:
      "https://docs.google.com/spreadsheets/d/1iPvtRhYkRWg-IfvpxdzXZzovaBII3mA9KU2kIqGKT0Y/edit?usp=sharing",
    blankUrl:
      "https://docs.google.com/spreadsheets/d/1fYwIPb6QQR9eBbtd1j8UDPQQhc5cWfHTLFqomxr3bFM/edit?usp=sharing",
  },
};
