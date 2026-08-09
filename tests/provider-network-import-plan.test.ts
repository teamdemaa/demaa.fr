import { describe, expect, it } from "vitest";
import { buildProviderNetworkImportPlan } from "@/lib/provider-network-import-plan";

describe("provider network import plan", () => {
  it("shares one stable plan between the dry-run and the guarded importer", () => {
    const plan = buildProviderNetworkImportPlan();

    expect(plan.expertises).toHaveLength(23);
    expect(plan.expertisePlacements).toHaveLength(1);
    expect(plan.opportunities).toHaveLength(3);
    expect(plan.writes).toHaveLength(27);
    expect(plan.expertisePlacements).not.toContainEqual(
      expect.objectContaining({ expertiseId: "chartered-accountant" }),
    );
    expect(plan.planFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });
});
