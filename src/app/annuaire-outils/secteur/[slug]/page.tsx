import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ToolDirectoryClient from "@/components/ToolDirectoryClient";
import {
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import {
  getEnterpriseBySlug,
  getEnterpriseCatalog,
} from "@/lib/enterprise-annuaire-server";
import { getFreeToolsForSector } from "@/lib/free-tools";
import { getSectorPageByLabel } from "@/lib/sector-pages";
import {
  getSectorHubPath,
  getSectorTaxonomyBySeoSlug,
  sectorTaxonomy,
} from "@/lib/sector-taxonomy";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";
import { withSoftwareDetailUrls } from "@/lib/tool-directory-page";

type ToolSectorPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ retourSysteme?: string | string[] }>;
};

export async function generateStaticParams() {
  return sectorTaxonomy.map((sector) => ({
    slug: sector.seoSlug,
  }));
}

export async function generateMetadata({
  params,
}: ToolSectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSectorTaxonomyBySeoSlug(slug);

  if (!sector) {
    return {
      title: "Secteur introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `Outils pour ${sector.publicLabel} - Demaa`;
  const description =
    sector.fallbackMode === "exact"
      ? `Explorez les outils et logiciels utiles pour les activités de ${sector.publicLabel.toLowerCase()}.`
      : `Découvrez une sélection d'outils utiles pour les activités de ${sector.publicLabel.toLowerCase()}, avec une approche pratique pour démarrer.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/annuaire-outils/secteur/${sector.seoSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `/annuaire-outils/secteur/${sector.seoSlug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const SITE_URL = "https://demaa.fr";

function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${SITE_URL}${url}`;
}

export default async function ToolSectorPage({
  params,
  searchParams,
}: ToolSectorPageProps) {
  const { slug } = await params;
  const sector = getSectorTaxonomyBySeoSlug(slug);

  if (!sector) {
    notFound();
  }

  const sectorPage = getSectorPageByLabel(sector.publicLabel);
  const retourSysteme = getParamValue((await searchParams).retourSysteme);
  const [toolDirectory, enterprises, returnEnterprise] = await Promise.all([
    getUnifiedToolDirectory(),
    getEnterpriseCatalog(),
    retourSysteme ? getEnterpriseBySlug(retourSysteme) : Promise.resolve(null),
  ]);

  const tools =
    sector.fallbackMode === "exact" && sector.toolSectorLabel
      ? toolDirectory.filter((tool) => tool.sectors.includes(sector.toolSectorLabel!))
      : getFreeToolsForSector(sector.publicLabel);

  const directoryTools = withSoftwareDetailUrls(tools);
  const categories = ["Tous", ...Array.from(new Set(directoryTools.map((tool) => tool.category)))];
  const featuredSystems = sectorPage?.featuredSystemSlugs
    .map((featuredSlug) =>
      enterprises.find(
        (enterprise) =>
          enterprise.slug === featuredSlug && enterprise.sectorLabel === sector.publicLabel,
      ) ?? null,
    )
    .map((enterprise) => (enterprise ? enterpriseToSystem(enterprise) : null))
    .filter((system): system is NonNullable<typeof system> => Boolean(system)) ?? [];
  const sectorHubPath = getSectorHubPath(sector.publicLabel) ?? "/secteurs";
  const backLink = returnEnterprise
    ? {
        href: `/kit-operationnel/${encodeURIComponent(returnEnterprise.slug)}?tab=outils`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : {
        href: sectorHubPath,
        label: `Retour au secteur ${sector.publicLabel}`,
      };
  const canonicalUrl = `${SITE_URL}/annuaire-outils/secteur/${sector.seoSlug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Outils pour ${sector.publicLabel}`,
      description:
        sectorPage?.description ??
        `Sélection d'outils utiles pour les activités de ${sector.publicLabel.toLowerCase()}.`,
      url: canonicalUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Outils pour ${sector.publicLabel}`,
      itemListElement: directoryTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: toAbsoluteUrl(tool.detailUrl ?? tool.url),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Annuaire outils",
          item: `${SITE_URL}/annuaire-outils`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `Outils pour ${sector.publicLabel}`,
          item: canonicalUrl,
        },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-8 pt-8 md:pb-10 md:pt-10">
          <div className="mx-auto max-w-5xl">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue/60 transition hover:text-dema-forest"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLink.label}
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                {sector.fallbackMode === "exact" ? "Selection secteur" : "Selection pratique"}
              </span>
              <span className="rounded-full bg-dema-paper px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-blue/70">
                {directoryTools.length} outil{directoryTools.length > 1 ? "s" : ""}
              </span>
            </div>

            <h1 className="mt-4 demaa-section-title text-4xl tracking-tight text-brand-blue md:text-5xl">
              Outils pour {sector.publicLabel}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-dema-muted md:text-base">
              {sectorPage?.intro ??
                `Une sélection d'outils utiles pour les activités de ${sector.publicLabel.toLowerCase()}.`}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-dema-muted">
              {sector.fallbackMode === "exact"
                ? "Cette page regroupe les outils déjà classés dans ce secteur au sein de l'annuaire Demaa."
                : "Cette page propose une sélection transversale utile pour démarrer, en attendant un classement sectoriel plus fin dans l'annuaire."}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/annuaire-outils"
                className="inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              >
                Voir l&apos;annuaire complet
              </Link>
              <Link
                href={sectorHubPath}
                className="inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              >
                Voir le hub secteur
              </Link>
            </div>

            {sectorPage?.priorities?.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {sectorPage.priorities.map((priority) => (
                  <div
                    key={priority}
                    className="rounded-[1rem] border border-dema-line bg-dema-paper p-4 text-sm leading-relaxed text-dema-muted"
                  >
                    <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    {priority}
                  </div>
                ))}
              </div>
            ) : null}

            {sectorPage?.highlights?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {sectorPage.highlights
                  .filter((highlight) => !highlight.href.startsWith("/annuaire-outils"))
                  .map((highlight) => (
                    <Link
                      key={highlight.href}
                      href={highlight.href}
                      className="inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      {highlight.label}
                    </Link>
                  ))}
              </div>
            ) : null}

            {featuredSystems.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredSystems.map((system) => (
                  <Link
                    key={system.slug}
                    href={`/kit-operationnel/${system.slug}`}
                    className="inline-flex rounded-full bg-brand-blue px-3 py-1.5 text-xs font-medium text-white transition hover:bg-dema-forest"
                  >
                    Voir {system.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <ToolDirectoryClient
          key={sector.seoSlug}
          title={`Outils pour ${sector.publicLabel}`}
          description={
            sectorPage?.description ??
            `Sélection d'outils utiles pour les activités de ${sector.publicLabel.toLowerCase()}.`
          }
          searchPlaceholder="Rechercher un outil, un logiciel, un usage..."
          items={directoryTools}
          sectors={["Tous"]}
          categories={categories}
          showHeader={false}
          showSearchBar={false}
          showSectorTags={false}
          hideTransverseOnSector={false}
          externalLinks={false}
        />
      </main>
    </>
  );
}
