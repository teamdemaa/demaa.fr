export type SocialTool = {
  name: string;
  type: string;
  usage: string;
};

export type SocialProcess = {
  pillar: string;
  title: string;
  description: string;
  examples?: string;
};

export type SocialStudioSector = {
  slug: string;
  name: string;
  description: string;
  sectorLabel: string;
  processes: SocialProcess[];
  tools: SocialTool[];
};

export type SocialCarouselSlide =
  | {
      id: "intro";
      kind: "intro";
      eyebrow?: string;
      titleLines: string[];
      highlight: string;
      subtitle: string;
      footer: string;
    }
  | {
      id: "audit";
      kind: "process-snapshot";
      title: string;
      subtitle: string;
      footer: string;
      sector: SocialStudioSector;
      openProcessTitle?: string;
    }
  | {
      id: "tools";
      kind: "tools-snapshot";
      title: string;
      subtitle: string;
      footer: string;
      tools: SocialTool[];
    }
  | {
      id: "process";
      kind: "checklist";
      title: string;
      subtitle: string;
      steps: string[];
      footer: string;
    }
  | {
      id: "audit-call";
      kind: "cta-snapshot";
      title: string;
      footer: string;
      sector: SocialStudioSector;
      openProcessTitle?: string;
    }
  | {
      id: "closing";
      kind: "closing";
      title: string;
      footer: string;
      sector: SocialStudioSector;
    };

export type SocialCarousel = {
  sector: SocialStudioSector;
  slides: SocialCarouselSlide[];
  metaCaption: string;
  linkedinCaption: string;
  canvaBrief: string;
};

const SITE_URL = "www.demaa.fr";

export function buildSocialCarousel(sector: SocialStudioSector): SocialCarousel {
  const mainProcess = getMainOperationProcess(sector);
  const steps = getProcessSteps(mainProcess);
  const tools = sector.tools.slice(0, 6);

  return {
    sector,
    slides: [
      {
        id: "intro",
        kind: "intro",
        titleLines: ["Comment structurer"],
        highlight: getIntroSubject(sector.name),
        subtitle: "Pour que l'entreprise avance sans dépendre de vous à chaque décision",
        footer: SITE_URL,
      },
      {
        id: "audit",
        kind: "process-snapshot",
        title: "1. Cartographier l'organisation existante",
        subtitle: "Un modèle d'audit en accès libre, sans email requis",
        footer: `Disponible sur ${SITE_URL}`,
        sector,
        openProcessTitle: mainProcess?.title,
      },
      {
        id: "tools",
        kind: "tools-snapshot",
        title: "2. Choisir les outils après avoir clarifié le système",
        subtitle: "Comparer selon vos flux réels, pas selon les promesses marketing",
        footer: `Disponible sur ${SITE_URL}`,
        tools,
      },
      {
        id: "process",
        kind: "checklist",
        title: "3. Avancer avec des ressources directement exploitables",
        subtitle: `Exemple : ${mainProcess?.title ?? "Processus clé"}`,
        steps,
        footer: SITE_URL,
      },
      {
        id: "audit-call",
        kind: "cta-snapshot",
        title:
          "Un échange de 30 minutes suffit souvent à repérer ce qui bloque, ce qui manque et ce qui doit être structuré en priorité.",
        footer: `Rendez-vous sur ${SITE_URL}`,
        sector,
        openProcessTitle: mainProcess?.title,
      },
      {
        id: "closing",
        kind: "closing",
        title: "À bientôt,",
        footer: SITE_URL,
        sector,
      },
    ],
    metaCaption: buildMetaCaption(sector, mainProcess),
    linkedinCaption: buildLinkedinCaption(sector, mainProcess),
    canvaBrief: buildCanvaBrief(sector, mainProcess, steps, tools),
  };
}

function getMainOperationProcess(sector: SocialStudioSector): SocialProcess | undefined {
  return sector.processes.find((process) => process.pillar === "Opérations") ?? sector.processes[0];
}

function getIntroPrefix(sectorName: string): string {
  const normalizedName = sectorName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedName.includes("batiment") || normalizedName.includes("btp")) {
    return "une entreprise du";
  }

  if (
    normalizedName.startsWith("agence") ||
    normalizedName.startsWith("boulangerie") ||
    normalizedName.startsWith("salle") ||
    normalizedName.startsWith("formation")
  ) {
    return "une";
  }

  return "un";
}

function getIntroSubject(sectorName: string): string {
  const normalizedName = normalizeSectorName(sectorName);
  const lowerName = sectorName.toLowerCase();

  if (normalizedName.includes("batiment") || normalizedName.includes("btp")) {
    return "une entreprise du bâtiment";
  }

  if (normalizedName.startsWith("transport")) {
    return `une activité de ${lowerName}`;
  }

  if (normalizedName.includes("livraison")) {
    return `une activité de ${lowerName}`;
  }

  if (normalizedName === "freelance" || normalizedName.includes("consultant")) {
    return `une activité de ${lowerName}`;
  }

  return `${getCaptionArticle(sectorName)} ${lowerName}`;
}

function normalizeSectorName(sectorName: string): string {
  return sectorName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getProcessSteps(process?: SocialProcess): string[] {
  if (!process?.examples) {
    return [
      "Point de départ identifié",
      "Responsable désigné",
      "Étapes clarifiées",
      "Suivi mis à jour",
      "Blocage signalé",
      "Validation finale",
    ];
  }

  const cleanedExample = process.examples
    .replace(/^Exemple\s*:\s*/i, "")
    .replace(/\.$/, "");

  const steps = cleanedExample
    .split("→")
    .map((step) => step.trim())
    .filter(Boolean);

  return steps.length >= 3 ? steps.slice(0, 6) : getProcessSteps();
}

function buildMetaCaption(sector: SocialStudioSector, process?: SocialProcess): string {
  return [
    `Structurer ${getIntroSubject(sector.name)}, ce n'est pas empiler des outils ou des procédures.`,
    "",
    "C'est rendre visible ce qui dépend encore trop du dirigeant : les décisions, les responsabilités, les informations clés et les points de friction.",
    "",
    "Le bon ordre : diagnostiquer l'organisation, clarifier les process, puis choisir les outils et modèles qui servent réellement le terrain.",
    ...(process ? [`Exemple concret : ${process.title.toLowerCase()}.`] : []),
    "",
    `Disponible sur ${SITE_URL}`,
    "",
    "#organisation #process #tpe #entrepreneur #demaa",
  ].join("\n");
}

function buildLinkedinCaption(sector: SocialStudioSector, process?: SocialProcess): string {
  return [
    `${capitalize(getIntroSubject(sector.name))} devient fragile quand tout repose sur la mémoire, les arbitrages et l'énergie du dirigeant.`,
    "",
    "Une organisation efficace commence rarement par un nouvel outil.",
    "Elle commence par une lecture lucide du système existant :",
    "- où l'information circule mal",
    "- où les décisions restent bloquées",
    "- où les responsabilités sont implicites",
    "- où les mêmes problèmes reviennent chaque semaine",
    "",
    "Ensuite seulement, on documente les process utiles, on choisit les bons outils et on s'appuie sur des modèles directement exploitables.",
    ...(process ? [`Dans cet exemple, on part du processus : ${process.title}.`] : []),
    "",
    `À retrouver sur ${SITE_URL}`,
  ].join("\n");
}

function buildCanvaBrief(
  sector: SocialStudioSector,
  process: SocialProcess | undefined,
  steps: string[],
  tools: SocialTool[],
): string {
  return [
    `CANVA BRIEF - Carrousel Demaa - ${sector.name}`,
    "",
    "Format",
    "- 6 pages",
    "- 1080 x 1080 px",
    "- Fond blanc",
    "- Typographie principale proche Satoshi / Avenir Next",
    "- Typographie italique proche Gambetta / Georgia Italic",
    "- Vert Demaa : #315F46",
    "- Texte principal : #000000",
    "- Texte secondaire : #6F756E",
    "- Footer gris clair : www.demaa.fr",
    "",
    "Assets à importer dans Canva",
    "- Exporter les PNG depuis /social-studio pour récupérer les screenshots propres",
    "- Utiliser les PNG comme références ou images de fond partiel",
    "- Garder les textes Canva éditables quand possible",
    "",
    "Slide 1",
    `Titre : Comment structurer ${getIntroSubject(sector.name)} ?`,
    "Style : grand titre aligné à droite, sujet en vert et gras.",
    "Sous-titre italique : Pour que l'entreprise avance sans dépendre de vous à chaque décision",
    "Footer : www.demaa.fr",
    "",
    "Slide 2",
    "Titre : 1. Cartographier l'organisation existante",
    "Sous-titre : Un modèle d'audit en accès libre, sans email requis",
    `Screenshot : aperçu processus ${sector.name}, onglet Processus`,
    "Footer : Disponible sur www.demaa.fr",
    "",
    "Slide 3",
    "Titre : 2. Choisir les outils après avoir clarifié le système",
    "Sous-titre : Comparer selon vos flux réels, pas selon les promesses marketing",
    "Outils à afficher :",
    ...tools.slice(0, 4).map((tool) => `- ${tool.name} (${tool.type}) : ${tool.usage}`),
    "Footer : Disponible sur www.demaa.fr",
    "",
    "Slide 4",
    "Titre : 3. Avancer avec des ressources directement exploitables",
    `Sous-titre : Exemple : ${process?.title ?? "Processus clé"}`,
    "Checklist :",
    ...steps.map((step, index) => `- ${index + 1}. ${step}`),
    "Footer : www.demaa.fr",
    "",
    "Slide 5",
    "Texte italique : Un échange de 30 minutes suffit souvent à repérer ce qui bloque, ce qui manque et ce qui doit être structuré en priorité.",
    `Screenshot : aperçu processus ${sector.name} avec bouton Audit de mon organisation`,
    "Footer : Rendez-vous sur www.demaa.fr",
    "",
    "Slide 6",
    "Titre : À bientôt,",
    "Screenshot très pâle : page d'accueil Demaa / recherche activité",
    "Footer : www.demaa.fr",
    "",
    "Caption Meta",
    buildMetaCaption(sector, process),
    "",
    "Caption LinkedIn",
    buildLinkedinCaption(sector, process),
  ].join("\n");
}

function getCaptionArticle(sectorName: string): "un" | "une" {
  const introPrefix = getIntroPrefix(sectorName);

  return introPrefix === "une" ? "une" : "un";
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
