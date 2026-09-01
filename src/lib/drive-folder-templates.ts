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
        id: "company",
        name: "01 — Entreprise",
        restricted: true,
        children: [
          folder("01 — Juridique"),
          folder("02 — Contrats"),
          folder("03 — Assurances"),
          folder("04 — Locaux et matériel"),
        ],
      },
      {
        id: "finance",
        name: "02 — Finance",
        restricted: true,
        children: [
          folder(String(year), [
            folder("01 — Factures clients"),
            folder("02 — Factures fournisseurs"),
            folder("03 — Banque"),
            folder("04 — Notes de frais"),
            folder("05 — Déclarations"),
            folder("06 — Clôture"),
          ]),
        ],
      },
      {
        id: "clients",
        name: "03 — Clients",
        children: [
          folder("00 — Modèle de dossier client", [
            folder("01 — Contrat"),
            folder("02 — Documents reçus"),
            folder("03 — Livrables"),
          ]),
          folder("01 — Clients actifs"),
          folder("99 — Clients archivés"),
        ],
      },
      {
        id: "team",
        name: "04 — Équipe",
        restricted: true,
        children: [
          folder("00 — Modèle de dossier collaborateur", [
            folder("01 — Contrat"),
            folder("02 — Documents administratifs"),
            folder("03 — Entretiens"),
            folder("04 — Formations"),
          ]),
          folder("01 — Dossiers collaborateurs"),
        ],
      },
      {
        id: "brand",
        name: "05 — Marque et communication",
        children: [
          folder("01 — Logos et charte"),
          folder("02 — Photos"),
          folder("03 — Contenus finalisés"),
        ],
      },
      {
        id: "templates",
        name: "06 — Modèles de documents",
        children: [
          folder("01 — Devis et propositions"),
          folder("02 — Comptes rendus"),
          folder("03 — Présentations"),
          folder("04 — Documents internes"),
        ],
      },
      {
        id: "archives",
        name: "99 — Archives",
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
