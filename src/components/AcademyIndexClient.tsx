"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import { matchesSearchQuery } from "@/lib/search";

type AcademyIndexClientProps = {
  contents: AcademyContentDefinition[];
  backLink?: {
    href: string;
    label: string;
  };
};

const DEEP_EUCALYPTUS_CARD_BACKGROUND = "#6F8F7B";
const LIGHT_CARD_BACKGROUND = "#F1F3F0";
const INTERMEDIATE_CARD_BACKGROUND = "#D7E1D9";
const CASE_STUDY_CARD_BACKGROUND = "#F1F3F0";
const SAGE_ILLUSTRATION_FILTER =
  "brightness(0) saturate(100%) invert(97%) sepia(2%) saturate(275%) hue-rotate(66deg) brightness(98%) contrast(93%)";
const FOREST_ILLUSTRATION_FILTER =
  "brightness(0) saturate(100%) invert(32%) sepia(18%) saturate(1048%) hue-rotate(96deg) brightness(89%) contrast(86%)";
const LIGHT_CARD_SLUGS = new Set([
  "comprendre-chiffre-affaires-benefice",
  "construire-systeme-marketing-vente",
]);
const INTERMEDIATE_CARD_SLUGS = new Set([
  "fixer-ses-prix-sans-vendre-a-perte",
  "transformer-demande-en-client",
]);

function getIllustrationFilter(usesDarkIllustration: boolean) {
  return usesDarkIllustration ? FOREST_ILLUSTRATION_FILTER : SAGE_ILLUSTRATION_FILTER;
}

function AcademyCard({ content, eager = false }: { content: AcademyContentDefinition; eager?: boolean }) {
  const { identity, kind } = content;
  const isCaseStudy = kind === "case-study";
  const isEditorialThumbnail = identity.card.image?.startsWith("/images/academy/thumbnails/") ?? false;
  const isLightCard = !isCaseStudy && LIGHT_CARD_SLUGS.has(identity.slug);
  const isIntermediateCard = !isCaseStudy && INTERMEDIATE_CARD_SLUGS.has(identity.slug);
  const usesDarkIllustration = isLightCard || isIntermediateCard;

  return (
    <Link
      href={`/academie/${identity.slug}`}
      className="group block rounded-[1.2rem] focus-visible:outline-none"
      aria-label={`Ouvrir le cours ${identity.card.title}`}
    >
      <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-[1.2rem] border border-[#ECEEED] transition-colors duration-200 group-hover:border-dema-forest/55"
          style={{
            backgroundColor: isCaseStudy
              ? CASE_STUDY_CARD_BACKGROUND
              : isLightCard
                ? LIGHT_CARD_BACKGROUND
                : isIntermediateCard
                  ? INTERMEDIATE_CARD_BACKGROUND
                  : DEEP_EUCALYPTUS_CARD_BACKGROUND,
          }}
        >
          {identity.card.image && isCaseStudy ? (
            <div className="absolute left-0 top-1/2 aspect-[3/2] w-full -translate-y-1/2 overflow-hidden">
              <Image
                src={identity.card.image}
                alt={identity.card.imageAlt}
                width={1536}
                height={1024}
                priority={eager}
                sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                className="absolute max-w-none"
                style={{ width: "200%", height: "auto", left: 0, top: 0 }}
              />
            </div>
          ) : identity.card.image ? (
            <Image
              src={identity.card.image}
              alt={identity.card.imageAlt}
              fill
              priority={eager}
              sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
              className={isEditorialThumbnail ? "object-cover" : "object-contain p-5 opacity-[0.94] sm:p-6"}
              style={
                isEditorialThumbnail
                  ? undefined
                  : { filter: getIllustrationFilter(usesDarkIllustration) }
              }
            />
          ) : null}
        </div>

        <div className="px-0.5 pb-2 pt-3.5">
          <h3 className="text-[1.05rem] font-semibold leading-snug text-brand-blue transition-colors group-hover:text-dema-forest sm:text-lg">
            {identity.card.title}
          </h3>
          <p className="mt-1 text-sm text-dema-muted">{identity.card.meta}</p>
        </div>
      </article>
    </Link>
  );
}

export default function AcademyIndexClient({ contents, backLink }: AcademyIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContents = useMemo(() => {
    return contents.filter((content) =>
      matchesSearchQuery(searchQuery, [
        content.identity.title,
        content.identity.shortTitle,
        content.identity.category,
        content.identity.promise,
        content.identity.audience,
        ...content.recap.points,
      ]),
    );
  }, [contents, searchQuery]);

  const fundamentals = filteredContents.filter((content) => content.kind === "course");
  const caseStudies = filteredContents.filter((content) => content.kind === "case-study");

  return (
    <div className="min-h-[85vh] bg-dema-cream">
      <header className="border-b border-dema-line/65 px-4 pb-8 pt-9 md:pb-10 md:pt-12">
        <div className="mx-auto max-w-6xl">
          {backLink ? (
            <Link
              href={backLink.href}
              className="mb-7 inline-flex text-sm font-medium text-dema-muted transition hover:text-dema-forest"
            >
              {backLink.label}
            </Link>
          ) : null}

          <div className="text-center">
            <h1 className="text-balance text-4xl font-light tracking-[-0.045em] text-brand-blue md:text-5xl">
              Apprendre à <span className="demaa-section-title text-dema-forest">entreprendre.</span>
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-dema-muted sm:text-base">
              Des cours courts et concrets pour comprendre, décider et agir.
            </p>
          </div>

          <label className="demaa-search-shell mx-auto mt-6 flex max-w-4xl items-center gap-3 px-4 py-2.5 md:mt-7 md:px-5">
            <Search className="h-5 w-5 shrink-0 text-dema-muted" aria-hidden="true" />
            <span className="sr-only">Rechercher dans l’Académie</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un sujet..."
              className="min-w-0 flex-1 bg-transparent py-1 text-base text-brand-blue outline-none placeholder:text-dema-muted/70"
            />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-4 py-9 md:space-y-14 md:py-12">
        {fundamentals.length ? (
          <section aria-labelledby="fundamental-courses-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                  Commencer simplement
                </p>
                <h2 id="fundamental-courses-title" className="mt-1 text-2xl font-semibold text-brand-blue">
                  Cours fondamentaux
                </h2>
              </div>
              <p className="hidden text-sm text-dema-muted sm:block">À suivre dans l’ordre que vous voulez</p>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {fundamentals.map((content) => (
                <AcademyCard key={content.identity.slug} content={content} eager />
              ))}
            </div>
          </section>
        ) : null}

        {caseStudies.length ? (
          <section aria-labelledby="case-studies-title">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                Voir la méthode en situation
              </p>
              <h2 id="case-studies-title" className="mt-1 text-2xl font-semibold text-brand-blue">
                Cas concrets
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((content) => (
                <AcademyCard key={content.identity.slug} content={content} />
              ))}
            </div>
          </section>
        ) : null}

        {filteredContents.length === 0 ? (
          <section className="rounded-[1.25rem] border border-dashed border-dema-line bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-brand-blue">Aucun cours trouvé</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un mot plus simple ou un autre sujet.</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
