export const operationalContentTypes = [
  "implementation_action",
  "operational_step",
  "operating_rule",
  "recurring_control",
] as const;

export type OperationalContentType =
  (typeof operationalContentTypes)[number];

export type IndustrializedContentItem = {
  type: OperationalContentType;
  label: string;
};

export type IndustrializedProcessDefinition = {
  objective: string;
  trigger: string;
  expectedResult: string;
  defaultOwner: string;
  cadence: string;
};

export type ProcessDraft = {
  definitionsById: Record<string, IndustrializedProcessDefinition>;
  contentByProcessId: Record<string, IndustrializedContentItem[]>;
};

export type ProcessContentPatch = {
  processId: string;
  contentIndex: number;
  label: string;
};

export type ProcessLayer = {
  id: string;
  contentPatches?: readonly ProcessContentPatch[];
  definitionOverrides?: Record<
    string,
    Partial<IndustrializedProcessDefinition>
  >;
};

export type ProcessDraftAudit = {
  contentCount: number;
  contentTypes: OperationalContentType[];
  definitionCount: number;
  errors: string[];
  processCount: number;
};

const definitionFields = [
  "objective",
  "trigger",
  "expectedResult",
  "defaultOwner",
  "cadence",
] as const satisfies readonly (keyof IndustrializedProcessDefinition)[];

function cloneDraft(draft: ProcessDraft): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      Object.entries(draft.definitionsById).map(([processId, definition]) => [
        processId,
        { ...definition },
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      Object.entries(draft.contentByProcessId).map(([processId, items]) => [
        processId,
        items.map((item) => ({ ...item })),
      ]),
    ),
  };
}

export function composeProcessDraft(
  baseDraft: ProcessDraft,
  layers: readonly ProcessLayer[],
): ProcessDraft {
  const draft = cloneDraft(baseDraft);

  for (const layer of layers) {
    for (const [processId, override] of Object.entries(
      layer.definitionOverrides ?? {},
    )) {
      const definition = draft.definitionsById[processId];

      if (!definition) {
        throw new Error(
          `Couche ${layer.id}: processus inconnu dans les définitions (${processId}).`,
        );
      }

      draft.definitionsById[processId] = {
        ...definition,
        ...override,
      };
    }

    for (const patch of layer.contentPatches ?? []) {
      const content = draft.contentByProcessId[patch.processId];

      if (!content) {
        throw new Error(
          `Couche ${layer.id}: processus inconnu dans les contenus (${patch.processId}).`,
        );
      }

      if (!content[patch.contentIndex]) {
        throw new Error(
          `Couche ${layer.id}: contenu ${patch.contentIndex} absent pour ${patch.processId}.`,
        );
      }

      content[patch.contentIndex] = {
        ...content[patch.contentIndex],
        label: patch.label,
      };
    }
  }

  return draft;
}

export function auditProcessDraft(
  draft: ProcessDraft,
  expected?: {
    contentCount?: number;
    processCount?: number;
  },
): ProcessDraftAudit {
  const errors: string[] = [];
  const definitionIds = Object.keys(draft.definitionsById);
  const contentEntries = Object.entries(draft.contentByProcessId);
  const contentTypes = new Set<OperationalContentType>();
  let contentCount = 0;

  for (const processId of definitionIds) {
    if (!draft.contentByProcessId[processId]?.length) {
      errors.push(`Aucun contenu pour ${processId}.`);
    }

    const definition = draft.definitionsById[processId];

    for (const field of definitionFields) {
      if (!definition[field].trim()) {
        errors.push(`Définition vide (${field}) pour ${processId}.`);
      }
    }
  }

  for (const [processId, items] of contentEntries) {
    if (!draft.definitionsById[processId]) {
      errors.push(`Aucune définition pour ${processId}.`);
    }

    for (const item of items) {
      contentCount += 1;
      contentTypes.add(item.type);

      if (!item.label.trim()) {
        errors.push(`Libellé vide dans ${processId}.`);
      }

      if (!operationalContentTypes.includes(item.type)) {
        errors.push(`Type invalide dans ${processId}: ${item.type}.`);
      }
    }
  }

  if (
    expected?.processCount !== undefined &&
    contentEntries.length !== expected.processCount
  ) {
    errors.push(
      `${contentEntries.length} processus générés, ${expected.processCount} attendus.`,
    );
  }

  if (definitionIds.length !== contentEntries.length) {
    errors.push(
      `${definitionIds.length} définitions pour ${contentEntries.length} processus de contenu.`,
    );
  }

  if (
    expected?.processCount !== undefined &&
    definitionIds.length !== expected.processCount
  ) {
    errors.push(
      `${definitionIds.length} définitions générées, ${expected.processCount} attendues.`,
    );
  }

  if (
    expected?.contentCount !== undefined &&
    contentCount !== expected.contentCount
  ) {
    errors.push(
      `${contentCount} contenus générés, ${expected.contentCount} attendus.`,
    );
  }

  return {
    contentCount,
    contentTypes: [...contentTypes],
    definitionCount: definitionIds.length,
    errors,
    processCount: contentEntries.length,
  };
}
