import { PDFDocument } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/system-detail-page", () => ({
  getSystemDetailPageData: vi.fn(async (slug: string) => {
    if (slug !== "cabinet-davocat") return null;

    return {
      detail: {
        systeme: {
          cards: [],
          routines: [
            {
              bullets: [
                "Centraliser les demandes reçues.",
                "Attribuer chaque dossier à la bonne personne.",
              ],
              cadence: "À chaque nouvelle demande",
              routineId: "routine.cabinet-davocat.ouvrir-dossier",
              title: "Ouvrir et organiser un nouveau dossier",
            },
          ],
        },
      },
      system: { name: "Cabinet d’avocat" },
    };
  }),
}));

vi.mock("@/lib/system-process-order", () => ({
  orderSystemeRoutinesForDisplay: vi.fn((routines) => routines),
}));

vi.mock("@/lib/system-process-guide-details", () => ({
  getSystemProcessGuideDetails: vi.fn(() => []),
}));

describe("system processes PDF download route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("DEMAA_FORCE_LOCAL_DATA", "true");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("downloads a complete PDF for a valid system", async () => {
    const { GET } = await import(
      "@/app/api/system-processes/pdf/[slug]/route"
    );
    const response = await GET(
      new Request(
        "http://localhost/api/system-processes/pdf/cabinet-davocat",
      ),
      { params: Promise.resolve({ slug: "cabinet-davocat" }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="processus-metier-cabinet-davocat.pdf"',
    );

    const bytes = new Uint8Array(await response.arrayBuffer());
    const document = await PDFDocument.load(bytes);
    expect(bytes.byteLength).toBeGreaterThan(1_000);
    expect(document.getTitle()).toBe("Processus métier - Cabinet d’avocat");
  });

  it("rejects invalid and unknown system slugs", async () => {
    const { GET } = await import(
      "@/app/api/system-processes/pdf/[slug]/route"
    );
    const invalid = await GET(
      new Request("http://localhost/api/system-processes/pdf/INVALID"),
      { params: Promise.resolve({ slug: "INVALID" }) },
    );
    const unknown = await GET(
      new Request("http://localhost/api/system-processes/pdf/metier-inconnu"),
      { params: Promise.resolve({ slug: "metier-inconnu" }) },
    );

    expect(invalid.status).toBe(400);
    expect(unknown.status).toBe(404);
  });
});
