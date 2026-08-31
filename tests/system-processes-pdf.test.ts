import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  buildSystemProcessesPdf,
  buildSystemProcessesPdfFilename,
} from "@/lib/system-processes-pdf.server";
import type { SystemeRoutine } from "@/lib/systeme-catalog";

const routines: SystemeRoutine[] = [
  {
    bullets: [
      "Vérifier les pièces reçues et identifier les documents manquants.",
      "Relancer le client avec une liste précise des éléments attendus.",
      "Valider le dossier avant de lancer le traitement.",
    ],
    cadence: "À chaque nouveau dossier",
    routineId: "collecte-pieces",
    support: null,
    title: "Collecter et contrôler les pièces du dossier",
  },
];

describe("system processes PDF", () => {
  it("generates a valid, titled PDF checklist", async () => {
    const bytes = await buildSystemProcessesPdf({
      routines,
      systemName: "Cabinet comptable",
    });
    const document = await PDFDocument.load(bytes);

    expect(bytes.byteLength).toBeGreaterThan(1_000);
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(document.getTitle()).toBe(
      "Checklist des processus métier - Cabinet comptable",
    );
    expect(document.getAuthor()).toBe("Demaa");
  });

  it("builds a stable PDF attachment filename", () => {
    expect(buildSystemProcessesPdfFilename("Cabinet-Comptable")).toBe(
      "checklist-processus-cabinet-comptable.pdf",
    );
  });
});
