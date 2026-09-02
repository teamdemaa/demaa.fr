import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  buildSystemProcessesPdf,
  buildSystemProcessesPdfFilename,
} from "@/lib/system-processes-pdf.server";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail, type SystemeRoutine } from "@/lib/systeme-catalog";
import { getSystemProcessGuideDetails } from "@/lib/system-process-guide-details";
import { orderSystemeRoutinesForDisplay } from "@/lib/system-process-order";

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
      "Processus métier - Cabinet comptable",
    );
    expect(document.getAuthor()).toBe("Demaa");
  });

  it("builds a stable PDF attachment filename", () => {
    expect(buildSystemProcessesPdfFilename("Cabinet-Comptable")).toBe(
      "processus-metier-cabinet-comptable.pdf",
    );
  });

  it("includes the detailed example in the complete document", async () => {
    const enterprise = enterpriseCatalog.find(({ slug }) => slug === "cabinet-comptable")!;
    const detail = buildSystemeDetail(enterprise)!;
    const orderedRoutines = orderSystemeRoutinesForDisplay(
      detail.routines,
      detail.cards,
      enterprise.slug,
    );
    const processGuideDetails = getSystemProcessGuideDetails(
      enterprise.slug,
      orderedRoutines,
    );
    expect(processGuideDetails).toHaveLength(1);

    const [summaryBytes, completeBytes] = await Promise.all([
      buildSystemProcessesPdf({
        routines: orderedRoutines,
        systemName: enterprise.name,
      }),
      buildSystemProcessesPdf({
        processGuideDetails,
        routines: orderedRoutines,
        systemName: enterprise.name,
      }),
    ]);
    const [summaryDocument, completeDocument] = await Promise.all([
      PDFDocument.load(summaryBytes),
      PDFDocument.load(completeBytes),
    ]);

    expect(completeBytes.byteLength).toBeGreaterThan(summaryBytes.byteLength);
    expect(completeDocument.getPageCount()).toBeGreaterThan(
      summaryDocument.getPageCount(),
    );
  });
});
