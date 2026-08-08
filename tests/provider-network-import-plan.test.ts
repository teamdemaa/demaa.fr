import { describe, expect, it } from "vitest";
import { buildProviderNetworkImportPlan } from "@/lib/provider-network-import-plan";

describe("provider network import plan", () => {
  it("shares one stable plan between the dry-run and the guarded importer", () => {
    const plan = buildProviderNetworkImportPlan();

    expect(plan.expertises).toHaveLength(23);
    expect(plan.expertisePlacements).toHaveLength(115);
    expect(plan.opportunities).toHaveLength(3);
    expect(plan.writes).toHaveLength(141);
    expect(plan.planFingerprint).toBe(
      "695c6d0c704b83b91fea456708bd6b32e82d866404beb2e993e3ae444b391a15",
    );
  });
});
