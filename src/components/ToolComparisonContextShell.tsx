"use client";

import { Check, Minus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import {
  buildSystemToolDecision,
  getSystemToolRoleLabel,
  selectComparableToolColumns,
} from "@/lib/system-tool-decision";
import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";
import type {
  ToolProcessComparisonCell,
  ToolProcessComparisonStatus,
  ToolProcessComparisonView,
} from "@/lib/tool-process-comparison-contract";

const STATUS_LABELS: Record<ToolProcessComparisonStatus, string> = {
  covered: "Pris en charge",
  configurable: "Partiel ou via module",
  not_documented: "Non documenté",
};

function StatusMark({ cell }: { cell: ToolProcessComparisonCell }) {
  const label = STATUS_LABELS[cell.status];

  return (
    <div className="flex items-center justify-center text-center">
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold sm:h-8 sm:w-8 ${
          cell.status === "covered"
            ? "border-dema-forest bg-dema-forest text-white"
            : cell.status === "configurable"
              ? "border-dema-positive bg-dema-positive text-dema-forest"
              : "border-dema-line bg-dema-paper text-dema-muted/55"
        }`}
        title={cell.note ? `${label} : ${cell.note}` : label}
        aria-label={label}
      >
        {cell.status === "covered" ? (
          <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
        ) : cell.status === "configurable" ? (
          <span className="text-sm leading-none" aria-hidden="true">
            ◐
          </span>
        ) : (
          <Minus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        )}
      </span>
    </div>
  );
}

function ToolDecisionCard({
  placement,
  systemSlug,
}: {
  placement: RenderableSolutionPlacementDto;
  systemSlug: string;
}) {
  const { resource } = placement;

  return (
    <Link
      href={`/solutions/${systemSlug}?resource=${resource.resourceSlug}`}
      className="group flex min-h-52 flex-col rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 transition hover:border-dema-forest/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-forest sm:text-xs">
        {getSystemToolRoleLabel(
          systemSlug,
          resource.resourceSlug,
          resource.displayCategory ?? "Outil",
        )}
      </span>
      <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-brand-blue">
        {resource.name}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-dema-muted">
        {resource.description}
      </p>
      <span className="mt-auto pt-5 text-sm font-semibold text-dema-forest group-hover:text-brand-blue">
        Voir le détail
      </span>
    </Link>
  );
}

export default function ToolComparisonContextShell({
  comparison,
  closeHref,
  closeWithBack = false,
  softwarePlacements,
  systemName,
  systemSlug,
}: {
  comparison: ToolProcessComparisonView | null;
  closeHref: string;
  closeWithBack?: boolean;
  softwarePlacements: readonly RenderableSolutionPlacementDto[];
  systemName: string;
  systemSlug: string;
}) {
  const router = useRouter();
  const decision = buildSystemToolDecision(systemSlug, softwarePlacements);
  const comparablePlacements = decision.comparable.length > 0
    ? decision.comparable
    : decision.unclassified;
  const supportingPlacements = decision.comparable.length > 0
    ? [...decision.complementary, ...decision.unclassified]
    : decision.complementary;
  const comparableView = selectComparableToolColumns(
    comparison,
    decision.comparable,
  );

  function close() {
    if (closeWithBack) router.back();
    else router.replace(closeHref);
  }

  const dialogRef = useAccessibleDialog({
    inertBodySiblings: true,
    onClose: close,
  });

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Choisir ses outils pour ${systemName}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex min-h-0 flex-col bg-background text-brand-blue"
    >
      <button
        type="button"
        data-dialog-initial-focus
        onClick={close}
        aria-label="Fermer le comparatif"
        className="fixed right-3 top-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:right-6 sm:top-5 sm:h-11 sm:w-11"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      <main className="min-h-0 flex-1 overflow-auto px-3 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8">
        <div className="mx-auto w-full max-w-[96rem] pb-6">
          <header className="max-w-3xl pr-12 sm:pr-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-forest sm:text-xs">
              Outils pour votre métier
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-brand-blue sm:text-4xl">
              Choisir ses outils pour {systemName}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-dema-muted sm:text-base sm:leading-7">
              Comparez les logiciels qui peuvent remplir le même rôle. Les
              outils qui répondent à un autre besoin sont présentés séparément.
            </p>
          </header>

          <section className="mt-8" aria-labelledby="comparison-core-tools">
            <h2
              id="comparison-core-tools"
              className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
            >
              {decision.comparable.length >= 2
                ? "Logiciels à comparer"
                : "Solutions métier à étudier"}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {comparablePlacements.map((placement) => (
                <ToolDecisionCard
                  key={placement.placementId}
                  placement={placement}
                  systemSlug={systemSlug}
                />
              ))}
            </div>
          </section>

          {supportingPlacements.length > 0 ? (
            <section className="mt-9" aria-labelledby="comparison-supporting-tools">
              <h2
                id="comparison-supporting-tools"
                className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
              >
                Outils complémentaires
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-dema-muted">
                Ils complètent le logiciel principal pour un besoin précis ; ils
                ne le remplacent pas nécessairement.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {supportingPlacements.map((placement) => (
                  <ToolDecisionCard
                    key={placement.placementId}
                    placement={placement}
                    systemSlug={systemSlug}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {comparableView ? (
            <section className="mt-10" aria-labelledby="comparison-feature-table">
              <h2
                id="comparison-feature-table"
                className="text-xl font-semibold tracking-[-0.025em] text-brand-blue sm:text-2xl"
              >
                Comparer les fonctions essentielles
              </h2>
              <div className="mb-3 mt-4 flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-dema-muted sm:mb-4 sm:min-h-11 sm:gap-x-5 sm:text-xs">
            <span className="font-semibold text-brand-blue">Lecture</span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white">
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
              Pris en charge
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-positive text-dema-forest">
                ◐
              </span>
              Partiel ou via module
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-muted/55">
                <Minus className="h-3 w-3" aria-hidden="true" />
              </span>
              Non documenté
            </span>
              </div>

          <div className="soft-scroll overflow-x-auto rounded-[1.1rem] border border-dema-line bg-dema-paper">
            <table
              className="min-w-full table-fixed border-separate border-spacing-0 [width:var(--comparison-width-mobile)] sm:[width:var(--comparison-width-tablet)] lg:[width:var(--comparison-width-desktop)]"
              style={
                {
                  "--comparison-width-mobile": `${11 + comparableView.tools.length * 7.75}rem`,
                  "--comparison-width-tablet": `${18 + comparableView.tools.length * 10.5}rem`,
                  "--comparison-width-desktop": `${22 + comparableView.tools.length * 12.5}rem`,
                } as CSSProperties
              }
            >
              <colgroup>
                <col className="w-[11rem] sm:w-[18rem] lg:w-[22rem]" />
                {comparableView.tools.map((tool) => (
                  <col
                    key={tool.resourceSlug}
                    className="w-[7.75rem] sm:w-[10.5rem] lg:w-[12.5rem]"
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 w-[11rem] border-b border-r border-dema-line bg-dema-paper px-3 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-dema-muted sm:w-[18rem] sm:px-5 sm:text-xs lg:w-[22rem]">
                    Fonctionnalités
                  </th>
                  {comparableView.tools.map((tool) => (
                    <th
                      key={tool.resourceSlug}
                      scope="col"
                      className="sticky top-0 z-20 w-[7.75rem] border-b border-r border-dema-line bg-dema-paper px-2 py-3 text-center text-xs font-semibold leading-4 text-brand-blue last:border-r-0 sm:w-[10.5rem] sm:px-3 sm:text-sm lg:w-[12.5rem]"
                    >
                      <span className="block">{tool.name}</span>
                      <span className="mt-0.5 block text-[9px] font-normal leading-3 text-dema-muted sm:text-[10px]">
                        {tool.positioning}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparableView.features.map((feature) => (
                  <tr key={feature.featureId}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-b border-r border-dema-line bg-dema-paper px-3 py-2.5 text-left align-middle text-xs font-medium leading-4 text-brand-blue sm:px-5 sm:py-3 sm:text-sm sm:leading-5"
                    >
                      <span
                        title={feature.description}
                        aria-label={
                          feature.description
                            ? `${feature.label} : ${feature.description}`
                            : feature.label
                        }
                        className={
                          feature.description
                            ? "cursor-help underline-offset-4 hover:underline"
                            : undefined
                        }
                      >
                        {feature.label}
                      </span>
                    </th>
                    {feature.cells.map((cell, index) => (
                      <td
                        key={comparableView.tools[index].resourceSlug}
                        className="border-b border-r border-dema-line bg-dema-paper px-2 py-2 text-center align-middle last:border-r-0 sm:px-3 sm:py-2.5"
                      >
                        <StatusMark cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] leading-4 text-dema-muted sm:mt-4 sm:text-xs sm:leading-5">
            Comparaison documentaire vérifiée le {comparableView.reviewedAt}. Les
            fonctions et offres peuvent évoluer : confirmez les usages critiques
            auprès de l’éditeur.
          </p>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
