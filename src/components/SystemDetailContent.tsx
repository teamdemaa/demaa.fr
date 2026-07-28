"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
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
import SystemeTabContent from "@/components/SystemeTabContent";
import {
  trackKitOpen,
  trackSystemEcosystemEvent,
  trackSystemJourneyEvent,
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
  const [isCopyRequestOpen, setIsCopyRequestOpen] = useState(false);
  const preview = getSystemKitPreview(system.slug);
  const métierTools = useMemo(
    () =>
      detail.tools
        .filter((tool) => (tool.scope ?? tool.detail?.scope) !== "transverse")
        .toSorted((left, right) => Number(Boolean(right.recommended)) - Number(Boolean(left.recommended)))
        .slice(0, 5),
    [detail.tools],
  );
  const closeCopyRequest = useCallback(() => {
    setIsCopyRequestOpen(false);
  }, []);

  useEffect(() => {
    if (activeTab !== "ecosysteme") return;

    trackSystemEcosystemEvent("system_ecosystem_tab_opened", {
      systemSlug: system.slug,
    });
  }, [activeTab, system.slug]);

  function openCopyRequest() {
    setIsCopyRequestOpen(true);
    trackSystemJourneyEvent("system_copy_form_opened", {
      systemSlug: system.slug,
    });
  }

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
        </div>

        {deliveryAvailable ? (
          <section className="mt-8 grid w-full overflow-hidden rounded-[1.35rem] border border-dema-line bg-dema-paper shadow-[0_10px_30px_rgba(23,35,29,0.035)] md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <div className="flex min-h-[15rem] items-center justify-center bg-dema-sage/45 p-5 sm:min-h-[18rem] sm:p-7 md:min-h-[21rem]">
              {preview ? (
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  width={preview.width}
                  height={preview.height}
                  loading="eager"
                  sizes="(max-width: 767px) calc(100vw - 72px), 330px"
                  className="h-auto w-full rounded-[0.8rem] shadow-[0_14px_35px_rgba(23,35,29,0.1)] sm:w-[96%]"
                />
              ) : (
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-dema-paper text-dema-forest shadow-sm">
                  <FileSpreadsheet className="h-8 w-8" aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-8 sm:py-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Système opérationnel
              </p>
              <h2 className="mt-3 text-[1.55rem] font-semibold leading-tight tracking-[-0.025em] text-brand-blue">
                Système opérationnel - {system.name}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                Des process concrets, des outils recommandés et un tableau
                Google Sheets prêt à utiliser.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-start">
                {demoUrl ? (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackKitOpen({
                        kitName: `${system.name} - démonstration`,
                        kitSlug: system.slug,
                      })}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
                  >
                    Voir la démonstration
                  </a>
                ) : null}
                <div
                  data-kit-copy-cta-group
                  className="flex w-full flex-col items-center gap-2 sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={openCopyRequest}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-dema-forest/25 bg-dema-paper px-5 py-3 text-sm font-semibold text-dema-forest transition hover:border-dema-forest hover:bg-dema-sage/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:w-auto"
                  >
                    Recevoir ma copie modifiable
                  </button>
                  <p className="text-center text-xs leading-relaxed text-dema-muted">
                    Gratuit · Envoyé par e-mail
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

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
            <SystemeTabContent
              systemName={system.name}
              systeme={detail.systeme}
            />
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
      {isCopyRequestOpen ? (
        <OperationalSystemCopyRequestModal
          systemName={system.name}
          systemSlug={system.slug}
          onClose={closeCopyRequest}
        />
      ) : null}
    </>
  );
}
