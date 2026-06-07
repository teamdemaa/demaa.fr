"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowLeft, Search } from "lucide-react";
import HorizontalScrollHint from "@/components/HorizontalScrollHint";
import SoftwareDetailDialog from "@/components/SoftwareDetailDialog";
import type { ToolDirectoryCardItem } from "@/lib/tool-directory-page";

function getValidFilters(
  sectors: string[],
  categories: string[],
  sector?: string,
  category?: string,
) {
  if (category && categories.includes(category)) {
    return { sector: "Tous", category };
  }

  if (sector && sectors.includes(sector)) {
    return { sector, category: "Tous" };
  }

  return { sector: "Tous", category: "Tous" };
}

type ToolDirectoryClientProps = {
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  items: ToolDirectoryCardItem[];
  secondaryItems?: ToolDirectoryCardItem[];
  sectors: string[];
  categories: string[];
  initialCategory?: string;
  initialSector?: string;
  hideTransverseOnSector?: boolean;
  externalLinks?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  showHeader?: boolean;
  showSearchBar?: boolean;
  variant?: "directory" | "toolbox";
  cardClickMode?: "modal" | "navigate";
  backLink?: {
    href: string;
    label: string;
  };
};

export default function ToolDirectoryClient({
  title = "Annuaire Outils",
  description = "Les principaux outils utiles aux TPE, classés par secteur et usage.",
  searchPlaceholder = "Rechercher un outil, un usage, un secteur...",
  items,
  secondaryItems = [],
  sectors,
  categories,
  initialCategory,
  initialSector,
  hideTransverseOnSector = true,
  externalLinks = true,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
  showHeader = true,
  showSearchBar = true,
  variant = "directory",
  cardClickMode = "modal",
  backLink,
}: ToolDirectoryClientProps) {
  const initialFilters = getValidFilters(
    sectors,
    categories,
    initialSector,
    initialCategory,
  );
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [activeSector, setActiveSector] = useState(initialFilters.sector);
  const [activeCategory, setActiveCategory] = useState(initialFilters.category);
  const [selectedTool, setSelectedTool] = useState<ToolDirectoryCardItem | null>(null);
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const toolboxSectors = useMemo(
    () => [
      ...sectors,
      ...secondaryItems.flatMap((tool) => tool.sectors),
    ].filter((sector, index, list) => list.indexOf(sector) === index),
    [secondaryItems, sectors]
  );
  const toolboxCategories = useMemo(
    () => [
      ...categories,
      ...secondaryItems.map((tool) => tool.category),
    ].filter((category, index, list) => list.indexOf(category) === index),
    [categories, secondaryItems]
  );
  const visibleSectors = variant === "toolbox" ? toolboxSectors : sectors;
  const visibleCategories = variant === "toolbox" ? toolboxCategories : categories;

  function updateSearchQuery(value: string) {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  }

  function openToolDetails(tool: ToolDirectoryCardItem) {
    const detailUrl = tool.detailUrl ?? tool.url;

    setSelectedTool(tool);

    if (window.location.pathname !== detailUrl) {
      window.history.pushState({ demaaToolModal: true }, "", detailUrl);
    }
  }

  function closeToolDetails() {
    if (window.history.state?.demaaToolModal) {
      window.history.back();
      return;
    }

    setSelectedTool(null);
  }

  useEffect(() => {
    function handlePopState() {
      setSelectedTool(null);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((tool) => {
      const isTransverseTool = tool.sectors.length > 2;
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.bestFor.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.sectors.some((sector) => sector.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);

      const matchesSector =
        activeSector === "Tous" ||
        (tool.sectors.includes(activeSector) &&
          (!hideTransverseOnSector || !isTransverseTool));

      const matchesCategory =
        activeCategory === "Tous" || tool.category === activeCategory;

      return matchesSearch && matchesSector && matchesCategory;
    });
  }, [activeCategory, activeSector, hideTransverseOnSector, items, searchQuery]);

  const filteredOtherTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return secondaryItems.filter((tool) => {
      const matchesSector =
        activeSector === "Tous" || tool.sectors.includes(activeSector);
      const matchesCategory =
        activeCategory === "Tous" || tool.category === activeCategory;
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.bestFor.toLowerCase().includes(query) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        tool.sectors.some((sector) => sector.toLowerCase().includes(query)) ||
        tool.category.toLowerCase().includes(query);

      return (
        matchesSearch &&
        matchesSector &&
        matchesCategory
      );
    });
  }, [activeCategory, activeSector, searchQuery, secondaryItems]);

  return (
    <div className="w-full">
      <section className={`w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-4 md:pb-5 ${showHeader ? "pt-8 md:pt-10" : "pt-1"}`}>
        <div className="mx-auto max-w-5xl text-center">
          {showHeader ? (
            <>
              {backLink ? (
                <div className="mb-4 flex justify-start">
                  <Link
                    href={backLink.href}
                    className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    {backLink.label}
                  </Link>
                </div>
              ) : null}
              <h1 className="demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
                {title}
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-normal leading-relaxed text-dema-muted">
                {description}
              </p>
            </>
          ) : null}

          {showSearchBar ? (
            <div className={`demaa-search-shell mx-auto max-w-4xl p-1.5 ${showHeader ? "mt-5" : "mt-0"}`}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
                <input
                  value={searchQuery}
                  onChange={(event) => updateSearchQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full bg-dema-paper py-3.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-4 md:pl-12 md:text-base"
                />
              </div>
            </div>
          ) : null}

          {variant === "directory" || variant === "toolbox" ? (
            <HorizontalScrollArea
              outerClassName={`mx-auto max-w-4xl ${showSearchBar || showHeader ? "mt-3" : "mt-1"}`}
              scrollClassName="flex gap-2 overflow-x-auto pb-2 soft-scroll"
            >
              <FilterChip
                label="Tous"
                isActive={activeSector === "Tous" && activeCategory === "Tous"}
                onClick={() => {
                  setActiveSector("Tous");
                  setActiveCategory("Tous");
                }}
              />
              {visibleSectors
                .filter((sector) => sector !== "Tous")
                .map((sector) => (
                  <FilterChip
                    key={sector}
                    label={sector}
                    isActive={activeSector === sector}
                    onClick={() => {
                      setActiveSector(sector);
                      setActiveCategory("Tous");
                    }}
                  />
                ))}
              {visibleCategories
                .filter(
                  (category) =>
                    category !== "Tous" && !visibleSectors.includes(category)
                )
                .map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    isActive={activeCategory === category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveSector("Tous");
                    }}
                  />
                ))}
            </HorizontalScrollArea>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 md:py-7">
        <div className="flex items-center justify-end gap-4 pb-5">
          {(activeSector !== "Tous" || activeCategory !== "Tous" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                updateSearchQuery("");
                setActiveSector("Tous");
                setActiveCategory("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {variant === "toolbox" ? (
          <ToolboxSections
            freeTools={filteredTools}
            otherTools={filteredOtherTools}
            externalLinks={externalLinks}
            cardClickMode={cardClickMode}
            onOpenDetails={openToolDetails}
          />
        ) : filteredTools.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun outil trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre secteur, une autre catégorie ou un mot-clé plus large.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.name}
                externalLinks={externalLinks}
                cardClickMode={cardClickMode}
                tool={tool}
                onOpenDetails={openToolDetails}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dema-forest">
                      {tool.category}
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-brand-blue">
                      {tool.name}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm font-normal leading-relaxed text-dema-muted">
                  {tool.description}
                </p>

                <p className="mt-2 text-xs font-normal leading-relaxed text-brand-blue/65">
                  {tool.bestFor}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(tool.sectors.length > 2 ? ["Transverse"] : tool.sectors)
                    .slice(0, 2)
                    .map((sector) => (
                      <span
                        key={sector}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-normal ${
                          sector === "Transverse"
                            ? "bg-dema-paper text-brand-blue/65"
                            : "bg-dema-sage/75 text-brand-blue/75"
                        }`}
                      >
                        {sector}
                      </span>
                    ))}
                  {tool.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-normal text-brand-blue/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3">
                  <span className="inline-flex rounded-full bg-dema-forest px-3 py-1 text-[10px] font-medium text-dema-paper">
                    {tool.pricingHint}
                  </span>
                </div>
              </ToolCard>
            ))}
          </div>
        )}
      </section>
      {selectedTool ? (
        <SoftwareDetailDialog tool={selectedTool} onClose={closeToolDetails} />
      ) : null}
    </div>
  );
}

function ToolboxSections({
  freeTools,
  otherTools,
  externalLinks,
  cardClickMode,
  onOpenDetails,
}: {
  freeTools: ToolDirectoryCardItem[];
  otherTools: ToolDirectoryCardItem[];
  externalLinks: boolean;
  cardClickMode: "modal" | "navigate";
  onOpenDetails: (tool: ToolDirectoryCardItem) => void;
}) {
  const hasResults = freeTools.length > 0 || otherTools.length > 0;

  if (!hasResults) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
        <h2 className="text-xl font-bold text-brand-blue">Aucun outil trouvé</h2>
        <p className="mt-3 text-sm font-normal text-dema-muted">
          Essayez un autre mot-clé ou un usage plus large.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {freeTools.length > 0 ? (
        <section id="outils-du-quotidien" className="scroll-mt-28">
          <SectionTitle title="Outils gratuits" />
          <HorizontalScrollArea
            outerClassName="-mx-4 sm:-mx-6 lg:-mx-8"
            scrollClassName="overflow-x-auto px-4 pb-3 soft-scroll sm:px-6 lg:px-8"
            controlsClassName="absolute right-4 -top-10 z-10 flex items-center gap-1.5 sm:right-6 lg:right-8"
            showScrollHint
          >
            <div className="flex gap-4">
              {freeTools.map((tool) => (
                <SquareToolCard
                  key={tool.name}
                  tool={tool}
                  externalLinks={externalLinks}
                  cardClickMode={cardClickMode}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </HorizontalScrollArea>
        </section>
      ) : null}

      {otherTools.length > 0 ? (
        <section>
          <SectionTitle title="Autres Outils" />
          <HorizontalScrollArea
            viewAllHref="/annuaire-outils"
            outerClassName="-mx-4 sm:-mx-6 lg:-mx-8"
            scrollClassName="overflow-x-auto px-4 pb-3 soft-scroll sm:px-6 lg:px-8"
            controlsClassName="absolute right-4 -top-10 z-10 flex items-center gap-1.5 sm:right-6 lg:right-8"
            showScrollHint
          >
            <div className="flex gap-4">
              {otherTools.map((tool) => (
                <SquareToolCard
                  key={tool.name}
                  tool={tool}
                  externalLinks={externalLinks}
                  cardClickMode={cardClickMode}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          </HorizontalScrollArea>
        </section>
      ) : null}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-3">
      <h2 className="demaa-section-title text-2xl tracking-tight text-brand-blue/85 md:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function HorizontalScrollArea({
  children,
  viewAllHref,
  viewAllLabel = "Voir tout",
  outerClassName = "",
  scrollClassName = "",
  showScrollHint = false,
  controlsClassName,
}: {
  children: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  outerClassName?: string;
  scrollClassName?: string;
  showScrollHint?: boolean;
  controlsClassName?: string;
}) {
  return (
    <div className={outerClassName}>
      {showScrollHint ? (
        <HorizontalScrollHint className={scrollClassName} controlsClassName={controlsClassName}>
          {children}
        </HorizontalScrollHint>
      ) : (
        <div className={scrollClassName}>
          {children}
        </div>
      )}
      {viewAllHref ? (
        <div className="mt-1 flex justify-end px-4 sm:px-6 lg:px-8">
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-brand-blue/60 transition hover:text-brand-blue"
          >
            {viewAllLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function SquareToolCard({
  tool,
  externalLinks,
  cardClickMode,
  onOpenDetails,
}: {
  tool: ToolDirectoryCardItem;
  externalLinks: boolean;
  cardClickMode: "modal" | "navigate";
  onOpenDetails: (tool: ToolDirectoryCardItem) => void;
}) {
  const detailHref = tool.detailUrl ?? tool.url;
  const className =
    "demaa-card group flex min-h-[10rem] flex-[0_0_calc(50%-0.5rem)] flex-col rounded-[1.15rem] p-5 text-left md:flex-[0_0_calc(25%-0.75rem)]";

  const content = (
    <>
      <div className="flex h-full flex-col">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
          {tool.category}
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-brand-blue">
          {tool.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm font-normal leading-relaxed text-dema-muted">
          {tool.description}
        </p>
      </div>
    </>
  );

  if (externalLinks || (!tool.detailUrl && tool.url.startsWith("http"))) {
    return (
      <a href={tool.url} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link
      href={detailHref}
      className={className}
      onClick={
        cardClickMode === "modal"
          ? (event) => handleClientModalClick(event, tool, onOpenDetails)
          : undefined
      }
    >
      {content}
    </Link>
  );
}

function ToolCard({
  externalLinks,
  cardClickMode,
  tool,
  onOpenDetails,
  children,
}: {
  externalLinks: boolean;
  cardClickMode: "modal" | "navigate";
  tool: ToolDirectoryCardItem;
  onOpenDetails: (tool: ToolDirectoryCardItem) => void;
  children: ReactNode;
}) {
  const detailHref = tool.detailUrl ?? tool.url;
  const className =
    "demaa-card group flex h-full flex-col rounded-[1.15rem] p-4";

  if (externalLinks || (!tool.detailUrl && tool.url.startsWith("http"))) {
    return (
      <a href={tool.url} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={detailHref}
      className={className}
      onClick={
        cardClickMode === "modal"
          ? (event) => handleClientModalClick(event, tool, onOpenDetails)
          : undefined
      }
    >
      {children}
    </Link>
  );
}

function handleClientModalClick(
  event: MouseEvent<HTMLAnchorElement>,
  tool: ToolDirectoryCardItem,
  onOpenDetails: (tool: ToolDirectoryCardItem) => void,
) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  onOpenDetails(tool);
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`demaa-chip ${
        isActive
          ? "demaa-chip-active"
          : ""
      }`}
    >
      {label}
    </button>
  );
}
