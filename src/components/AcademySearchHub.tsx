"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export type AcademySearchCard = Readonly<{
  category: string;
  image: string;
  imageAlt: string;
  slug: string;
  title: string;
}>;

export default function AcademySearchHub({
  courses,
}: {
  courses: readonly AcademySearchCard[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous les sujets");
  const [areCategoriesVisible, setAreCategoriesVisible] = useState(false);

  const categories = useMemo(
    () => ["Tous les sujets", ...Array.from(new Set(courses.map(({ category }) => category)))],
    [courses],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const visibleCourses = courses.filter((course) => {
    const matchesCategory = activeCategory === "Tous les sujets" || course.category === activeCategory;
    const matchesQuery = !normalizedQuery || [course.title, course.category]
      .some((value) => value.toLocaleLowerCase("fr").includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-[128rem] px-5 pb-16 pt-12 text-center sm:px-8 sm:pt-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h1
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span className="block font-sans font-light not-italic text-brand-blue/62">
              Organiser et piloter son entreprise,
            </span>
            <span className="demaa-hero-title block text-dema-forest">
              un sujet à la fois.
            </span>
          </h1>
        </div>

        <div className="relative mx-auto mt-7 max-w-4xl text-left md:mt-9">
          <div className="demaa-search-shell p-1.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/42"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une méthode, un sujet..."
                aria-label="Rechercher dans l’Académie"
                className="w-full rounded-full bg-dema-paper py-4 pl-14 pr-16 text-base text-brand-blue outline-none transition placeholder:text-brand-blue/30 md:py-5 md:pl-16 md:pr-20 md:text-lg"
              />
              <button
                type="button"
                onClick={() => setAreCategoriesVisible((visible) => !visible)}
                aria-expanded={areCategoriesVisible}
                aria-label={areCategoriesVisible ? "Masquer les thèmes" : "Afficher les thèmes"}
                className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition md:right-2.5 md:h-10 md:w-10 ${
                  areCategoriesVisible || activeCategory !== "Tous les sujets"
                    ? "bg-dema-sage text-dema-forest"
                    : "bg-dema-canvas text-dema-muted"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {areCategoriesVisible ? (
            <div className="mt-4 overflow-x-auto pb-1 soft-scroll" aria-label="Filtrer par thème">
              <div className="flex min-w-max gap-2 px-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`demaa-chip shrink-0 whitespace-nowrap ${
                      activeCategory === category ? "demaa-chip-active" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {visibleCourses.length ? (
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-11 text-left md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {visibleCourses.map((course, index) => (
              <Link
                key={course.slug}
                href={`/organiser/${course.slug}`}
                className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                aria-label={`Ouvrir le cours ${course.title}`}
              >
                <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                  <div className="relative aspect-video overflow-hidden rounded-[1.65rem] border border-dema-line/75 bg-[#F1F4F1]">
                    <Image
                      src={course.image}
                      alt={course.imageAlt}
                      fill
                      priority={index < 3}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-contain p-4 transition duration-300 group-hover:scale-[1.01] sm:p-5"
                      style={{
                        filter: "brightness(0) saturate(100%) invert(28%) sepia(20%) saturate(1080%) hue-rotate(103deg) brightness(86%) contrast(88%)",
                      }}
                    />
                  </div>
                  <div className="px-0.5 pb-1 pt-5">
                    <p className="text-[0.72rem] font-medium uppercase tracking-[0.15em] text-dema-forest/65 sm:text-[0.78rem]">
                      Méthode · {course.category}
                    </p>
                    <h2 className="mt-3 text-balance text-[1.55rem] font-light leading-[1.14] tracking-[-0.04em] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-[1.8rem] lg:text-[2rem]">
                      {course.title}
                    </h2>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mx-auto mt-12 max-w-xl rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper px-6 py-8 text-center text-dema-muted">
            Aucun sujet ne correspond à cette recherche.
          </p>
        )}
      </section>
    </main>
  );
}
