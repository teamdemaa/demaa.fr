"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, FileText, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import SystemResourcePreviewModal from "@/components/SystemResourcePreviewModal";
import { matchesSearchQuery } from "@/lib/search";
import { SYSTEM_RESOURCES, type SystemResource } from "@/lib/system-resource-catalog";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import AcademyLiveTrainingSection from "@/components/AcademyLiveTrainingSection";
import type { PublicLiveTraining } from "@/lib/live-session-catalog";

const ACADEMY_MODEL_RESOURCES = SYSTEM_RESOURCES
  .filter((resource) => resource.format === "template")
  .sort((left, right) => left.rank - right.rank);

type AcademyIndexClientProps = {
  contents: AcademyContentDefinition[];
  liveTrainings: readonly PublicLiveTraining[];
  embedded?: boolean;
  backLink?: {
    href: string;
    label: string;
  };
};

type CaseStudyPresentation = {
  title: string;
  sector: string;
  character: string;
  characterAlt: string;
  characterClassName?: string;
};

const CASE_STUDY_PRESENTATIONS: Record<string, CaseStudyPresentation> = {
  "cabinet-conseil-acquisition": {
    title: "Comment obtenir des demandes sans dépendre du bouche-à-oreille ?",
    sector: "Cabinet de conseil",
    character: "/images/marketing-ethique/personnages/personnage-01.png",
    characterAlt: "Entrepreneuse à la tête d’un cabinet de conseil",
  },
  "maintenance-informatique-acquisition": {
    title: "Comment ne plus perdre les demandes entrantes ?",
    sector: "Maintenance informatique",
    character: "/images/marketing-ethique/personnages/personnage-04.png",
    characterAlt: "Entrepreneur en maintenance informatique",
  },
  "cabinet-recrutement-acquisition": {
    title: "Comment obtenir des mandats sans prospecter au hasard ?",
    sector: "Cabinet de recrutement",
    character: "/images/marketing-ethique/personnages/personnage-05-v2.png",
    characterAlt: "Entrepreneuse à la tête d’un cabinet de recrutement",
  },
  "nettoyage-professionnel-acquisition": {
    title: "Comment remplir son planning avec des contrats récurrents ?",
    sector: "Nettoyage professionnel",
    character: "/images/marketing-ethique/personnages/personnage-03.png",
    characterAlt: "Entrepreneuse dans le nettoyage professionnel",
  },
  "formation-b2b-acquisition": {
    title: "Comment vendre une formation B2B sans forcer ?",
    sector: "Formation B2B",
    character: "/images/marketing-ethique/personnages/personnage-10-v2.png",
    characterAlt: "Formatrice B2B préparant une session",
  },
  "bureau-etudes-acquisition": {
    title: "Comment rendre une expertise technique facile à acheter ?",
    sector: "Bureau d’études",
    character: "/images/marketing-ethique/personnages/personnage-11-v2.png",
    characterAlt: "Expert d’un bureau d’études présentant sa méthode",
  },
};

const COURSE_TITLES: Record<string, string> = {
  "construire-systeme-marketing-vente": "Construire son système marketing",
};

const ALL_ACADEMY_CATEGORIES = "Tous";

function CourseDiagram({ slug }: { slug: string }) {
  if (slug === "piloter-sa-tresorerie") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <path d="M50 190H470" fill="none" stroke="#9FB3A7" strokeWidth="2" />
        <path
          d="M54 116L110 140L166 103L222 166L278 126L334 192L390 145L446 101L472 89"
          fill="none"
          stroke="#315F46"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="334" cy="192" r="10" fill="#F1F3F0" stroke="#315F46" strokeWidth="4" />
        <path d="M334 204V226" fill="none" stroke="#315F46" strokeWidth="2" strokeDasharray="3 5" />
      </svg>
    );
  }

  if (slug === "comprendre-chiffre-affaires-benefice") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <rect x="80" y="114" width="360" height="82" rx="18" fill="#FFFFFF" stroke="#9FB3A7" strokeWidth="2" />
        <path d="M80 158H358V196H98Q80 196 80 178Z" fill="#DCE5DF" />
        <path d="M358 158H440V178Q440 196 422 196H358Z" fill="#315F46" />
        <text x="260" y="143" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600" letterSpacing="1.5">
          CHIFFRE D’AFFAIRES
        </text>
        <text x="110" y="184" fill="#6E7C74" fontSize="14" fontWeight="500">CHARGES</text>
        <text x="399" y="184" textAnchor="middle" fill="#F1F3F0" fontSize="13" fontWeight="600">BÉNÉFICE</text>
      </svg>
    );
  }

  if (slug === "fixer-ses-prix-sans-vendre-a-perte") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <text x="58" y="82" fill="#315F46" fontSize="15" fontWeight="600" letterSpacing="1.5">
          COMPOSITION DU PRIX
        </text>
        <rect x="58" y="118" width="274" height="72" rx="17" fill="#DCE5DF" stroke="#A8BBB0" strokeWidth="2" />
        <path d="M238 118H315Q332 118 332 135V173Q332 190 315 190H238Z" fill="#C5D3C9" />
        <text x="148" y="162" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">COÛTS</text>
        <text x="285" y="162" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">MARGE</text>
        <path d="M352 154H422M407 138L423 154L407 170" fill="none" stroke="#315F46" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="456" y="160" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">PRIX</text>
      </svg>
    );
  }

  if (slug === "construire-systeme-marketing-vente") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <path d="M82 140H438" fill="none" stroke="#A8BBB0" strokeWidth="2" />
        <circle cx="90" cy="140" r="10" fill="#315F46" />
        <circle cx="260" cy="140" r="10" fill="#789987" />
        <circle cx="430" cy="140" r="10" fill="#315F46" />
        <text x="90" y="181" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">ATTIRER</text>
        <text x="90" y="203" textAnchor="middle" fill="#315F46" fontSize="10" fontWeight="500" opacity="0.5">LES BONS CLIENTS</text>
        <text x="260" y="181" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">FACILITER</text>
        <text x="260" y="203" textAnchor="middle" fill="#315F46" fontSize="10" fontWeight="500" opacity="0.5">L’ACHAT</text>
        <text x="430" y="181" textAnchor="middle" fill="#315F46" fontSize="15" fontWeight="600">FIDÉLISER</text>
        <text x="430" y="203" textAnchor="middle" fill="#315F46" fontSize="10" fontWeight="500" opacity="0.5">SUR LE LONG TERME</text>
      </svg>
    );
  }

  if (slug === "construire-offre-facile-a-acheter") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <rect x="42" y="116" width="122" height="60" rx="16" fill="#FFFFFF" stroke="#A8BBB0" strokeWidth="2" />
        <text x="103" y="151" textAnchor="middle" fill="#315F46" fontSize="13" fontWeight="600">PROBLÈME</text>
        <path d="M180 146H204M196 138L204 146L196 154" fill="none" stroke="#789987" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="220" y="103" width="148" height="86" rx="20" fill="#DCE5DF" stroke="#A8BBB0" strokeWidth="2" />
        <text x="294" y="141" textAnchor="middle" fill="#315F46" fontSize="13" fontWeight="600">OFFRE CLAIRE</text>
        <text x="294" y="162" textAnchor="middle" fill="#315F46" fontSize="10" fontWeight="500" opacity="0.55">RÉSULTAT · PÉRIMÈTRE</text>
        <path d="M384 146H408M400 138L408 146L400 154" fill="none" stroke="#789987" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="424" y="116" width="66" height="60" rx="16" fill="#315F46" />
        <text x="457" y="151" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600">CHOIX</text>
      </svg>
    );
  }

  if (slug === "livrer-prestation-sans-tout-reinventer") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <path d="M62 140H458" fill="none" stroke="#A8BBB0" strokeWidth="2" />
        <circle cx="68" cy="140" r="10" fill="#315F46" />
        <circle cx="196" cy="140" r="10" fill="#789987" />
        <circle cx="324" cy="140" r="10" fill="#789987" />
        <circle cx="452" cy="140" r="10" fill="#315F46" />
        <text x="68" y="184" textAnchor="middle" fill="#315F46" fontSize="12" fontWeight="600">DÉMARRER</text>
        <text x="196" y="184" textAnchor="middle" fill="#315F46" fontSize="12" fontWeight="600">PRODUIRE</text>
        <text x="324" y="184" textAnchor="middle" fill="#315F46" fontSize="12" fontWeight="600">VALIDER</text>
        <text x="452" y="184" textAnchor="middle" fill="#315F46" fontSize="12" fontWeight="600">CLÔTURER</text>
      </svg>
    );
  }

  if (slug === "transformer-demande-en-client") {
    return (
      <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
        <path d="M90 48H430L402 106H118Z" fill="#FFFFFF" stroke="#A8BBB0" strokeWidth="2" />
        <path d="M126 118H394L367 176H153Z" fill="#DCE5DF" stroke="#A8BBB0" strokeWidth="2" />
        <path d="M162 188H358L326 246H194Z" fill="#315F46" />
        <text x="260" y="83" textAnchor="middle" fill="#315F46" fontSize="14" fontWeight="600">DEMANDES</text>
        <text x="260" y="153" textAnchor="middle" fill="#315F46" fontSize="14" fontWeight="600">ÉCHANGES</text>
        <text x="260" y="223" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="600">CLIENTS</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 520 292.5" className="h-full w-full" aria-hidden="true">
      <rect x="45" y="64" width="120" height="50" rx="25" fill="#FFFFFF" stroke="#A8BBB0" strokeWidth="2" />
      <text x="105" y="95" textAnchor="middle" fill="#315F46" fontSize="13" fontWeight="600">OBJECTIF</text>
      <text x="185" y="97" textAnchor="middle" fill="#315F46" fontSize="22" fontWeight="300">+</text>
      <rect x="205" y="64" width="130" height="50" rx="25" fill="#DCE5DF" stroke="#A8BBB0" strokeWidth="2" />
      <text x="270" y="95" textAnchor="middle" fill="#315F46" fontSize="13" fontWeight="600">AUTONOMIE</text>
      <text x="355" y="97" textAnchor="middle" fill="#315F46" fontSize="22" fontWeight="300">+</text>
      <rect x="375" y="64" width="100" height="50" rx="25" fill="#FFFFFF" stroke="#A8BBB0" strokeWidth="2" />
      <text x="425" y="95" textAnchor="middle" fill="#315F46" fontSize="13" fontWeight="600">SUIVI</text>
      <path
        d="M55 122C55 133 65 138 82 138H232C251 138 260 144 270 155C280 144 289 138 308 138H448C465 138 475 133 475 122"
        fill="none"
        stroke="#789987"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M270 155V170M260 162L270 172L280 162" fill="none" stroke="#789987" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="158" y="180" width="224" height="64" rx="32" fill="#315F46" />
      <text x="270" y="219" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="600">RÉSULTAT</text>
    </svg>
  );
}

function AcademyCard({ content, eager = false }: { content: AcademyContentDefinition; eager?: boolean }) {
  const { identity, kind } = content;
  const isCaseStudy = kind === "case-study";
  const caseStudy = isCaseStudy ? CASE_STUDY_PRESENTATIONS[identity.slug] : undefined;
  const title = caseStudy?.title ?? COURSE_TITLES[identity.slug] ?? identity.card.title;
  const meta = caseStudy
    ? `${caseStudy.sector} · ${identity.durationMinutes} min`
    : `${identity.durationMinutes} min`;

  return (
    <Link
      href={`/academie/${identity.slug}`}
      className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
      aria-label={`Ouvrir ${title}`}
    >
      <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
        <div
          className={`relative aspect-video overflow-hidden rounded-[1.25rem] transition-colors duration-200 ${
            isCaseStudy ? "bg-dema-forest" : "border border-[#E7EBE8] bg-[#F1F3F0]"
          }`}
        >
          {caseStudy ? (
            <div className="absolute inset-4 flex items-center justify-center overflow-hidden sm:inset-[1.125rem]">
              <div className="relative aspect-square h-full overflow-hidden">
                <Image
                  src={caseStudy.character}
                  alt={caseStudy.characterAlt}
                  fill
                  priority={eager}
                  sizes="(max-width: 767px) 80vw, (max-width: 1199px) 40vw, 25vw"
                  className={`object-contain ${caseStudy.characterClassName ?? ""}`}
                />
              </div>
            </div>
          ) : (
            <CourseDiagram slug={identity.slug} />
          )}
        </div>

        <div className="px-0.5 pb-1 pt-3.5">
          <h3 className="text-[1.05rem] font-semibold leading-[1.3] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-lg">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-dema-muted">{meta}</p>
        </div>
      </article>
    </Link>
  );
}

export default function AcademyIndexClient({
  contents,
  liveTrainings,
  embedded = false,
  backLink,
}: AcademyIndexClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllFundamentals, setShowAllFundamentals] = useState(false);
  const [activeCategory, setActiveCategory] = useState(ALL_ACADEMY_CATEGORIES);
  const [areCategoryTagsVisible, setAreCategoryTagsVisible] = useState(false);
  const [previewResource, setPreviewResource] = useState<SystemResource | null>(null);

  const categories = useMemo(
    () => [
      ALL_ACADEMY_CATEGORIES,
      ...Array.from(new Set(contents.map((content) => content.identity.category))),
    ],
    [contents],
  );

  const filteredContents = useMemo(() => {
    return contents.filter((content) => {
      const matchesCategory =
        activeCategory === ALL_ACADEMY_CATEGORIES ||
        content.identity.category === activeCategory;
      const matchesQuery = matchesSearchQuery(searchQuery, [
          content.identity.title,
          content.identity.shortTitle,
          content.identity.category,
          content.identity.promise,
          content.identity.audience,
          CASE_STUDY_PRESENTATIONS[content.identity.slug]?.title,
          CASE_STUDY_PRESENTATIONS[content.identity.slug]?.sector,
          ...content.recap.points,
        ]);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, contents, searchQuery]);

  const fundamentals = filteredContents.filter((content) => content.kind === "course");
  const isSearching = searchQuery.trim().length > 0;
  const visibleFundamentals = embedded || isSearching || showAllFundamentals ? fundamentals : fundamentals.slice(0, 6);
  const canToggleFundamentals = !embedded && !isSearching && fundamentals.length > 6;
  const ContentContainer = embedded ? "div" : "main";
  const searchControl = (
    <div className={`relative w-full ${embedded ? "max-w-md" : "mx-auto mt-9 max-w-4xl md:mt-11"}`}>
      <div className={`demaa-search-shell ${embedded ? "p-1" : "p-1.5"}`}>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-dema-forest/42 ${embedded ? "h-4 w-4" : "h-5 w-5"}`}
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Rechercher dans l’Académie"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setActiveCategory(ALL_ACADEMY_CATEGORIES);
            }}
            placeholder="Rechercher un cours ou une question…"
            className={`w-full rounded-full bg-dema-paper pl-11 pr-12 text-brand-blue outline-none transition placeholder:text-brand-blue/30 ${embedded ? "min-h-10 text-sm" : "py-4 text-base md:py-5 md:pl-16 md:pr-20 md:text-lg"}`}
          />
          <button
            type="button"
            onClick={() => setAreCategoryTagsVisible((visible) => !visible)}
            aria-expanded={areCategoryTagsVisible}
            aria-label={areCategoryTagsVisible ? "Masquer les catégories" : "Afficher les catégories"}
            className={`absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full transition ${embedded ? "h-9 w-9" : "h-9 w-9 md:right-2.5 md:h-10 md:w-10"} ${
              areCategoryTagsVisible || activeCategory !== ALL_ACADEMY_CATEGORIES
                ? "bg-dema-sage text-dema-forest"
                : "bg-dema-canvas text-dema-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {areCategoryTagsVisible ? (
        <div className={`${embedded ? "absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-dema-line bg-dema-paper p-2 shadow-[0_18px_46px_rgba(23,35,29,0.12)]" : "mt-4 overflow-x-auto pb-1 text-left soft-scroll"}`} aria-label="Filtrer les cours par catégorie">
          <div className={`flex gap-2 ${embedded ? "flex-wrap" : "min-w-max px-1"}`}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => {
                  setActiveCategory(category);
                  setSearchQuery("");
                  if (embedded) setAreCategoryTagsVisible(false);
                }}
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
  );

  return (
    <div className={`${embedded ? "min-h-[60vh]" : "min-h-[85vh]"} bg-[#FAFAFA]`}>
      {embedded ? (
        <div className="mx-auto max-w-7xl px-4 pb-6">
          {searchControl}
        </div>
      ) : null}
      {!embedded ? (
      <header className="px-4 pb-12 pt-12 md:pb-16 md:pt-16">
        <div className="mx-auto max-w-7xl">
          {backLink ? (
            <Link
              href={backLink.href}
              className="mb-8 inline-flex text-sm font-medium text-dema-muted transition hover:text-dema-forest"
            >
              {backLink.label}
            </Link>
          ) : null}

          <div className="text-center">
            <h1
              className="text-balance font-light leading-[0.94] tracking-tight"
              style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
            >
              <span className="block text-brand-blue/62">Apprendre à</span>
              <span className="demaa-hero-title block text-dema-forest">entreprendre</span>
            </h1>
          </div>

          {searchControl}
        </div>
      </header>
      ) : null}

      <ContentContainer className={`mx-auto max-w-7xl px-4 pb-16 md:pb-20 ${embedded ? "pt-0" : ""}`}>
        {fundamentals.length ? (
          <section aria-labelledby="fundamental-courses-title">
            <h2 id="fundamental-courses-title" className="text-2xl font-semibold text-brand-blue md:text-[2rem]">
              Cours fondamentaux
            </h2>

            <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {visibleFundamentals.map((content, index) => (
                <AcademyCard key={content.identity.slug} content={content} eager={index < 3} />
              ))}
            </div>

            {canToggleFundamentals ? (
              <div className="mt-7 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllFundamentals((current) => !current)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
                  aria-expanded={showAllFundamentals}
                >
                  {showAllFundamentals ? "Voir moins" : "Voir plus de cours"}
                  {showAllFundamentals ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        <AcademyLiveTrainingSection trainings={liveTrainings} />

        {ACADEMY_MODEL_RESOURCES.length ? (
          <section className="mt-12 border-t border-dema-line/75 pt-9 md:mt-14 md:pt-10" aria-labelledby="academy-models-title">
            <h2 id="academy-models-title" className="text-2xl font-semibold text-brand-blue md:text-[2rem]">
              Modèles et documents
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
              Les mêmes modèles que dans vos systèmes métier, avec un aperçu avant ouverture.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
              {ACADEMY_MODEL_RESOURCES.map((resource) => {
                const className = "group block rounded-[1.25rem] border border-[#E7EBE8] bg-[#F1F3F0] p-6 text-left transition hover:border-dema-forest/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";
                const content = (
                  <>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-dema-forest">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.15em] text-dema-muted">
                    {resource.formatLabel}
                  </span>
                  <span className="mt-1.5 block text-lg font-semibold leading-snug text-brand-blue transition-colors group-hover:text-dema-forest">
                    {resource.title}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-dema-muted">
                    {resource.description}
                  </span>
                  </>
                );

                return resource.resourceSlug === "recapitulatif-systeme" ? (
                  <Link
                    key={resource.resourceSlug}
                    href="/systemes"
                    className={className}
                    aria-label="Choisir un système pour voir son récapitulatif"
                  >
                    {content}
                    <span className="mt-4 block text-sm font-medium text-dema-forest">
                      Choisir un système
                    </span>
                  </Link>
                ) : (
                  <button
                    key={resource.resourceSlug}
                    type="button"
                    onClick={() => setPreviewResource(resource)}
                    className={className}
                    aria-label={`Voir un aperçu de ${resource.title}`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {filteredContents.length === 0 ? (
          <section className="rounded-[1.25rem] border border-dashed border-dema-line bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-brand-blue">Aucun cours trouvé</h2>
            <p className="mt-2 text-sm text-dema-muted">Essayez un mot plus simple ou un autre sujet.</p>
          </section>
        ) : null}

        <div className="mt-12 md:mt-14">
          <StructureNewsletterBlock />
        </div>

        {previewResource ? (
          <SystemResourcePreviewModal
            resource={previewResource}
            trackingContext="academie"
            onClose={() => setPreviewResource(null)}
          />
        ) : null}
      </ContentContainer>
    </div>
  );
}
