import { describe, expect, it } from "vitest";

import { resolveFirebaseSolutionDraftImportTarget } from "@/lib/firebase-solution-registry-draft-import-gate";

describe("Firebase Solutions DRAFT import gate", () => {
  it("uses a dedicated Production DRAFT gate", () => {
    expect(resolveFirebaseSolutionDraftImportTarget({
      arguments_: [
        "--target=production",
        "--apply-production-draft-revision",
        "--confirm-project=demaa-dde32",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN: "ephemeral",
      },
    })).toMatchObject({
      isProduction: true,
      projectId: "demaa-dde32",
      target: "production",
    });
  });

  it("refuses the active-revision gate and a non-canonical Production project", () => {
    expect(() => resolveFirebaseSolutionDraftImportTarget({
      arguments_: [
        "--target=production",
        "--apply-production-active-revision",
        "--confirm-project=demaa-dde32",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "demaa-dde32",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "demaa-dde32",
        FIREBASE_IMPORT_ACCESS_TOKEN: "ephemeral",
      },
    })).toThrow("--apply-production-draft-revision");
    expect(() => resolveFirebaseSolutionDraftImportTarget({
      arguments_: [
        "--target=production",
        "--apply-production-draft-revision",
        "--confirm-project=other-production",
      ],
      environment: {
        FIREBASE_PROJECT_ID: "other-production",
        FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID: "other-production",
        FIREBASE_IMPORT_ACCESS_TOKEN: "ephemeral",
      },
    })).toThrow("canonical Demaa project");
  });
});
