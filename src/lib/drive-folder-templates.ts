export type DriveFolderNode = Readonly<{
  name: string;
  children?: readonly DriveFolderNode[];
}>;

export type DriveFolderSection = Readonly<{
  id: string;
  name: string;
  restricted?: boolean;
  children?: readonly DriveFolderNode[];
}>;

export type DriveFolderTemplate = Readonly<{
  slug: string;
  title: string;
  defaultRootName: string;
  sections: readonly DriveFolderSection[];
}>;

const folder = (
  name: string,
  children?: readonly DriveFolderNode[],
): DriveFolderNode => ({ name, children });

const months = [
  "01 — Janvier",
  "02 — Février",
  "03 — Mars",
  "04 — Avril",
  "05 — Mai",
  "06 — Juin",
  "07 — Juillet",
  "08 — Août",
  "09 — Septembre",
  "10 — Octobre",
  "11 — Novembre",
  "12 — Décembre",
] as const;

export function buildCompanyDriveFolderTemplate(year: number): DriveFolderTemplate {
  const previousYear = year - 1;

  return {
    slug: "structure-google-drive-entreprise",
    title: "Structure Google Drive pour organiser son entreprise",
    defaultRootName: "Mon entreprise",
    sections: [
      {
        id: "inbox",
        name: "00 — À classer",
        children: [folder("Documents reçus"), folder("Documents à traiter")],
      },
      {
        id: "direction",
        name: "01 — Direction & pilotage",
        restricted: true,
        children: [
          folder("01 — Stratégie et objectifs", [folder(String(previousYear)), folder(String(year))]),
          folder("02 — Budgets et prévisions", [folder(String(previousYear)), folder(String(year))]),
          folder("03 — Tableaux de bord", [folder(String(previousYear)), folder(String(year))]),
          folder("04 — Réunions de direction", [folder(String(year))]),
          folder("05 — Décisions importantes"),
        ],
      },
      {
        id: "finance",
        name: "02 — Finance & comptabilité",
        restricted: true,
        children: [
          folder("00 — Informations permanentes", [
            folder("Coordonnées bancaires"),
            folder("Mandats et autorisations"),
            folder("Contacts comptables"),
          ]),
          folder(String(previousYear), [folder("06 — Clôture comptable")]),
          folder(String(year), [
            folder("01 — Factures clients"),
            folder("02 — Factures fournisseurs"),
            folder("03 — Banque", months.map((month) => folder(month))),
            folder("04 — Notes de frais"),
            folder("05 — TVA et déclarations"),
            folder("06 — Trésorerie"),
            folder("07 — Clôture comptable"),
          ]),
        ],
      },
      {
        id: "administration",
        name: "03 — Administration & juridique",
        restricted: true,
        children: [
          folder("01 — Société", [
            folder("Statuts"),
            folder("Kbis et immatriculation"),
            folder("Assemblées et décisions"),
            folder("Registres obligatoires"),
          ]),
          folder("02 — Contrats", [folder("Contrats actifs"), folder("Contrats terminés")]),
          folder("03 — Assurances", [
            folder("Contrats"),
            folder("Attestations", [folder(String(previousYear)), folder(String(year))]),
            folder("Sinistres"),
          ]),
          folder("04 — Locaux et équipements"),
          folder("05 — RGPD et données personnelles"),
          folder("06 — Courriers administratifs", [folder(String(previousYear)), folder(String(year))]),
        ],
      },
      {
        id: "commercial",
        name: "04 — Commercial",
        children: [
          folder("01 — Offres et tarifs"),
          folder("02 — Présentations commerciales"),
          folder("03 — Modèles de devis"),
          folder("04 — Propositions envoyées", [
            folder(String(year), [folder("Acceptées"), folder("En attente"), folder("Refusées")]),
          ]),
          folder("05 — Partenaires"),
          folder("06 — Suivi commercial"),
        ],
      },
      {
        id: "clients",
        name: "05 — Clients & missions",
        children: [
          folder("00 — Modèle de dossier client", [
            folder("01 — Contrat et cadrage"),
            folder("02 — Informations reçues"),
            folder("03 — Travail en cours"),
            folder("04 — Livrables"),
            folder("05 — Réunions et décisions"),
            folder("06 — Suivi de la mission"),
          ]),
          folder("01 — Clients actifs"),
          folder("02 — Missions internes"),
          folder("99 — Clients archivés", [folder(String(previousYear)), folder(String(year))]),
        ],
      },
      {
        id: "team",
        name: "06 — Équipe & RH",
        restricted: true,
        children: [
          folder("00 — Modèle de dossier collaborateur", [
            folder("01 — Contrat et avenants"),
            folder("02 — Documents administratifs"),
            folder("03 — Entretiens"),
            folder("04 — Formations"),
            folder("05 — Départ"),
          ]),
          folder("01 — Dossiers collaborateurs"),
          folder("02 — Paie", [folder(String(previousYear)), folder(String(year), months.map((month) => folder(month)))]),
          folder("03 — Recrutement", [folder(String(year), [folder("Intitulé du poste")])]),
          folder("04 — Intégration", [folder("Parcours d’intégration"), folder("Checklist nouvel arrivant")]),
          folder("05 — Organisation de l’équipe"),
          folder("06 — Politiques et règles internes"),
        ],
      },
      {
        id: "marketing",
        name: "07 — Marketing & communication",
        children: [
          folder("01 — Identité de marque", [folder("Logos"), folder("Couleurs et typographies"), folder("Charte graphique")]),
          folder("02 — Site internet"),
          folder("03 — Réseaux sociaux", [folder("Modèles"), folder("Publications", [folder(String(year))])]),
          folder("04 — Contenus", [folder(String(year), [folder("À préparer"), folder("En production"), folder("Publiés")])]),
          folder("05 — Campagnes", [folder(String(year))]),
          folder("06 — Photos et médias"),
        ],
      },
      {
        id: "processes",
        name: "08 — Processus & modèles",
        children: [
          folder("01 — Direction"),
          folder("02 — Finance"),
          folder("03 — Administration"),
          folder("04 — Commercial"),
          folder("05 — Opérations"),
          folder("06 — Équipe & RH"),
          folder("07 — Marketing"),
          folder("99 — Modèles de documents", [
            folder("Comptes rendus"),
            folder("Propositions"),
            folder("Suivis"),
            folder("Checklists"),
          ]),
        ],
      },
      {
        id: "it",
        name: "09 — Outils & informatique",
        children: [
          folder("01 — Liste des outils"),
          folder("02 — Abonnements et licences"),
          folder("03 — Matériel"),
          folder("04 — Procédures informatiques"),
          folder("05 — Sauvegardes"),
          folder("06 — Incidents"),
        ],
      },
      {
        id: "archives",
        name: "99 — Archives générales",
        children: [folder(String(previousYear)), folder("Documents historiques")],
      },
    ],
  };
}

export function selectDriveFolderSections(
  template: DriveFolderTemplate,
  selectedSectionIds: readonly string[],
) {
  const allowedIds = new Set(selectedSectionIds);
  return template.sections.filter((section) => allowedIds.has(section.id));
}

export function formatDriveFolderTree(
  rootName: string,
  sections: readonly DriveFolderSection[],
) {
  const lines = [rootName];

  function appendNodes(nodes: readonly DriveFolderNode[], prefix: string) {
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      lines.push(`${prefix}${isLast ? "└──" : "├──"} ${node.name}`);
      if (node.children?.length) {
        appendNodes(node.children, `${prefix}${isLast ? "    " : "│   "}`);
      }
    });
  }

  appendNodes(sections, "");
  return lines.join("\n");
}
