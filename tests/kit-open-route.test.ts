import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { hasEditableOperationalSystemAssetMock } = vi.hoisted(() => ({
  hasEditableOperationalSystemAssetMock: vi.fn(),
}));

vi.mock("@/lib/editable-operational-system-assets.server", () => ({
  hasEditableOperationalSystemAsset: hasEditableOperationalSystemAssetMock,
}));

import { GET } from "@/app/api/kits/[slug]/open/route";

describe("deprecated kit open route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasEditableOperationalSystemAssetMock.mockReturnValue(false);
  });

  it("never redirects a published system to a private copy", async () => {
    hasEditableOperationalSystemAssetMock.mockReturnValueOnce(true);

    const response = await GET(
      new Request("https://demaa.fr/api/kits/plomberie-chauffage/open"),
      { params: Promise.resolve({ slug: "plomberie-chauffage" }) },
    );

    expect(response.status).toBe(410);
    expect(response.headers.get("location")).toBeNull();
    expect(await response.json()).toEqual({
      error: "Ce système est envoyé gratuitement par e-mail.",
    });
  });

  it("rejects an unknown kit", async () => {
    const response = await GET(
      new Request("https://demaa.fr/api/kits/inconnu/open"),
      { params: Promise.resolve({ slug: "inconnu" }) },
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });

  it("rejects an invalid slug", async () => {
    const response = await GET(
      new Request("https://demaa.fr/api/kits/invalide/open"),
      { params: Promise.resolve({ slug: "../invalide" }) },
    );

    expect(response.status).toBe(400);
  });
});
