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

export function buildCompanyDriveFolderTemplate(year: number): DriveFolderTemplate {
  return {
    slug: "structure-google-drive-entreprise",
    title: "Structure Google Drive pour organiser son entreprise",
    defaultRootName: "Mon entreprise",
    sections: [
      {
        id: "inbox",
        name: "00 — À classer",
      },
      {
        id: "finance",
        name: "01 — Administration & finance",
        restricted: true,
        children: [
          folder("01 — Société & juridique", [
            folder("Immatriculation & statuts"),
            folder("Assemblées & actes de société"),
            folder("Marques & propriété intellectuelle"),
          ]),
          folder("02 — Assurances", [folder("Contrats & attestations"), folder("Sinistres")]),
          folder("03 — Banque & financements", [
            folder("Comptes bancaires & RIB"),
            folder("Emprunts & financements"),
            folder("Aides & subventions"),
          ]),
          folder("04 — Comptabilité", [
            folder(String(year), [
              folder("01 — Factures de vente"),
              folder("02 — Factures d’achat"),
              folder("03 — Relevés bancaires"),
              folder("04 — Notes de frais & justificatifs"),
              folder("05 — Déclarations fiscales"),
              folder("06 — Bilan & clôture"),
            ]),
          ]),
          folder("05 — Budget & trésorerie"),
          folder("06 — Fournisseurs & abonnements"),
          folder("07 — Locaux & matériel", [
            folder("Baux & documents des locaux"),
            folder("Équipements & véhicules"),
            folder("Entretien, garanties & contrôles"),
          ]),
          folder("99 — Archives"),
        ],
      },
      {
        id: "clients",
        name: "02 — Dossiers clients",
        children: [folder("99 — Dossiers archivés")],
      },
      {
        id: "team",
        name: "03 — Équipe",
        restricted: true,
        children: [
          folder("01 — Recrutement"),
          folder("02 — Dossiers collaborateurs"),
          folder("03 — Documents employeur", [
            folder("Registres & documents collectifs"),
            folder("Déclarations sociales"),
            folder("Santé & sécurité au travail"),
          ]),
          folder("99 — Archives", [
            folder("Recrutements clôturés"),
            folder("Anciens collaborateurs"),
          ]),
        ],
      },
      {
        id: "brand",
        name: "04 — Communication",
        children: [
          folder("01 — Identité visuelle", [folder("Logos"), folder("Charte graphique")]),
          folder("02 — Photos & vidéos", [folder("Photos"), folder("Vidéos")]),
          folder("03 — Présentations & supports", [
            folder("Présentations"),
            folder("Brochures, affiches & autres supports"),
          ]),
          folder("04 — Site & publications"),
          folder("99 — Archives"),
        ],
      },
    ],
  };
}

// These guides are deliberately separate from the generated tree: no fictitious
// client, employee or supplier folders are created in a user's Drive.
export const COMPANY_DRIVE_DOSSIER_GUIDES = [
  {
    title: "Un dossier client ou prospect",
    location: "02 — Dossiers clients",
    rootName: "[Nom du client]",
    children: [
      folder("01 — Devis & contrats"),
      folder("02 — Documents reçus"),
      folder("03 — Travail en cours"),
      folder("04 — Livrables & validations"),
    ],
  },
  {
    title: "Un fournisseur ou abonnement",
    location: "01 — Administration & finance / 06 — Fournisseurs & abonnements",
    rootName: "[Nom du fournisseur]",
    children: [folder("Contrats & conditions"), folder("Commandes & documents associés")],
  },
  {
    title: "Un recrutement",
    location: "03 — Équipe / 01 — Recrutement",
    rootName: "[Poste à pourvoir]",
    children: [folder("Fiche de poste & annonce"), folder("Candidatures")],
  },
  {
    title: "Un collaborateur",
    location: "03 — Équipe / 02 — Dossiers collaborateurs",
    rootName: "[Prénom Nom]",
    children: [
      folder("01 — Contrat & avenants"),
      folder("02 — Documents administratifs"),
      folder("03 — Paie"),
      folder("04 — Absences & justificatifs"),
      folder("05 — Entretiens & formation"),
      folder("06 — Documents de départ"),
    ],
  },
] as const;

export function selectDriveFolderSections(
  template: DriveFolderTemplate,
  selectedSectionIds: readonly string[],
) {
  const allowedIds = new Set(selectedSectionIds);
  return template.sections.filter((section) => allowedIds.has(section.id));
}

export function formatDriveFolderTree(
  rootName: string,
  sections: readonly DriveFolderNode[],
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
