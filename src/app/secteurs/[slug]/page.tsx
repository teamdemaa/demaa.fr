import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemsCatalogClient from "@/components/SystemsCatalogClient";
import { enterpriseToSystem, getEnterpriseCatalog } from "@/lib/enterprise-annuaire";
import { getSectorPageBySlug, sectorPageDefinitions } from "@/lib/sector-pages";
import { buildOperationalSystemDetails } from "@/lib/system-operations";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type SectorHubPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return sectorPageDefinitions.map((definition) => ({
    slug: definition.slug,
  }));
}

export async function generateMetadata({
  params,
}: SectorHubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sectorPage = getSectorPageBySlug(slug);

  if (!sectorPage) {
    return {
      title: "Secteur introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${sectorPage.title} - Demaa`,
    description: sectorPage.description,
    alternates: {
      canonical: `/secteurs/${sectorPage.slug}`,
    },
    openGraph: {
      title: `${sectorPage.title} - Demaa`,
      description: sectorPage.description,
      url: `/secteurs/${sectorPage.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${sectorPage.title} - Demaa`,
      description: sectorPage.description,
    },
  };
}

export default async function SectorHubPage({
  params,
}: SectorHubPageProps) {
  const { slug } = await params;
  const sectorPage = getSectorPageBySlug(slug);

  if (!sectorPage) {
    notFound();
  }

  const [enterprises, toolDirectory] = await Promise.all([
    getEnterpriseCatalog(),
    getUnifiedToolDirectory(),
  ]);
  const systems = enterprises.map(enterpriseToSystem);
  const detailsBySlug = await buildOperationalSystemDetails(systems, enterprises, toolDirectory);
  const sectorSystems = systems.filter(
    (system) => detailsBySlug[system.slug]?.sectorLabel === sectorPage.label,
  );
  const featuredSystems = sectorPage.featuredSystemSlugs
    .map((featuredSlug) => sectorSystems.find((system) => system.slug === featuredSlug))
    .filter((system): system is NonNullable<typeof system> => Boolean(system));

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour à l&apos;annuaire des systèmes
          </Link>

          <section className="mt-6 rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_60px_rgba(23,35,29,0.08)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {sectorPage.label}
            </p>
            <h1 className="mt-3 text-3xl font-normal tracking-tight text-brand-blue md:text-5xl">
              {sectorPage.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-dema-muted md:text-base">
              {sectorPage.intro}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {sectorPage.highlights.map((highlight) => (
                <Link
                  key={highlight.href}
                  href={highlight.href}
                  className="inline-flex rounded-full border border-dema-line bg-dema-cream/70 px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                >
                  {highlight.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.15rem] border border-dema-line bg-dema-cream/65 p-5">
                <h2 className="text-lg font-semibold text-brand-blue">
                  Priorités fréquentes
                </h2>
                <ul className="mt-4 space-y-3">
                  {sectorPage.priorities.map((priority) => (
                    <li
                      key={priority}
                      className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
                <h2 className="text-lg font-semibold text-brand-blue">
                  Systèmes représentatifs
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {featuredSystems.map((system) => (
                    <Link
                      key={system.slug}
                      href={`/systemes/${system.slug}`}
                      className="inline-flex rounded-full border border-dema-line bg-dema-cream/70 px-3 py-1.5 text-xs font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                    >
                      {system.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <SystemsCatalogClient
          systems={sectorSystems}
          detailsBySlug={detailsBySlug}
          showIntro={false}
          activeSector={sectorPage.label}
          showSearchBar={false}
        />
      </main>
    </>
  );
}
