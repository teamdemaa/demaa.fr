import { describe, expect, it } from "vitest";

import { resolvePlacementRetirementGate } from "@/lib/provider-network-placement-retirement-gate";

const productionEnvironment = {
  FIREBASE_PROJECT_ID: "demaa-dde32",
  FIREBASE_PROVIDER_NETWORK_PRODUCTION_PROJECT_ID: "demaa-dde32",
  FIREBASE_IMPORT_ACCESS_TOKEN: "ephemeral",
};

describe("provider placement retirement remote gate", () => {
  it("allows a read-only Production snapshot with explicit project confirmation", () => {
    expect(resolvePlacementRetirementGate({
      arguments_: ["--target=production", "--confirm-project=demaa-dde32"],
      environment: productionEnvironment,
      mode: "snapshot",
    })).toMatchObject({ projectId: "demaa-dde32", isProduction: true });
  });

  it("requires different explicit gates for removal and rollback", () => {
    expect(() => resolvePlacementRetirementGate({
      arguments_: ["--target=production", "--confirm-project=demaa-dde32"],
      environment: productionEnvironment,
      mode: "remove",
    })).toThrow("--apply-provider-placement-removal-production");
    expect(() => resolvePlacementRetirementGate({
      arguments_: [
        "--target=production",
        "--confirm-project=demaa-dde32",
        "--apply-provider-placement-removal-production",
      ],
      environment: productionEnvironment,
      mode: "rollback",
    })).toThrow("--apply-provider-placement-rollback-production");
  });

  it("refuses a Preview identity pointed at Production", () => {
    expect(() => resolvePlacementRetirementGate({
      arguments_: ["--confirm-project=demaa-dde32"],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_PROVIDER_NETWORK_PREVIEW_PROJECT_ID: "demaa-dde32",
        FIREBASE_IMPORT_ACCESS_TOKEN: "ephemeral",
      },
      mode: "snapshot",
    })).toThrow("isolée");
  });
});
