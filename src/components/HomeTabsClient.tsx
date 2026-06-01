"use client";

import { useMemo, useState } from "react";
import { BookOpen, Boxes, Play, Search, Wrench } from "lucide-react";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

type HomeTab = "systemes" | "boite-a-outils" | "academy";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  tools: ToolDirectoryItem[];
  toolSectors: string[];
  toolCategories: string[];
  initialTab?: string;
  initialCategory?: string;
  initialSector?: string;
};

const tabs = [
  {
    id: "systemes",
    label: "Systèmes",
    icon: Boxes,
  },
  {
    id: "boite-a-outils",
    label: "Boîte à outils",
    icon: Wrench,
  },
  {
    id: "academy",
    label: "Academy",
    icon: BookOpen,
  },
] as const;

const academyVideos = [
  {
    title: "Créer un système simple pour ne plus tout refaire à la main",
    duration: "12 min",
    category: "Fondations",
  },
  {
    title: "Automatiser ses relances sans perdre le contact humain",
    duration: "9 min",
    category: "Automatisation",
  },
  {
    title: "Choisir les bons outils avant de connecter quoi que ce soit",
    duration: "15 min",
    category: "Méthode",
  },
] as const;

function getInitialTab(tab?: string): HomeTab {
  if (tab === "boite-a-outils" || tab === "academy" || tab === "systemes") {
    return tab;
  }

  return "systemes";
}

export default function HomeTabsClient({
  systems,
  detailsBySlug,
  tools,
  toolSectors,
  toolCategories,
  initialTab,
  initialCategory,
  initialSector,
}: HomeTabsClientProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>(() => getInitialTab(initialTab));
  const [searchQuery, setSearchQuery] = useState("");
  const showHubSearch = activeTab === "academy";

  const searchPlaceholder = useMemo(() => {
    if (activeTab === "boite-a-outils") {
      return "Rechercher un outil gratuit, un usage, un secteur...";
    }

    if (activeTab === "academy") {
      return "Rechercher une vidéo, une méthode, un thème...";
    }

    return "Rechercher une entreprise, un processus, un outil...";
  }, [activeTab]);

  const tabContent = useMemo(() => {
    if (activeTab === "boite-a-outils") {
      return (
        <ToolDirectoryClient
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          title="Boîte à outils"
          description="Les outils gratuits créés par Demaa pour faire avancer l'activité plus vite."
          searchPlaceholder="Rechercher un outil gratuit, un usage, un secteur..."
          resultLabel="outils gratuits trouvés"
          items={tools}
          sectors={toolSectors}
          categories={toolCategories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          hideTransverseOnSector={false}
          externalLinks={false}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          showHeader={false}
          showSearchBar={false}
          variant="toolbox"
        />
      );
    }

    if (activeTab === "academy") {
      return <AcademyPlaceholder searchQuery={searchQuery} />;
    }

    return (
      <SystemsCatalogClient
        systems={systems}
        detailsBySlug={detailsBySlug}
        showIntro={false}
        pageSize={8}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showSearchBar={false}
      />
    );
  }, [
    activeTab,
    detailsBySlug,
    initialCategory,
    initialSector,
    systems,
    toolCategories,
    toolSectors,
    tools,
    searchQuery,
  ]);

  function selectTab(tab: HomeTab) {
    setActiveTab(tab);
    setSearchQuery("");
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    window.history.replaceState(null, "", `/?${params.toString()}`);
  }

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-[#FFF9F8]/70 px-4 pb-6 pt-16 text-center md:px-8 md:pb-8 md:pt-20">
        <div className="mx-auto max-w-6xl space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="demaa-hero-title text-[3rem] text-brand-blue tracking-tight leading-[0.98] md:text-[4.05rem] lg:text-[5rem]">
              Structurez Mieux
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base font-normal leading-relaxed text-brand-blue/65 md:text-lg">
              Vous avez déjà assez à gérer, on vous aide à mieux structurer votre
              entreprise et vous libérer du temps grâce aux systèmes.
            </p>
          </div>

          <div className="mx-auto w-full max-w-4xl">
            <TabBar activeTab={activeTab} onSelect={selectTab} />
            {showHubSearch ? (
              <div className="mt-3 rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(25,27,48,0.035)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-full bg-white py-3 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/40"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      {tabContent}
    </>
  );
}

function TabBar({
  activeTab,
  onSelect,
}: {
  activeTab: HomeTab;
  onSelect: (tab: HomeTab) => void;
}) {
  return (
    <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto rounded-full border border-brand-blue/5 bg-white p-[0.45rem] shadow-[0_10px_30px_rgba(25,27,48,0.035)] soft-scroll">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`inline-flex min-h-[2.875rem] flex-1 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition md:px-5 ${
              isActive
                ? "bg-brand-blue text-white shadow-sm"
                : "text-brand-blue/70 hover:bg-[#FFF3EF] hover:text-brand-coral"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AcademyPlaceholder({ searchQuery }: { searchQuery: string }) {
  const filteredVideos = academyVideos.filter((video) => {
    const query = searchQuery.trim().toLowerCase();

    return (
      !query ||
      video.title.toLowerCase().includes(query) ||
      video.category.toLowerCase().includes(query)
    );
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {filteredVideos.map((video) => (
          <article
            key={video.title}
            className="overflow-hidden rounded-[1.25rem] border border-brand-blue/8 bg-white shadow-[0_8px_24px_rgba(25,27,48,0.025)]"
          >
            <div className="relative aspect-video bg-brand-blue">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,116,88,0.24),rgba(255,255,255,0.03))]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-blue shadow-sm">
                  <Play className="h-6 w-6 fill-current" />
                </span>
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                {video.duration}
              </span>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand-coral">
                {video.category}
              </p>
              <h2 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
                {video.title}
              </h2>
              <p className="mt-3 text-xs font-medium text-gray-400">
                Placeholder YouTube
              </p>
            </div>
          </article>
        ))}
      </div>

      {filteredVideos.length === 0 ? (
        <div className="mt-8 rounded-[1.25rem] border border-dashed border-brand-blue/10 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-brand-blue">Aucune vidéo trouvée</h2>
          <p className="mt-3 text-sm font-normal text-gray-500">
            Essayez un autre mot-clé ou un thème plus large.
          </p>
        </div>
      ) : null}
    </section>
  );
}
