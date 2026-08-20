import { describe, expect, it } from "vitest";
import {
  buildToolOutboundUrl,
  isToolSolutionResourceType,
} from "@/lib/tool-outbound-attribution";

describe("tool outbound attribution", () => {
  it("adds the controlled Demaa attribution without changing the catalog URL", () => {
    const rawUrl = "https://example.com/product";

    expect(buildToolOutboundUrl(rawUrl)).toBe(
      "https://example.com/product?utm_source=demaa&utm_medium=referral&utm_campaign=solutions",
    );
    expect(rawUrl).toBe("https://example.com/product");
  });

  it("preserves unrelated parameters and fragments", () => {
    expect(buildToolOutboundUrl(
      "https://example.com/product?plan=team&ref=official#pricing",
    )).toBe(
      "https://example.com/product?plan=team&ref=official&utm_source=demaa&utm_medium=referral&utm_campaign=solutions#pricing",
    );
  });

  it("overwrites and deduplicates existing UTM parameters", () => {
    const attributed = buildToolOutboundUrl(
      "https://example.com/?utm_source=old&utm_source=duplicate&utm_medium=email&utm_campaign=legacy",
    );
    const url = new URL(attributed!);

    expect(url.searchParams.getAll("utm_source")).toEqual(["demaa"]);
    expect(url.searchParams.getAll("utm_medium")).toEqual(["referral"]);
    expect(url.searchParams.getAll("utm_campaign")).toEqual(["solutions"]);
  });

  it("rejects internal, malformed, credentialed and unsafe destinations", () => {
    expect(buildToolOutboundUrl("/annuaire-outils/tiimora")).toBeNull();
    expect(buildToolOutboundUrl("https://demaa.co/annuaire-outils/tiimora")).toBeNull();
    expect(buildToolOutboundUrl("https://app.demaa.co/outils/tiimora")).toBeNull();
    expect(buildToolOutboundUrl("https://www.demaa.fr/outils/tiimora")).toBeNull();
    expect(buildToolOutboundUrl("https://demaa.co./outils/tiimora")).toBeNull();
    expect(buildToolOutboundUrl("not a URL")).toBeNull();
    expect(buildToolOutboundUrl("javascript:alert(1)")).toBeNull();
    expect(buildToolOutboundUrl("https://user:secret@example.com/")).toBeNull();
  });

  it("recognizes only tool resource types", () => {
    expect(isToolSolutionResourceType("tool")).toBe(true);
    expect(isToolSolutionResourceType("software")).toBe(true);
    expect(isToolSolutionResourceType("provider")).toBe(false);
    expect(isToolSolutionResourceType("aid")).toBe(false);
  });
});
