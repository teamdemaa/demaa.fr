import { describe, expect, it } from "vitest";
import {
  plumbingPilotContentByProcessId,
  plumbingPilotContentTypes,
  plumbingPilotProcessDefinitionsById,
  plumbingPilotStepsByProcessId,
} from "../src/lib/plumbing-process-pilot";
import processRegistry from "../src/lib/process-registry.generated.json";
import processSteps from "../src/lib/process-steps.generated.json";

describe("plumbing process pilot", () => {
  it("classifies all 74 items across the 18 plumbing processes", () => {
    const processes = Object.entries(plumbingPilotContentByProcessId);
    const items = processes.flatMap(([, processItems]) => processItems);

    expect(processes).toHaveLength(18);
    expect(items).toHaveLength(74);

    for (const item of items) {
      expect(plumbingPilotContentTypes).toContain(item.type);
      expect(item.label.trim()).not.toBe("");
    }
  });

  it("keeps the current UI labels in the same order", () => {
    for (const [processId, items] of Object.entries(
      plumbingPilotContentByProcessId,
    )) {
      expect(plumbingPilotStepsByProcessId[processId]).toEqual(
        items.map((item) => item.label),
      );
    }
  });

  it("contains every content type needed by the target system", () => {
    const items = Object.values(plumbingPilotContentByProcessId).flat();
    const usedTypes = new Set(items.map((item) => item.type));
    const countsByType = Object.fromEntries(
      plumbingPilotContentTypes.map((type) => [
        type,
        items.filter((item) => item.type === type).length,
      ]),
    );

    expect(usedTypes).toEqual(new Set(plumbingPilotContentTypes));
    expect(countsByType).toEqual({
      implementation_action: 14,
      operational_step: 33,
      operating_rule: 8,
      recurring_control: 19,
    });
  });

  it("covers the exact 18 process identifiers from the BTP registry", () => {
    const plumbing = processRegistry.métiers.find(
      (metier) => metier.slug === "plomberie-chauffage",
    );
    const registryProcessIds = processRegistry.processes
      .filter((process) => process.familyId === plumbing?.familyId)
      .map((process) => process.processId)
      .sort();
    const pilotProcessIds = Object.keys(
      plumbingPilotContentByProcessId,
    ).sort();

    expect(plumbing).toBeDefined();
    expect(pilotProcessIds).toEqual(registryProcessIds);
    expect(
      Object.keys(plumbingPilotProcessDefinitionsById).sort(),
    ).toEqual(registryProcessIds);
  });

  it("gives every process an executable operating frame", () => {
    for (const definition of Object.values(
      plumbingPilotProcessDefinitionsById,
    )) {
      expect(definition.objective.length).toBeGreaterThan(30);
      expect(definition.trigger.length).toBeGreaterThan(20);
      expect(definition.expectedResult.length).toBeGreaterThan(30);
      expect(definition.defaultOwner.trim()).not.toBe("");
      expect(definition.cadence.trim()).not.toBe("");
    }
  });

  it("does not reintroduce generic support placeholders", () => {
    const labels = Object.values(plumbingPilotContentByProcessId)
      .flat()
      .map((item) => item.label);

    expect(
      labels.some((label) =>
        /mettre en place et tenir à jour le support associé/i.test(label),
      ),
    ).toBe(false);
  });

  it("matches the generated source-of-truth mirror after synchronization", () => {
    const generatedPlumbingSteps = processSteps.steps.filter(
      (step) => step.métierId === "metier.plomberie-chauffage",
    );
    const generatedLabels = generatedPlumbingSteps.map((step) => step.step);
    const pilotItems = Object.values(plumbingPilotContentByProcessId).flat();

    expect(generatedPlumbingSteps).toHaveLength(74);
    expect(new Set(generatedLabels)).toEqual(
      new Set(pilotItems.map((item) => item.label)),
    );
    expect(
      new Set(generatedPlumbingSteps.map((step) => step.contentType)),
    ).toEqual(new Set(plumbingPilotContentTypes));
  });
});
