"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Wrench,
  X,
} from "lucide-react";
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

type AcademyCarousel = {
  title: string;
  category: string;
  resourceLabel: string;
  resourceHref: string;
  slides: string[];
};

const academyCarousels: AcademyCarousel[] = [
  {
    title: "Maîtriser les obligations et les finances de son entreprise",
    category: "Obligations",
    resourceLabel: "Accéder au modèle",
    resourceHref: "/outils/modeles-de-document",
    slides: [
      "/images/academy/obligations-0.png",
      "/images/academy/obligations-1.png",
      "/images/academy/obligations-2.png",
    ],
  },
  {
    title: "Construire un budget prévisionnel pour être dans l'anticipation",
    category: "Trésorerie",
    resourceLabel: "Accéder au modèle",
    resourceHref: "/outils/modeles-de-document",
    slides: [
      "/images/academy/budget-0.png",
      "/images/academy/budget-1.png",
      "/images/academy/budget-2.png",
      "/images/academy/budget-3.png",
    ],
  },
  {
    title: "Comment organiser son entreprise au quotidien et concrètement",
    category: "Organisation",
    resourceLabel: "Accéder au modèle",
    resourceHref: "/outils/modeles-de-document",
    slides: [
      "/images/academy/organisation-0.png",
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
  },
];

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
      return "Rechercher un carrousel, un modèle, un thème...";
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
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-[#ffffff]/70 px-4 pb-6 pt-16 text-center md:px-8 md:pb-8 md:pt-20">
        <div className="mx-auto max-w-6xl space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="demaa-hero-title text-[3rem] text-brand-blue tracking-tight leading-[0.98] md:text-[4.05rem] lg:text-[5rem]">
              <span className="text-neutral-400">Structurez</span>{" "}
              <span>Mieux</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base font-normal leading-relaxed text-brand-blue/65 md:text-lg">
              Utiliser les systèmes à votre avantage pour alléger la charge,
              libérer du temps et avancer avec plus de sérénité.
            </p>
          </div>

          <div className="mx-auto w-full max-w-4xl">
            <TabBar activeTab={activeTab} onSelect={selectTab} />
            {showHubSearch ? (
              <div className="mt-3 rounded-full border border-brand-blue/5 bg-white p-1.5 shadow-[0_10px_30px_rgba(20,20,20,0.035)]">
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
    <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto rounded-full border border-brand-blue/5 bg-white p-[0.45rem] shadow-[0_10px_30px_rgba(20,20,20,0.035)] soft-scroll">
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
                : "text-brand-blue/70 hover:bg-[#fcfcfc] hover:text-neutral-700"
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
  const [selectedCarousel, setSelectedCarousel] = useState<AcademyCarousel | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const filteredCarousels = academyCarousels.filter((carousel) => {
    const query = searchQuery.trim().toLowerCase();

    return (
      !query ||
      carousel.title.toLowerCase().includes(query) ||
      carousel.category.toLowerCase().includes(query) ||
      carousel.resourceLabel.toLowerCase().includes(query)
    );
  });

  function openCarousel(carousel: AcademyCarousel) {
    setSelectedCarousel(carousel);
    setActiveSlide(0);
  }

  function closeCarousel() {
    setSelectedCarousel(null);
    setActiveSlide(0);
  }

  function showPreviousSlide() {
    if (!selectedCarousel) return;

    setActiveSlide((currentSlide) =>
      currentSlide === 0 ? selectedCarousel.slides.length - 1 : currentSlide - 1
    );
  }

  function showNextSlide() {
    if (!selectedCarousel) return;

    setActiveSlide((currentSlide) =>
      currentSlide === selectedCarousel.slides.length - 1 ? 0 : currentSlide + 1
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {filteredCarousels.map((carousel) => (
          <AcademyCarouselCard
            key={carousel.title}
            carousel={carousel}
            onOpen={openCarousel}
          />
        ))}
      </div>

      {filteredCarousels.length === 0 ? (
        <div className="mt-8 rounded-[1.25rem] border border-dashed border-brand-blue/10 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-brand-blue">Aucun carrousel trouvé</h2>
          <p className="mt-3 text-sm font-normal text-gray-500">
            Essayez un autre mot-clé ou un thème plus large.
          </p>
        </div>
      ) : null}

      {selectedCarousel ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/35 p-4"
          onClick={closeCarousel}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] border border-brand-blue/8 bg-white shadow-[0_30px_80px_rgba(20,20,20,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-brand-blue/8 px-4 py-4 md:px-6">
              <div className="min-w-0 text-left">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {selectedCarousel.category}
                </p>
                <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-brand-blue md:text-xl">
                  {selectedCarousel.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCarousel}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-blue/10 bg-white text-brand-blue transition hover:bg-[#fcfcfc]"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#fcfcfc] px-3 py-4 md:px-6">
              <button
                type="button"
                onClick={showPreviousSlide}
                className="absolute left-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/10 bg-white/95 text-brand-blue shadow-sm transition hover:bg-white"
                aria-label="Slide précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <Image
                src={selectedCarousel.slides[activeSlide]}
                alt={`${selectedCarousel.title} - slide ${activeSlide + 1}`}
                width={3360}
                height={1890}
                sizes="(min-width: 1024px) 1024px, 94vw"
                className="max-h-[64vh] w-full rounded-[1rem] object-contain"
              />

              <button
                type="button"
                onClick={showNextSlide}
                className="absolute right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/10 bg-white/95 text-brand-blue shadow-sm transition hover:bg-white"
                aria-label="Slide suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-t border-brand-blue/8 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center justify-center gap-1.5 md:justify-start">
                {selectedCarousel.slides.map((slide, index) => (
                  <button
                    key={slide}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition ${
                      activeSlide === index ? "w-6 bg-brand-blue" : "w-2 bg-neutral-300"
                    }`}
                    aria-label={`Afficher la slide ${index + 1}`}
                  />
                ))}
              </div>

              <a
                href={selectedCarousel.resourceHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-blue/10 bg-white px-4 py-2 text-sm font-medium text-brand-blue transition hover:bg-[#fcfcfc]"
              >
                <FileText className="h-4 w-4" />
                {selectedCarousel.resourceLabel}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AcademyCarouselCard({
  carousel,
  onOpen,
}: {
  carousel: AcademyCarousel;
  onOpen: (carousel: AcademyCarousel) => void;
}) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(0);

  useEffect(() => {
    if (!isPreviewing || carousel.slides.length <= 1) return;

    const interval = window.setInterval(() => {
      setPreviewSlide((currentSlide) => (currentSlide + 1) % carousel.slides.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [carousel.slides.length, isPreviewing]);

  function stopPreview() {
    setIsPreviewing(false);
    setPreviewSlide(0);
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(carousel)}
      onMouseEnter={() => setIsPreviewing(true)}
      onMouseLeave={stopPreview}
      onFocus={() => setIsPreviewing(true)}
      onBlur={stopPreview}
      className="group overflow-hidden rounded-[1.25rem] border border-brand-blue/8 bg-white text-left shadow-[0_8px_24px_rgba(20,20,20,0.025)] transition hover:-translate-y-0.5 hover:border-brand-blue/14 hover:shadow-[0_16px_42px_rgba(20,20,20,0.055)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#fcfcfc]">
        <Image
          key={carousel.slides[previewSlide]}
          src={carousel.slides[previewSlide]}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="animate-in fade-in duration-700 object-cover transition-transform group-hover:scale-[1.012]"
        />
        {carousel.slides.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/75 px-2 py-1 shadow-[0_4px_14px_rgba(20,20,20,0.08)] backdrop-blur-sm">
            {carousel.slides.map((slide, index) => (
              <span
                key={slide}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  previewSlide === index ? "w-4 bg-brand-blue/75" : "w-1.5 bg-neutral-300"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          {carousel.category}
        </p>
        <h2 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
          {carousel.title}
        </h2>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          <FileText className="h-3.5 w-3.5" />
          Document inclus
        </p>
      </div>
    </button>
  );
}
