"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import AccompagnementServices from "@/components/AccompagnementServices";
import SystemCompleteModal from "@/components/SystemCompleteModal";
import SystemeTabContent from "@/components/SystemeTabContent";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import {
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  intro: string;
  initialActiveTab?: string;
  headingAs?: "h1" | "h2";
  headingId?: string;
};

const tabs: ReadonlyArray<{ slug: SystemDetailTab; label: string }> = [
  { slug: "process", label: "Process" },
  { slug: "outils", label: "Outils métier" },
  { slug: "accompagnement", label: "Accompagnement" },
];

export default function SystemDetailContent({
  system,
  detail,
  intro,
  initialActiveTab,
  headingAs: Heading = "h2",
  headingId,
}: SystemDetailContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(
    isVisibleSystemDetailTab(initialActiveTab) ? initialActiveTab : "process",
  );
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const métierTools = useMemo(
    () =>
      detail.tools
        .filter((tool) => (tool.scope ?? tool.detail?.scope) !== "transverse")
        .toSorted((left, right) => Number(Boolean(right.recommended)) - Number(Boolean(left.recommended)))
        .slice(0, 5),
    [detail.tools],
  );

  function selectTab(tab: SystemDetailTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.delete("service");
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  return (
    <>
      <article>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour
        </button>

        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            Kit opérationnel
          </p>
          <Heading
            id={headingId}
            className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl"
          >
            {system.name}
          </Heading>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-dema-muted">
            {intro}
          </p>
          <button
            type="button"
            onClick={() => setIsDownloadOpen(true)}
            className="demaa-primary-button mt-6 inline-flex items-center gap-2"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Recevoir gratuitement mon tableau de pilotage
          </button>
          <p className="mt-2 text-xs leading-relaxed text-dema-muted">
            Un seul Google Sheet : synthèse, prévisionnel, actions, équipe, écosystème,
            calendrier marketing et process.
          </p>
        </div>

        <div className="mt-10 border-b border-dema-line" role="tablist" aria-label="Contenu du kit">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                id={`tab-${tab.slug}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.slug}
                aria-controls={`panel-${tab.slug}`}
                onClick={() => selectTab(tab.slug)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.slug
                    ? "border-dema-forest text-dema-forest"
                    : "border-transparent text-dema-muted hover:text-brand-blue"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="mt-7"
        >
          {activeTab === "process" ? (
            <SystemeTabContent systemName={system.name} systeme={detail.systeme} />
          ) : null}

          {activeTab === "outils" ? (
            <div>
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue">
                  Les outils métier à regarder en priorité
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Une sélection courte, spécifique à votre activité. Les outils transverses
                  restent accessibles dans l’annuaire général.
                </p>
              </div>
              {métierTools.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {métierTools.map((tool) => {
                    const href = tool.slug
                      ? `/annuaire-outils/${tool.slug}`
                      : tool.url ?? "/annuaire-outils";

                    return (
                      <Link
                        key={tool.slug ?? tool.name}
                        href={href}
                        className="demaa-card group flex min-h-[13rem] flex-col rounded-[1.15rem] p-5"
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <Wrench className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                          {tool.type}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
                          {tool.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                          {tool.usage}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-dema-forest">
                          Voir l’outil
                          <ArrowRight
                            className="h-4 w-4 transition group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="demaa-surface mt-6 rounded-[1.25rem] px-5 py-6">
                  <p className="text-sm leading-relaxed text-dema-muted">
                    La sélection d’outils métier est en cours de finalisation.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "accompagnement" ? (
            <AccompagnementServices
              sectorLabel={detail.sectorLabel}
              source="Kit opérationnel — Accompagnement"
              systemName={system.name}
              systemSlug={system.slug}
            />
          ) : null}
        </section>
      </article>

      {isDownloadOpen ? (
        <SystemCompleteModal
          systemSlug={system.slug}
          systemName={system.name}
          systeme={detail.systeme}
          onClose={() => setIsDownloadOpen(false)}
        />
      ) : null}
    </>
  );
}
