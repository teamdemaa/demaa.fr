"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { type KeyboardEvent, useCallback, useState } from "react";
import OperationalSystemCopyRequestModal from "@/components/OperationalSystemCopyRequestModal";
import SystemProcessCallCta from "@/components/SystemProcessCallCta";
import SystemSolutionsTab, {
  type PublishedSolutionSection,
} from "@/components/SystemSolutionsTab";
import SystemeTabContent from "@/components/SystemeTabContent";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import {
  getNextSystemDetailTab,
  isVisibleSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";
import { getSystemKitPreview } from "@/lib/system-kit-previews";
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
  solutionSections?: readonly PublishedSolutionSection[];
  academyVideos?: ReadonlyArray<{
    slug: string;
    title: string;
    category: string;
  }>;
};

const systemTabs: ReadonlyArray<{
  slug: SystemDetailTab;
  label: string;
}> = [
  { slug: "process", label: "Process" },
  { slug: "solutions", label: "Solutions" },
];

const EMPTY_SOLUTION_SECTIONS: readonly PublishedSolutionSection[] = [];

export default function SystemDetailContent({
  system,
  detail,
  demoUrl,
  intro,
  initialActiveTab,
  deliveryAvailable = false,
  headingAs: Heading = "h2",
  headingId,
  solutionSections = EMPTY_SOLUTION_SECTIONS,
  academyVideos = [],
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
  const closeSystemModal = useCallback(() => {
    setIsSystemModalOpen(false);
  }, []);

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
    const nextTab = getNextSystemDetailTab(currentTab, event.key);
    if (!nextTab) return;

    event.preventDefault();
    selectTab(nextTab);
    requestAnimationFrame(() => {
      document.getElementById(`tab-${nextTab}`)?.focus();
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
            className="grid w-full grid-cols-2 gap-1 rounded-full border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.035)]"
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

          {activeTab === "solutions" ? (
            <SystemSolutionsTab sections={solutionSections} />
          ) : null}
        </section>
        <SystemProcessCallCta systemSlug={system.slug} />
        {academyVideos.length ? (
          <section
            className="mt-12 border-t border-dema-line pt-10"
            aria-labelledby="academy-related-heading"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Académie Demaa
                </p>
                <h2 id="academy-related-heading" className="mt-1 text-xl font-semibold tracking-[-0.025em] text-brand-blue">
                  Comprendre les indicateurs de ce système
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {academyVideos.map((video) => (
                <Link
                  key={video.slug}
                  href={`/academie/${video.slug}`}
                  className="group rounded-[1.1rem] border border-dema-line bg-dema-paper px-5 py-5 transition hover:border-dema-forest/18"
                >
                  <p className="text-xs font-medium text-dema-forest">{video.category}</p>
                  <h3 className="mt-2 font-semibold leading-snug text-brand-blue">{video.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-dema-forest">
                    Lire la fiche
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
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
