import { describe, expect, it } from "vitest";
import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import enterprisePayload from "@/lib/enterprise-annuaire.json";

describe("public operational system DTO", () => {
  it("never serializes document source or copy URLs to client components", () => {
    const plumbing = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "plomberie-chauffage",
    );

    expect(plumbing).toBeDefined();

    const detail = buildSystemeDetail(plumbing as EnterpriseDefinition);
    const serialized = JSON.stringify(detail);

    expect(serialized).not.toContain("documentUrl");
    expect(serialized).not.toContain("documentCopyUrl");
    expect(serialized).not.toContain("docs.google.com");
  });

  it("projects the pilot routines without exposing support links", () => {
    const building = enterprisePayload.enterprises.find(
      (enterprise) => enterprise.slug === "batiment",
    );
    const detail = buildSystemeDetail(building as EnterpriseDefinition);

    expect(detail?.routines).toHaveLength(8);
    expect(
      detail?.routines?.every(
        (routine) =>
          routine.bullets.length >= 2 &&
          routine.bullets.length <= 4 &&
          routine.support === null,
      ),
    ).toBe(true);
    expect(JSON.stringify(detail?.routines)).not.toContain("docs.google.com");
  });
});
