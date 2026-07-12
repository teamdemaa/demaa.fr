"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { BookOpen } from "lucide-react";
import CourseSlidesDialog from "@/components/CourseSlidesDialog";
import LibraryIndexHeader from "@/components/LibraryIndexHeader";
import { matchesSearchQuery } from "@/lib/search";
import type { CourseEntry } from "@/lib/course-content";

type CoursesIndexClientProps = {
  entries: CourseEntry[];
  backLink?: {
    href: string;
    label: string;
  };
  returnSystemSlug?: string;
  headingAs?: "h1" | "h2";
  embedded?: boolean;
};

export default function CoursesIndexClient({
  entries,
  backLink,
  returnSystemSlug,
  headingAs = "h1",
  embedded = false,
}: CoursesIndexClientProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filters = useMemo(() => {
    const categoryFilters = Array.from(
      new Set(entries.map((entry) => entry.category).filter(Boolean)),
    );

    return ["Tous", ...categoryFilters];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        entry.title,
        entry.description,
        entry.category,
        entry.duration,
        entry.slug,
        ...entry.tags,
      ]);

      const matchesFilter =
        activeFilter === "Tous" || entry.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, entries, searchQuery]);

  function getCourseHref(entry: CourseEntry) {
    return returnSystemSlug
      ? `/cours/${entry.slug}?retourSysteme=${encodeURIComponent(returnSystemSlug)}`
      : `/cours/${entry.slug}`;
  }

  function handleCourseClick(event: MouseEvent<HTMLAnchorElement>, entry: CourseEntry) {
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
    setSelectedCourse(entry);
  }

  function renderCourseCard(entry: CourseEntry, eagerImage = false) {
    return (
      <Link
        key={entry.slug}
        href={getCourseHref(entry)}
        className="block h-full group"
        onClick={(event) => handleCourseClick(event, entry)}
      >
        <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.025)]">
          <div className="relative aspect-[16/10] overflow-hidden border-b border-gray-100 bg-dema-cream">
            {entry.image ? (
              <Image
                src={entry.image}
                alt={entry.title}
                fill
                loading={eagerImage ? "eager" : "lazy"}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-sm font-medium text-brand-coral">
                <BookOpen className="h-4 w-4" />
                <span>{entry.duration}</span>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                {entry.category}
              </span>
            </div>
            <p className="mt-4 leading-relaxed text-gray-500">
              {entry.description}
            </p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <div className="w-full">
      <LibraryIndexHeader
        title="Cours"
        description="Un espace simple pour apprendre les sujets clés et avancer plus sereinement."
        searchValue={searchQuery}
        searchPlaceholder="Rechercher un cours, un sujet, une notion..."
        activeFilter={activeFilter}
        defaultFilter="Tous"
        isFilterOpen={isFilterPanelOpen}
        filters={filters}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setIsFilterPanelOpen((current) => !current)}
        onFilterSelect={(filter) => {
          setActiveFilter(filter);
          setIsFilterPanelOpen(false);
        }}
        headingAs={headingAs}
        embedded={embedded}
      />

      <section className="mx-auto max-w-6xl px-4 py-7">
        {backLink ? (
          <div className="pb-5">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue transition-colors hover:text-neutral-700"
            >
              Retour au système
            </Link>
          </div>
        ) : null}
        <div className="flex items-center justify-end pb-5">
          {searchQuery || activeFilter !== "Tous" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Tous");
              }}
              className="text-xs font-medium text-dema-muted transition hover:text-dema-forest"
            >
              Réinitialiser
            </button>
          ) : null}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
            <h2 className="text-xl font-bold text-brand-blue">Aucun cours trouvé</h2>
            <p className="mt-3 text-sm font-normal text-dema-muted">
              Essayez un autre mot-clé ou un filtre plus large.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map((entry, index) => renderCourseCard(entry, index < 3))}
          </div>
        )}
      </section>

      {selectedCourse ? (
        <CourseSlidesDialog
          key={selectedCourse.slug}
          course={selectedCourse}
          detailHref={getCourseHref(selectedCourse)}
          onClose={() => setSelectedCourse(null)}
        />
      ) : null}
    </div>
  );
}
