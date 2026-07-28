import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getEditableOperationalSystemCopyUrl,
  hasEditableOperationalSystemAsset,
} from "@/lib/editable-operational-system-assets.server";
import demoAssets from "@/lib/operational-system-demo-assets.generated.json";

const PRIVATE_REGISTRY_ENV_NAME =
  "OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON";
const knownSystemSlug = "plomberie-chauffage";

function buildPrivateRegistry() {
  return Object.fromEntries(
    Object.keys(demoAssets).map((slug, index) => [
      slug,
      `private${index.toString(36).padStart(24, "0")}`,
    ]),
  );
}

describe("editable operational system assets", () => {
  afterEach(() => {
    delete process.env[PRIVATE_REGISTRY_ENV_NAME];
  });

  it("recognizes published systems without exposing or requiring the private registry", () => {
    expect(hasEditableOperationalSystemAsset(knownSystemSlug)).toBe(true);
    expect(getEditableOperationalSystemCopyUrl(knownSystemSlug)).toBeNull();
    expect(hasEditableOperationalSystemAsset("inconnu")).toBe(false);
    expect(getEditableOperationalSystemCopyUrl("inconnu")).toBeNull();
  });

  it("resolves a copy URL from a validated server-only sheet identifier", () => {
    const privateRegistry = buildPrivateRegistry();
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify(privateRegistry);

    expect(getEditableOperationalSystemCopyUrl(knownSystemSlug)).toBe(
      `https://docs.google.com/spreadsheets/d/${privateRegistry[knownSystemSlug]}/copy`,
    );
  });

  it("rejects malformed or unpublished entries without echoing their value", () => {
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify({
      inconnu: "b".repeat(24),
    });

    expect(() => getEditableOperationalSystemCopyUrl(knownSystemSlug)).toThrow(
      "Le registre privé des copies est invalide.",
    );
  });
});
