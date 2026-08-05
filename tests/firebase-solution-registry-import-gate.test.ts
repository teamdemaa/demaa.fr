import { describe, expect, it } from "vitest";

import { resolveFirebaseSolutionRegistryImportTarget } from "@/lib/firebase-solution-registry-import-gate";

describe("Firebase Solutions remote import gate", () => {
  it("accepts the isolated Preview project only with its explicit gate", () => {
    expect(resolveFirebaseSolutionRegistryImportTarget({
      arguments_: [
        "--apply-active-revision",
        "--confirm-project=demaa-preview-2026",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-preview-2026",
        FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN: "ephemeral",
        FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID: "demaa-preview-2026",
      },
    })).toMatchObject({
      isProduction: false,
      projectId: "demaa-preview-2026",
      target: "preview",
    });
  });

  it("accepts Production only with its separate gate and canonical project", () => {
    expect(resolveFirebaseSolutionRegistryImportTarget({
      arguments_: [
        "--target=production",
        "--apply-production-active-revision",
        "--confirm-project=demaa-dde32",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN: "ephemeral",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "demaa-dde32",
      },
    })).toMatchObject({
      isProduction: true,
      projectId: "demaa-dde32",
      target: "production",
    });
  });

  it("refuses to use the Preview gate against Production", () => {
    expect(() => resolveFirebaseSolutionRegistryImportTarget({
      arguments_: [
        "--apply-active-revision",
        "--confirm-project=demaa-dde32",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN: "ephemeral",
        FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID: "demaa-dde32",
      },
    })).toThrow("not safely isolated");
  });

  it("refuses Production without the Production apply gate", () => {
    expect(() => resolveFirebaseSolutionRegistryImportTarget({
      arguments_: [
        "--target=production",
        "--confirm-project=demaa-dde32",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN: "ephemeral",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "demaa-dde32",
      },
    })).toThrow("apply gate");
  });

  it("refuses a non-canonical Production project", () => {
    expect(() => resolveFirebaseSolutionRegistryImportTarget({
      arguments_: [
        "--target=production",
        "--apply-production-active-revision",
        "--confirm-project=another-production",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "another-production",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN: "ephemeral",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "another-production",
      },
    })).toThrow("canonical Demaa project");
  });
});
