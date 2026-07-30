"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Wrench,
} from "lucide-react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import OperationalSystemCopyRequestModal from "@/components/OperationalSystemCopyRequestModal";
import SystemEcosystemTab from "@/components/SystemEcosystemTab";
import SystemProcessCallCta from "@/components/SystemProcessCallCta";
import SystemeTabContent from "@/components/SystemeTabContent";
import {
  trackSystemEcosystemEvent,
} from "@/lib/kit-analytics-client";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import {
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import { getSystemKitPreview } from "@/lib/system-kit-previews";
import type { SystemEcosystemGroup } from "@/lib/system-ecosystem-types";
import type { System } from "@/lib/types";

type SystemDetailContentProps = {
  system: System;
  detail: OperationalSystemDetail;
  demoUrl?: string | null;
  intro: string;
  initialActiveTab?: string;
  deliveryAvailable?: boolean;
  headingAs?: "h1" | "h2";
  headingId?: string;
  ecosystemGroups?: SystemEcosystemGroup[];
};

const systemTabs: ReadonlyArray<{
  slug: SystemDetailTab;
  label: string;
}> = [
  { slug: "process", label: "Process" },
  { slug: "outils", label: "Outils" },
  { slug: "ecosysteme", label: "Écosystème" },
];

export default function SystemDetailContent({
  system,
  detail,
  demoUrl,
  intro,
  initialActiveTab,
  deliveryAvailable = false,
  headingAs: Heading = "h2",
  headingId,
  ecosystemGroups = [],
}: SystemDetailContentProps) {
  const router = useRouter();
  const tabs = systemTabs;
  const [activeTab, setActiveTab] = useState<SystemDetailTab>(
    isVisibleSystemDetailTab(initialActiveTab) &&
      tabs.some((tab) => tab.slug === initialActiveTab)
      ? initialActiveTab
      : "process",
  );
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const preview = getSystemKitPreview(system.slug);
  const métierTools = useMemo(
    () =>
      detail.tools
        .filter((tool) => (tool.scope ?? tool.detail?.scope) !== "transverse")
        .toSorted((left, right) => Number(Boolean(right.recommended)) - Number(Boolean(left.recommended)))
        .slice(0, 5),
    [detail.tools],
  );
  const closeSystemModal = useCallback(() => {
    setIsSystemModalOpen(false);
  }, []);

  useEffect(() => {
    if (activeTab !== "ecosysteme") return;

    trackSystemEcosystemEvent("system_ecosystem_tab_opened", {
      systemSlug: system.slug,
    });
  }, [activeTab, system.slug]);

  function selectTab(tab: SystemDetailTab) {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.delete("service");
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentTab: SystemDetailTab,
  ) {
    const currentIndex = tabs.findIndex((tab) => tab.slug === currentTab);
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    selectTab(nextTab.slug);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${nextTab.slug}`)?.focus();
    });
  }

  return (
    <>
      <article className="w-full max-w-[55.2rem]">
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
            Système opérationnel
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
          {deliveryAvailable ? (
            <button
              type="button"
              onClick={() => setIsSystemModalOpen(true)}
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-dema-forest/25 bg-dema-paper px-5 py-3 text-sm font-semibold text-dema-forest transition hover:border-dema-forest hover:bg-dema-sage/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              Voir le système
            </button>
          ) : null}
        </div>

        <div className="mt-8 flex justify-start sm:mt-9">
          <div
            className="grid w-full grid-cols-3 gap-1 rounded-full border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
            role="tablist"
            aria-label="Contenu du système opérationnel"
            aria-orientation="horizontal"
          >
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                id={`tab-${tab.slug}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.slug}
                aria-controls="kit-content-panel"
                tabIndex={activeTab === tab.slug ? 0 : -1}
                onClick={() => selectTab(tab.slug)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.slug)}
                className={`min-h-12 min-w-0 whitespace-nowrap rounded-full px-1 py-2.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:px-4 sm:text-sm ${
                  activeTab === tab.slug
                    ? "bg-dema-sage text-dema-forest"
                    : "text-dema-muted hover:bg-dema-sage/55 hover:text-brand-blue"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <section
          id="kit-content-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="mt-7"
        >
          {activeTab === "process" ? (
            <>
              <SystemeTabContent
                systemName={system.name}
                systeme={detail.systeme}
              />
              <SystemProcessCallCta systemSlug={system.slug} />
            </>
          ) : null}

          {activeTab === "outils" ? (
            <div>
              {métierTools.length ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
                <div className="demaa-surface rounded-[1.25rem] px-5 py-6">
                  <p className="text-sm leading-relaxed text-dema-muted">
                    La sélection d’outils métier est en cours de finalisation.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "ecosysteme" ? (
            <SystemEcosystemTab
              key={system.slug}
              groups={ecosystemGroups}
              systemSlug={system.slug}
            />
          ) : null}

        </section>
      </article>
      {isSystemModalOpen ? (
        <OperationalSystemCopyRequestModal
          demoUrl={demoUrl}
          preview={preview}
          systemName={system.name}
          systemSlug={system.slug}
          onClose={closeSystemModal}
        />
      ) : null}
    </>
  );
}
