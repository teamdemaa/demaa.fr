"use client";

import { useEffect, useState } from "react";
import { ChevronDown, FileSpreadsheet, FileText, X } from "lucide-react";
import { getSystemDocumentAsset } from "@/lib/system-document-assets";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemeTabContentProps = {
  systemName: string;
  systemSlug: string;
  systeme: SystemeDetail | null | undefined;
  includePilotingDocument?: boolean;
  onRequestSystemComplete?: () => void;
};

export type SelectedSystemDocument = {
  process: string;
  document: string;
};

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvTable(content: string) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (!lines.length) {
    return { headers: [] as string[], rows: [] as string[][] };
  }

  const [headerLine, ...rowLines] = lines;

  return {
    headers: parseCsvLine(headerLine),
    rows: rowLines.map(parseCsvLine),
  };
}

type SystemDocumentPreviewModalProps = {
  selectedDocument: SelectedSystemDocument;
  systemName: string;
  systemSlug: string;
  onClose: () => void;
  onRequestSystemComplete?: () => void;
};

export function SystemDocumentPreviewModal({
  selectedDocument,
  systemName,
  systemSlug,
  onClose,
  onRequestSystemComplete,
}: SystemDocumentPreviewModalProps) {
  const [documentPreview, setDocumentPreview] = useState<{
    headers: string[];
    rows: string[][];
  } | null>(null);
  const [documentPreviewState, setDocumentPreviewState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const asset = getSystemDocumentAsset(systemSlug, selectedDocument.document);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!asset?.csvHref) {
      setDocumentPreview(null);
      setDocumentPreviewState("idle");
      return;
    }

    const csvHref = asset.csvHref;
    let cancelled = false;

    async function loadPreview() {
      setDocumentPreviewState("loading");

      try {
        const response = await fetch(csvHref, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Unable to load ${csvHref}`);
        }

        const content = await response.text();

        if (cancelled) {
          return;
        }

        setDocumentPreview(parseCsvTable(content));
        setDocumentPreviewState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setDocumentPreview(null);
        setDocumentPreviewState("error");
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [asset?.csvHref]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-blue/45 p-4"
      data-system-document-preview="true"
      role="dialog"
      aria-modal="true"
      aria-label={selectedDocument.document}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] sm:p-7 sm:pt-14"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
          Document
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-brand-blue">
          {selectedDocument.document}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          Process associé : {selectedDocument.process}
        </p>

        {!asset ? (
          <div className="mt-5 rounded-[1rem] border border-dema-line bg-white/70 px-4 py-6 text-sm text-dema-muted">
            L&apos;aperçu et le téléchargement de ce document sont en préparation pour {systemName}.
          </div>
        ) : null}

        {onRequestSystemComplete ? (
          <div className="mt-5 flex justify-start">
            <button
              type="button"
              onClick={onRequestSystemComplete}
              className="demaa-secondary-button"
            >
              Recevoir le système complet
            </button>
          </div>
        ) : null}

        {documentPreviewState === "loading" ? (
          <div className="mt-5 rounded-[1rem] border border-dema-line bg-white/70 px-4 py-6 text-sm text-dema-muted">
            Chargement du document...
          </div>
        ) : null}

        {documentPreviewState === "ready" && documentPreview ? (
          <div className="mt-5 overflow-hidden rounded-[1rem] border border-dema-line bg-white">
            <div className="max-h-[48vh] overflow-auto">
              <table className="min-w-full border-collapse text-left text-[13px] leading-relaxed text-brand-blue">
                <thead className="sticky top-0 bg-dema-forest text-[11px] uppercase tracking-[0.12em] text-white">
                  <tr>
                    {documentPreview.headers.map((header) => (
                      <th
                        key={header}
                        className="border-b border-dema-line px-3 py-3 font-semibold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentPreview.rows.map((row, rowIndex) => (
                    <tr
                      key={`${selectedDocument.document}-${rowIndex}`}
                      className="align-top odd:bg-white even:bg-dema-sage"
                    >
                      {documentPreview.headers.map((header, cellIndex) => (
                        <td
                          key={`${header}-${rowIndex}`}
                          className="border-b border-dema-line/70 px-3 py-3 text-sm text-dema-muted"
                        >
                          {row[cellIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {documentPreviewState === "error" ? (
          <div className="mt-5 rounded-[1rem] border border-dema-line bg-white/70 px-4 py-6 text-sm text-dema-muted">
            L’aperçu du document n’a pas pu être chargé pour le moment.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SystemeTabContent({
  systemName,
  systemSlug,
  systeme,
  includePilotingDocument,
  onRequestSystemComplete,
}: SystemeTabContentProps) {
  const [selectedDocument, setSelectedDocument] = useState<SelectedSystemDocument | null>(null);

  if (!systeme?.cards.length) {
    return (
      <div className="demaa-surface rounded-[1.35rem] px-5 py-6 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
          Systèmes
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-brand-blue">
          Structure en cours de préparation
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
          Le référentiel système de {systemName} est en cours de structuration. Les onglets existants restent disponibles pendant la montée en qualité lot par lot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          Documents et process cles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systeme.cards.map((card) => (
          <details
            key={card.pillar}
            className="demaa-accordion h-fit rounded-[1.25rem] px-5 py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-brand-blue">
                  {card.pillar}
                </h3>
                <p className="mt-1 text-xs text-dema-muted">
                  {card.items.length + (card.pillar === "Direction" && includePilotingDocument ? 1 : 0)} process
                </p>
              </div>
              <ChevronDown
                className="demaa-accordion-chevron h-4 w-4 shrink-0 text-dema-muted transition-transform"
                aria-hidden="true"
              />
            </summary>

            <div className="demaa-accordion-content mt-4 space-y-4">
              {card.pillar === "Direction" && includePilotingDocument ? (
                <div className="flex items-center justify-between gap-4 border-t border-dema-line/80 pt-4 first:border-t-0 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-relaxed text-brand-blue">
                      Organiser les routines de pilotage
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-dema-muted">
                      Plan des tâches de pilotage
                    </p>
                  </div>
                  <span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-dema-muted"
                    aria-label="Document inclus après le formulaire"
                  >
                    <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              ) : null}

              {card.items.map((item) => {
                return (
                  <div
                    key={`${card.pillar}-${item.process}`}
                    className="flex items-center justify-between gap-4 border-t border-dema-line/80 pt-4 first:border-t-0 first:pt-0"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocument({
                          process: item.process,
                          document: item.document,
                        });
                      }}
                      className="min-w-0 flex-1 text-left text-sm font-medium leading-relaxed text-brand-blue transition hover:text-dema-forest"
                    >
                      {item.process}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDocument({
                          process: item.process,
                          document: item.document,
                        });
                      }}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-dema-muted transition hover:bg-dema-sage/35 hover:text-dema-muted"
                      aria-label={`Voir le document pour ${item.process}`}
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {selectedDocument ? (
        <SystemDocumentPreviewModal
          selectedDocument={selectedDocument}
          systemName={systemName}
          systemSlug={systemSlug}
          onClose={() => setSelectedDocument(null)}
          onRequestSystemComplete={onRequestSystemComplete}
        />
      ) : null}
    </div>
  );
}
