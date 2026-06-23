import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");
  return { ...actual, enforceRateLimit };
});

describe("GET /api/company-search", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
  });

  it("returns empty results for too-short queries", async () => {
    const { GET } = await import("@/app/api/company-search/route");
    const response = await GET(new Request("https://demaa.fr/api/company-search?q=a"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ results: [] });
  });

  it("maps upstream results into the public response shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            results: [
              {
                nom_complet: "Demaa SAS",
                siren: "123456789",
                siege: {
                  adresse: "10 rue Exemple",
                  code_postal: "75001",
                  libelle_commune: "Paris",
                  siret: "12345678900012",
                },
                activite_principale: "Conseil",
                categorie_entreprise: "PME",
                nature_juridique: "SAS",
              },
            ],
          }),
          { status: 200 }
        )
      )
    );
    const { GET } = await import("@/app/api/company-search/route");
    const response = await GET(new Request("https://demaa.fr/api/company-search?q=demaa"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      results: [
        {
          name: "Demaa SAS",
          siren: "123456789",
          siret: "12345678900012",
          address: "10 rue Exemple",
          postalCode: "75001",
          city: "Paris",
          activity: "Conseil",
          legalForm: "SAS",
          category: "PME",
        },
      ],
    });
  });

  it("falls back cleanly when the upstream service fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("down", { status: 500 })));
    const { GET } = await import("@/app/api/company-search/route");
    const response = await GET(new Request("https://demaa.fr/api/company-search?q=demaa"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "La recherche d'entreprise est temporairement indisponible. Vous pouvez continuer en saisie libre.",
      results: [],
    });
  });
});
