import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(
  rootDir,
  "src/lib/process-registry.generated.json",
);
const stepsPath = path.join(
  rootDir,
  "src/lib/process-steps.generated.json",
);

const PLUMBING_MÉTIER_ID = "metier.plomberie-chauffage";

const SHEET_IDS = {
  summary: 739734511,
  forecast: 1209445802,
  actions: 593863816,
  team: 2022689011,
  ecosystem: 1876543210,
  calendar: 314159265,
  process: 271828182,
};

const contentTypeLabels = {
  implementation_action: "Action de mise en place",
  operational_step: "Étape opérationnelle",
  operating_rule: "Règle",
  recurring_control: "Contrôle récurrent",
};

const teamSituations = [
  "En poste",
  "À recruter",
  "À envisager",
  "Externalisé",
  "Non nécessaire",
];

const ecosystemCategories = [
  "Outil métier",
  "Professionnel",
  "Fournisseur",
  "Formalité",
  "Banque / assurance / financement",
  "Accompagnement",
];

const ecosystemStatuses = [
  "À étudier",
  "À comparer",
  "Choisi",
  "Déjà utilisé",
  "À remplacer",
  "Non nécessaire",
];

function cell(value) {
  if (typeof value === "number") {
    return { userEnteredValue: { numberValue: value } };
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "formulaValue" in value
  ) {
    return {
      userEnteredValue: { formulaValue: value.formulaValue },
    };
  }

  return { userEnteredValue: { stringValue: value } };
}

function row(values) {
  return { values: values.map(cell) };
}

function gridRange(
  sheetId,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
) {
  return {
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
  };
}

function clearValues(range) {
  return {
    repeatCell: {
      range,
      cell: {},
      fields: "userEnteredValue",
    },
  };
}

function writeValues(range, rows) {
  return {
    updateCells: {
      range,
      rows: rows.map(row),
      fields: "userEnteredValue",
    },
  };
}

function setDropdown(range, values) {
  return {
    setDataValidation: {
      range,
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: values.map((value) => ({ userEnteredValue: value })),
        },
        strict: true,
        showCustomUi: true,
      },
    },
  };
}

function clearValidation(range) {
  return {
    setDataValidation: {
      range,
    },
  };
}

function setColumnWidth(sheetId, startIndex, endIndex, pixelSize) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex,
        endIndex,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function buildData() {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const generatedSteps = JSON.parse(fs.readFileSync(stepsPath, "utf8"));
  const steps = generatedSteps.steps.filter(
    (step) => step["métierId"] === PLUMBING_MÉTIER_ID,
  );
  const processById = new Map(
    registry.processes.map((process) => [process.processId, process]),
  );
  const documentByProcessId = new Map(
    registry.documents.map((document) => [document.processId, document]),
  );

  const processIds = [...new Set(steps.map((step) => step.processId))];
  const missingProcesses = processIds.filter(
    (processId) => !processById.has(processId),
  );
  const missingDocuments = processIds.filter(
    (processId) => !documentByProcessId.has(processId),
  );

  if (
    steps.length !== 74 ||
    processIds.length !== 18 ||
    missingProcesses.length ||
    missingDocuments.length
  ) {
    throw new Error(
      [
        `Pilote invalide : ${processIds.length} processus, ${steps.length} contenus.`,
        `Processus manquants : ${missingProcesses.join(", ") || "aucun"}.`,
        `Supports manquants : ${missingDocuments.join(", ") || "aucun"}.`,
      ].join(" "),
    );
  }

  const processRows = steps.map((step) => {
    const process = processById.get(step.processId);
    const document = documentByProcessId.get(step.processId);
    const typeLabel = contentTypeLabels[step.contentType];

    if (!typeLabel) {
      throw new Error(
        `Type de contenu inconnu pour ${step.stepId}: ${step.contentType}.`,
      );
    }

    return [
      process.pillarLabel,
      process.process,
      typeLabel,
      step.step,
      step.defaultOwner,
      step.recurrence,
      document.name,
    ];
  });

  const countsByType = Object.fromEntries(
    Object.keys(contentTypeLabels).map((type) => [
      type,
      steps.filter((step) => step.contentType === type).length,
    ]),
  );

  return {
    processRows,
    processCount: processIds.length,
    contentCount: steps.length,
    countsByType,
  };
}

function buildRequests(data) {
  const processDataEndRowIndex = 7 + data.processRows.length;

  return [
    {
      updateSpreadsheetProperties: {
        properties: {
          title: "Système opérationnel - Plomberie & chauffage",
        },
        fields: "title",
      },
    },

    // Ordre cible : Synthèse, Actions, Process, Équipe, Prévisionnel,
    // Calendrier marketing, Écosystème.
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.actions, index: 1 },
        fields: "index",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.process, index: 2 },
        fields: "index",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.team, index: 3 },
        fields: "index",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.forecast, index: 4 },
        fields: "index",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.calendar, index: 5 },
        fields: "index",
      },
    },
    {
      updateSheetProperties: {
        properties: { sheetId: SHEET_IDS.ecosystem, index: 6 },
        fields: "index",
      },
    },

    // Synthèse : vocabulaire produit direct et cohérent.
    writeValues(
      gridRange(SHEET_IDS.summary, 0, 2, 0, 1),
      [
        ["PLOMBERIE & CHAUFFAGE - SYSTÈME OPÉRATIONNEL"],
        [
          "Commencez par les Actions, puis utilisez les onglets Process, Équipe, Prévisionnel financier, Calendrier marketing et Écosystème.",
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.summary, 13, 14, 0, 1),
      [["PARAMÈTRES DU SYSTÈME - SAISIE UTILISATEUR"]],
    ),

    // Actions : les 14 actions seront injectées dans le lot dédié.
    writeValues(
      gridRange(SHEET_IDS.actions, 0, 3, 2, 3),
      [
        ["ACTIONS - PLOMBERIE & CHAUFFAGE"],
        [
          "Planifiez ici les actions de mise en place issues de vos process.",
        ],
        [
          {
            formulaValue:
              '=HYPERLINK("#gid=739734511";"← Retour à la synthèse")',
          },
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 4, 5, 0, 12),
      [[
        "ID",
        "Pilier",
        "Process",
        "Action à mettre en place",
        "Responsable",
        "Support",
        "Priorité",
        "Début",
        "Échéance",
        "Statut",
        "Résultat attendu",
        "Notes",
      ]],
    ),
    setDropdown(
      gridRange(SHEET_IDS.actions, 5, 498, 9, 10),
      ["À planifier", "À faire", "En cours", "Terminée", "Reportée"],
    ),

    // Process : passage du brouillon à 39 lignes au pilote validé à 74 contenus.
    {
      appendDimension: {
        sheetId: SHEET_IDS.process,
        dimension: "COLUMNS",
        length: 2,
      },
    },
    {
      unmergeCells: {
        range: gridRange(SHEET_IDS.process, 0, 2, 0, 7),
      },
    },
    {
      mergeCells: {
        range: gridRange(SHEET_IDS.process, 0, 1, 0, 7),
        mergeType: "MERGE_ALL",
      },
    },
    {
      mergeCells: {
        range: gridRange(SHEET_IDS.process, 1, 2, 0, 7),
        mergeType: "MERGE_ALL",
      },
    },
    {
      copyPaste: {
        source: gridRange(SHEET_IDS.process, 0, 200, 3, 5),
        destination: gridRange(SHEET_IDS.process, 0, 200, 5, 7),
        pasteType: "PASTE_FORMAT",
        pasteOrientation: "NORMAL",
      },
    },
    {
      copyPaste: {
        source: gridRange(SHEET_IDS.process, 7, 8, 0, 7),
        destination: gridRange(
          SHEET_IDS.process,
          7,
          processDataEndRowIndex,
          0,
          7,
        ),
        pasteType: "PASTE_FORMAT",
        pasteOrientation: "NORMAL",
      },
    },
    clearValues(gridRange(SHEET_IDS.process, 0, 200, 0, 7)),
    writeValues(
      gridRange(SHEET_IDS.process, 0, 3, 0, 1),
      [
        ["PROCESS - PLOMBERIE & CHAUFFAGE"],
        [
          "Les 18 process du métier, détaillés en actions, étapes, règles et contrôles concrets.",
        ],
        [
          {
            formulaValue:
              '=HYPERLINK("#gid=739734511";"← Retour à la synthèse")',
          },
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.process, 3, 5, 0, 6),
      [
        [
          "Process",
          "Contenus",
          "À mettre en place",
          "Étapes",
          "Règles",
          "Contrôles",
        ],
        [
          data.processCount,
          data.contentCount,
          data.countsByType.implementation_action,
          data.countsByType.operational_step,
          data.countsByType.operating_rule,
          data.countsByType.recurring_control,
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.process, 6, 7, 0, 7),
      [[
        "Pilier",
        "Process",
        "Type de contenu",
        "Contenu concret",
        "Responsable recommandé",
        "Récurrence",
        "Support",
      ]],
    ),
    writeValues(
      gridRange(
        SHEET_IDS.process,
        7,
        processDataEndRowIndex,
        0,
        7,
      ),
      data.processRows,
    ),
    clearValidation(gridRange(SHEET_IDS.process, 7, 200, 0, 7)),
    {
      repeatCell: {
        range: gridRange(
          SHEET_IDS.process,
          7,
          processDataEndRowIndex,
          0,
          7,
        ),
        cell: {
          userEnteredFormat: {
            wrapStrategy: "WRAP",
            verticalAlignment: "TOP",
          },
        },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    },
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: SHEET_IDS.process,
          dimension: "ROWS",
          startIndex: 7,
          endIndex: processDataEndRowIndex,
        },
      },
    },
    setColumnWidth(SHEET_IDS.process, 0, 1, 160),
    setColumnWidth(SHEET_IDS.process, 1, 2, 260),
    setColumnWidth(SHEET_IDS.process, 2, 3, 175),
    setColumnWidth(SHEET_IDS.process, 3, 4, 420),
    setColumnWidth(SHEET_IDS.process, 4, 5, 220),
    setColumnWidth(SHEET_IDS.process, 5, 6, 190),
    setColumnWidth(SHEET_IDS.process, 6, 7, 260),

    // Équipe : un seul tableau, les rôles futurs sont des lignes ordinaires.
    clearValues(gridRange(SHEET_IDS.team, 0, 201, 0, 8)),
    writeValues(
      gridRange(SHEET_IDS.team, 0, 3, 0, 1),
      [
        ["ÉQUIPE - PLOMBERIE & CHAUFFAGE"],
        [
          "Renseignez les rôles actuels et futurs dans un seul tableau, une ligne par poste.",
        ],
        [
          {
            formulaValue:
              '=HYPERLINK("#gid=739734511";"← Retour à la synthèse")',
          },
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.team, 4, 5, 0, 8),
      [[
        "Poste / rôle",
        "Personne",
        "Situation",
        "Responsable hiérarchique",
        "Responsabilité principale",
        "Process associés",
        "Date cible",
        "Notes",
      ]],
    ),
    {
      updateDimensionProperties: {
        range: {
          sheetId: SHEET_IDS.team,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: 8,
        },
        properties: { hiddenByUser: false },
        fields: "hiddenByUser",
      },
    },
    clearValidation(gridRange(SHEET_IDS.team, 5, 201, 0, 8)),
    setDropdown(
      gridRange(SHEET_IDS.team, 5, 201, 2, 3),
      teamSituations,
    ),
    {
      setDataValidation: {
        range: gridRange(SHEET_IDS.team, 5, 201, 6, 7),
        rule: {
          condition: { type: "DATE_IS_VALID" },
          strict: false,
          showCustomUi: true,
        },
      },
    },
    {
      repeatCell: {
        range: gridRange(SHEET_IDS.team, 5, 201, 6, 7),
        cell: {
          userEnteredFormat: {
            numberFormat: {
              type: "DATE",
              pattern: "dd/mm/yyyy",
            },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    setColumnWidth(SHEET_IDS.team, 0, 1, 175),
    setColumnWidth(SHEET_IDS.team, 1, 2, 180),
    setColumnWidth(SHEET_IDS.team, 2, 3, 140),
    setColumnWidth(SHEET_IDS.team, 3, 4, 190),
    setColumnWidth(SHEET_IDS.team, 4, 6, 260),
    setColumnWidth(SHEET_IDS.team, 6, 7, 125),
    setColumnWidth(SHEET_IDS.team, 7, 8, 260),

    // Prévisionnel et calendrier : contenus conservés, titres harmonisés.
    writeValues(
      gridRange(SHEET_IDS.forecast, 0, 1, 0, 1),
      [["PLOMBERIE & CHAUFFAGE - PRÉVISIONNEL FINANCIER"]],
    ),
    writeValues(
      gridRange(SHEET_IDS.calendar, 0, 1, 0, 1),
      [["CALENDRIER MARKETING - PLOMBERIE & CHAUFFAGE"]],
    ),

    // Écosystème : un seul tableau et l'onglet reste volontairement en dernier.
    {
      appendDimension: {
        sheetId: SHEET_IDS.ecosystem,
        dimension: "COLUMNS",
        length: 1,
      },
    },
    {
      unmergeCells: {
        range: gridRange(SHEET_IDS.ecosystem, 0, 2, 0, 9),
      },
    },
    {
      mergeCells: {
        range: gridRange(SHEET_IDS.ecosystem, 0, 1, 0, 9),
        mergeType: "MERGE_ALL",
      },
    },
    {
      mergeCells: {
        range: gridRange(SHEET_IDS.ecosystem, 1, 2, 0, 9),
        mergeType: "MERGE_ALL",
      },
    },
    {
      copyPaste: {
        source: gridRange(SHEET_IDS.ecosystem, 0, 120, 7, 8),
        destination: gridRange(SHEET_IDS.ecosystem, 0, 120, 8, 9),
        pasteType: "PASTE_FORMAT",
        pasteOrientation: "NORMAL",
      },
    },
    clearValues(gridRange(SHEET_IDS.ecosystem, 0, 120, 0, 9)),
    writeValues(
      gridRange(SHEET_IDS.ecosystem, 0, 3, 0, 1),
      [
        ["ÉCOSYSTÈME - PLOMBERIE & CHAUFFAGE"],
        [
          "Centralisez ici les outils, professionnels, formalités, fournisseurs et services utiles.",
        ],
        [
          {
            formulaValue:
              '=HYPERLINK("#gid=739734511";"← Retour à la synthèse")',
          },
        ],
      ],
    ),
    writeValues(
      gridRange(SHEET_IDS.ecosystem, 4, 5, 0, 9),
      [[
        "Catégorie",
        "Besoin",
        "Solution recommandée",
        "Solution retenue",
        "Statut",
        "Coût",
        "Échéance",
        "Lien",
        "Notes",
      ]],
    ),
    clearValidation(gridRange(SHEET_IDS.ecosystem, 5, 120, 0, 9)),
    setDropdown(
      gridRange(SHEET_IDS.ecosystem, 5, 120, 0, 1),
      ecosystemCategories,
    ),
    setDropdown(
      gridRange(SHEET_IDS.ecosystem, 5, 120, 4, 5),
      ecosystemStatuses,
    ),
    {
      setDataValidation: {
        range: gridRange(SHEET_IDS.ecosystem, 5, 120, 6, 7),
        rule: {
          condition: { type: "DATE_IS_VALID" },
          strict: false,
          showCustomUi: true,
        },
      },
    },
    {
      repeatCell: {
        range: gridRange(SHEET_IDS.ecosystem, 5, 120, 6, 7),
        cell: {
          userEnteredFormat: {
            numberFormat: {
              type: "DATE",
              pattern: "dd/mm/yyyy",
            },
          },
        },
        fields: "userEnteredFormat.numberFormat",
      },
    },
    setColumnWidth(SHEET_IDS.ecosystem, 0, 1, 220),
    setColumnWidth(SHEET_IDS.ecosystem, 1, 2, 250),
    setColumnWidth(SHEET_IDS.ecosystem, 2, 4, 260),
    setColumnWidth(SHEET_IDS.ecosystem, 4, 5, 150),
    setColumnWidth(SHEET_IDS.ecosystem, 5, 6, 120),
    setColumnWidth(SHEET_IDS.ecosystem, 6, 7, 125),
    setColumnWidth(SHEET_IDS.ecosystem, 7, 9, 260),
  ];
}

const data = buildData();
const requests = buildRequests(data);
const args = new Set(process.argv.slice(2));

if (args.has("--sheet-batch-json")) {
  process.stdout.write(JSON.stringify({ requests }));
} else {
  console.log(
    JSON.stringify(
      {
        processCount: data.processCount,
        contentCount: data.contentCount,
        countsByType: data.countsByType,
        requestCount: requests.length,
      },
      null,
      2,
    ),
  );
}
