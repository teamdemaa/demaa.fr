"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  PlayCircle,
  Search,
  X,
} from "lucide-react";
import PrimaryMobileNav, { type PrimaryNavTab } from "@/components/PrimaryMobileNav";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import type { System } from "@/lib/types";
import type { OperationalSystemDetail } from "@/lib/system-operations";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

type HomeTab = "systemes" | "outils" | "academy";
const HOME_TAB_SELECT_EVENT = "demaa:home-tab-select";

type HomeTabsClientProps = {
  systems: System[];
  detailsBySlug: Record<string, OperationalSystemDetail>;
  tools: ToolDirectoryItem[];
  otherTools: ToolDirectoryItem[];
  toolSectors: string[];
  toolCategories: string[];
  initialTab?: string;
  initialCategory?: string;
  initialSector?: string;
  initialSystem?: string;
};

const tabHeroCopy: Record<
  HomeTab,
  {
    breakAfterMuted?: boolean;
    breakBeforeMuted?: boolean;
    muted?: string;
    mutedAfter?: boolean;
    strong: string;
  }
> = {
  systemes: {
    muted: "votre entreprise",
    strong: "Organisez efficacement",
    mutedAfter: true,
    breakBeforeMuted: true,
  },
  outils: {
    muted: "au quotidien",
    strong: "Gérez votre activité",
    mutedAfter: true,
    breakBeforeMuted: true,
  },
  academy: {
    muted: "Maîtrisez les bases de la",
    strong: "gestion d'entreprise",
    breakAfterMuted: true,
  },
};

type AcademyCarousel = {
  title: string;
  category: string;
  resourceLabel: string;
  resourceHref: string;
  slides: string[];
};

const resourceCarousels: AcademyCarousel[] = [
  {
    title: "Maîtriser les obligations et les finances de son entreprise",
    category: "Obligations",
    resourceLabel: "Accéder au modèle",
    resourceHref:
      "https://www.canva.com/design/DAHDpfMys10/_MTXI4EYctriq9Mn9eEhRA/view?utm_content=DAHDpfMys10&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h1664f1e785",
    slides: [
      "/images/academy/obligations-1.png",
      "/images/academy/obligations-2.png",
    ],
  },
  {
    title: "Construire un budget prévisionnel pour être dans l'anticipation",
    category: "Trésorerie",
    resourceLabel: "Accéder au modèle",
    resourceHref:
      "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
    slides: [
      "/images/academy/budget-1.png",
      "/images/academy/budget-2.png",
      "/images/academy/budget-3.png",
    ],
  },
  {
    title: "Comment organiser son entreprise au quotidien et concrètement",
    category: "Organisation",
    resourceLabel: "Accéder au modèle",
    resourceHref: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    slides: [
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
  },
];

type AcademyCourse = {
  title: string;
  category: string;
  description: string;
  expert: string;
  duration: string;
  level: string;
  status: string;
  youtubeEmbedUrl: string;
};

const academyCourses: AcademyCourse[] = [
  {
    title: "Tout comprendre sur la facturation électronique",
    category: "Finance",
    description:
      "Un cours court pour comprendre les échéances, les impacts concrets et les premiers réflexes à adopter dans une TPE.",
    expert: "Expert Demaa",
    duration: "25 min",
    level: "Débutant",
    status: "Bientôt disponible",
    youtubeEmbedUrl: "https://www.youtube.com/embed/videoseries?list=PL8mG-RkN2uTw7PhlnAr4pZZz2QubIbujH",
  },
  {
    title: "Lancer des publicités en ligne Facebook",
    category: "Marketing",
    description:
      "Les bases pour préparer une première campagne Meta propre : objectif, ciblage, créatif, budget et suivi.",
    expert: "Expert marketing",
    duration: "30 min",
    level: "Débutant",
    status: "Bientôt disponible",
    youtubeEmbedUrl: "https://www.youtube.com/embed/videoseries?list=PL8mG-RkN2uTw7PhlnAr4pZZz2QubIbujH",
  },
  {
    title: "Systématiser la prospection",
    category: "Vente",
    description:
      "Une méthode simple pour transformer la prospection en routine mesurable : listes, séquences, relances et CRM.",
    expert: "Expert croissance",
    duration: "35 min",
    level: "Intermédiaire",
    status: "Bientôt disponible",
    youtubeEmbedUrl: "https://www.youtube.com/embed/videoseries?list=PL8mG-RkN2uTw7PhlnAr4pZZz2QubIbujH",
  },
];

function getInitialTab(tab?: string): HomeTab {
  if (tab === "boite-a-outils" || tab === "outils") {
    return "outils";
  }

  if (tab === "systemes") {
    return "systemes";
  }

  return "systemes";
}

function getTabPath(tab: HomeTab) {
  if (tab === "outils") return "/outils";
  if (tab === "academy") return "/academy";

  return "/";
}

export default function HomeTabsClient({
  systems,
  detailsBySlug,
  tools,
  otherTools,
  toolSectors,
  toolCategories,
  initialTab,
  initialCategory,
  initialSector,
  initialSystem,
}: HomeTabsClientProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>(() =>
    initialSystem ? "systemes" : getInitialTab(initialTab)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const heroCopy = tabHeroCopy[activeTab];
  const searchPlaceholder =
    activeTab === "systemes"
      ? "Rechercher votre activité"
      : activeTab === "outils"
        ? "Rechercher dans le kit"
        : "Rechercher un sujet";

  const tabContent = useMemo(() => {
    if (activeTab === "outils") {
      return (
        <KitContent
          key={`${initialSector ?? "tous"}-${initialCategory ?? "tous"}`}
          tools={tools}
          otherTools={otherTools}
          toolSectors={toolSectors}
          toolCategories={toolCategories}
          initialCategory={initialCategory}
          initialSector={initialSector}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      );
    }

    if (activeTab === "academy") {
      return <AcademyCourses searchQuery={searchQuery} />;
    }

    return (
      <SystemsCatalogClient
        key={`systems-${initialSystem ?? "none"}`}
        systems={systems}
        detailsBySlug={detailsBySlug}
        showIntro={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showSearchBar={false}
        initialSelectedSlug={initialSystem}
      />
    );
  }, [
    activeTab,
    detailsBySlug,
    initialCategory,
    initialSector,
    initialSystem,
    systems,
    toolCategories,
    toolSectors,
    tools,
    otherTools,
    searchQuery,
  ]);

  function selectTab(tab: HomeTab) {
    setActiveTab(tab);
    setSearchQuery("");
    window.history.replaceState(null, "", getTabPath(tab));
    window.dispatchEvent(new CustomEvent(HOME_TAB_SELECT_EVENT, { detail: { tab } }));
  }

  function selectPrimaryMobileTab(tab: PrimaryNavTab) {
    if (tab === "structurer") {
      selectTab("systemes");
      return;
    }

    if (tab === "equiper") {
      selectTab("outils");
    }
  }

  useEffect(() => {
    function handleHomeTabSelect(event: Event) {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab;

      if (tab !== "systemes" && tab !== "outils") {
        return;
      }

      setActiveTab(tab);
      setSearchQuery("");
    }

    window.addEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);

    return () => {
      window.removeEventListener(HOME_TAB_SELECT_EVENT, handleHomeTabSelect);
    };
  }, []);

  return (
    <>
      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-12 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[2.24rem] tracking-tight leading-[0.98] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              {heroCopy.muted && !heroCopy.mutedAfter ? (
                <>
                  <span className="font-sans font-light not-italic text-brand-blue/44">
                    {heroCopy.muted}
                  </span>
                  {heroCopy.breakAfterMuted ? (
                    <>
                      {" "}
                      <br />
                    </>
                  ) : " "}
                </>
              ) : null}
              <span className="demaa-hero-title text-brand-blue/86">{heroCopy.strong}</span>
              {heroCopy.muted && heroCopy.mutedAfter ? (
                <>
                  {heroCopy.breakBeforeMuted ? (
                    <>
                      {" "}
                      <br />
                    </>
                  ) : " "}
                  <span className="font-sans font-light not-italic text-brand-blue/44">
                    {heroCopy.muted}
                  </span>
                </>
              ) : null}
            </h1>
          </div>

          <SearchBar
            value={searchQuery}
            placeholder={searchPlaceholder}
            onChange={setSearchQuery}
          />
        </div>
      </section>
      {tabContent}
      <div className="h-24 md:hidden" aria-hidden="true" />
      <PrimaryMobileNav
        activeTab={activeTab === "outils" ? "equiper" : "structurer"}
        onSelect={selectPrimaryMobileTab}
      />
    </>
  );
}

function KitContent({
  tools,
  otherTools,
  toolSectors,
  toolCategories,
  initialCategory,
  initialSector,
  searchQuery,
  setSearchQuery,
}: {
  tools: ToolDirectoryItem[];
  otherTools: ToolDirectoryItem[];
  toolSectors: string[];
  toolCategories: string[];
  initialCategory?: string;
  initialSector?: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  return (
    <>
      <ToolDirectoryClient
        title="S'équiper"
        description="Les outils pratiques pour faire avancer l'activité plus vite."
        searchPlaceholder="Rechercher dans le kit"
        items={tools}
        secondaryItems={otherTools}
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
      <KitResourcesSection />
    </>
  );
}

function KitSectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <h2 className="demaa-section-title text-2xl tracking-tight text-brand-blue/85 md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function KitResourcesSection() {
  return (
    <section id="ressources" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <KitSectionTitle title="Ressources" />
      <HorizontalScrollHint
        className="-mx-4 overflow-x-auto px-4 pb-3 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        controlsClassName="absolute right-4 -top-10 z-10 flex items-center gap-1.5 sm:right-6 lg:right-8"
      >
        <div className="flex gap-4 pr-4">
          {resourceCarousels.map((carousel) => (
            <ResourceLinkCard key={carousel.title} carousel={carousel} />
          ))}
        </div>
      </HorizontalScrollHint>
    </section>
  );
}

function ResourceLinkCard({ carousel }: { carousel: AcademyCarousel }) {
  return (
    <a
      href={carousel.resourceHref}
      target="_blank"
      rel="noreferrer"
      className="demaa-card group w-[17.5rem] shrink-0 overflow-hidden rounded-[1.15rem] text-left sm:w-[19rem] md:w-[21rem]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-dema-cream">
        <Image
          src={carousel.slides[0]}
          alt=""
          fill
          sizes="(min-width: 1024px) 352px, (min-width: 768px) 33vw, calc(100vw - 32px)"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.012]"
        />
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dema-muted">
          {carousel.category}
        </p>
        <h2 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
          {carousel.title}
        </h2>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-dema-forest">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {carousel.resourceLabel}
        </span>
      </div>
    </a>
  );
}

function SearchBar({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="demaa-search-shell mx-auto w-full max-w-4xl">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-full bg-dema-paper py-2.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-12 md:text-base"
        />
      </div>
    </div>
  );
}

function AcademyCourses({ searchQuery }: { searchQuery: string }) {
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(academyCourses.map((course) => course.category)))],
    []
  );

  const filteredCourses = academyCourses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesCategory = activeCategory === "Tous" || course.category === activeCategory;
    const matchesSearch =
      !query ||
      course.title.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query) ||
      course.expert.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-4 pt-2 md:pb-5 md:pt-0">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl overflow-x-auto pb-2 soft-scroll">
            <div className="flex min-w-max justify-center gap-2 px-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`demaa-chip ${
                    activeCategory === category
                      ? "demaa-chip-active"
                      : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
        <KitSectionTitle title="Cours Academy" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filteredCourses.map((course) => (
            <AcademyCourseCard
              key={course.title}
              course={course}
              onOpen={setSelectedCourse}
            />
          ))}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="mt-8 rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-8 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun cours trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre thème.
            </p>
          </div>
        ) : null}

        {selectedCourse ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/35 p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_30px_80px_rgba(23,35,29,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-dema-line px-4 py-4 md:px-6">
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dema-muted">
                    {selectedCourse.category}
                  </p>
                  <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-brand-blue md:text-xl">
                    {selectedCourse.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 gap-0 bg-dema-cream md:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
                <div className="flex items-center justify-center px-3 py-4 md:px-6">
                  <div className="relative aspect-video w-full overflow-hidden rounded-[1rem] bg-brand-blue">
                    <iframe
                      src={selectedCourse.youtubeEmbedUrl}
                      title={selectedCourse.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                </div>

                <div className="border-t border-dema-line bg-dema-paper px-4 py-5 md:border-l md:border-t-0 md:px-6">
                  <div className="flex flex-wrap gap-2">
                    {[selectedCourse.status, selectedCourse.level, selectedCourse.duration, selectedCourse.expert].map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-normal text-brand-blue/70"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-normal leading-relaxed text-dema-muted">
                    {selectedCourse.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

function AcademyCourseCard({
  course,
  onOpen,
}: {
  course: AcademyCourse;
  onOpen: (course: AcademyCourse) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(course)}
      className="demaa-card group block w-full overflow-hidden rounded-[1.15rem] p-0 text-left"
    >
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),transparent_30%),linear-gradient(135deg,rgba(49,95,70,0.78),rgba(24,38,60,0.94))]" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full border border-dema-paper/35 bg-dema-paper/12 text-dema-paper shadow-[0_16px_44px_rgba(23,35,29,0.18)] backdrop-blur">
          <PlayCircle className="h-7 w-7" aria-hidden="true" />
        </span>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dema-muted">
          {course.category}
        </p>
        <h2 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
          {course.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-dema-muted">
          {course.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[course.status, course.level, course.duration].map((item) => (
            <span
              key={item}
              className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-normal text-brand-blue/70"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
