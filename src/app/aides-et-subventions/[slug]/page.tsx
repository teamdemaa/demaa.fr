import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import AidDetailContent from "@/components/AidDetailContent";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  aidFamilies,
  demaaAidItems,
  getAidFamilyBySlug,
  getAidItemsByFamily,
  getDemaaAidBySlug,
} from "@/lib/aid-catalog";
import {
  getRelatedSystemsForAidFamilySlug,
  getRelatedSystemsForAidSlug,
} from "@/lib/related-systems";

type AidDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    retourSysteme?: string | string[];
  }>;
};

export async function generateStaticParams() {
  return [
    ...aidFamilies.map((family) => ({ slug: family.slug })),
    ...demaaAidItems.map((item) => ({ slug: item.slug })),
  ];
}

export async function generateMetadata({
  params,
}: AidDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const family = getAidFamilyBySlug(slug);
  const item = getDemaaAidBySlug(slug);

  if (!family && !item) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  if (family) {
    return {
      title: `${family.name} - Aides et subventions Demaa`,
      description: family.description,
      alternates: {
        canonical: `/aides-et-subventions/${family.slug}`,
      },
      openGraph: {
        title: `${family.name} - Aides et subventions Demaa`,
        description: family.description,
        url: `/aides-et-subventions/${family.slug}`,
        siteName: "Demaa",
        locale: "fr_FR",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${family.name} - Aides et subventions Demaa`,
        description: family.description,
      },
    };
  }

  return {
    title: `${item!.name} - Aides et subventions Demaa`,
    description: item!.description,
    alternates: {
      canonical: `/aides-et-subventions/${item!.slug}`,
    },
    openGraph: {
      title: `${item!.name} - Aides et subventions Demaa`,
      description: item!.description,
      url: `/aides-et-subventions/${item!.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item!.name} - Aides et subventions Demaa`,
      description: item!.description,
    },
  };
}

export default async function AidDetailPage({
  params,
  searchParams,
}: AidDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const returnSystemSlug = getParamValue(resolvedSearchParams?.retourSysteme);
  const returnSystemQuery = returnSystemSlug
    ? `?retourSysteme=${encodeURIComponent(returnSystemSlug)}`
    : "";
  const family = getAidFamilyBySlug(slug);
  const item = getDemaaAidBySlug(slug);

  if (!family && !item) {
    notFound();
  }

  if (family) {
    const familyItems = getAidItemsByFamily(family.name);
    const relatedSystems = getRelatedSystemsForAidFamilySlug(family.slug);

    return (
      <>
        <Navbar />
        <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
          <div className="mx-auto max-w-6xl">
            <Link
              href={`/aides-et-subventions${returnSystemQuery}`}
              className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Retour aux aides
            </Link>

            <section className="mt-5 rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <ServiceIcon icon={family.icon} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                    Famille
                  </p>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
                  {family.name}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
                  {family.description}
                </p>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {familyItems.map((familyItem) => (
                <Link
                  key={familyItem.slug}
                  href={`/aides-et-subventions/${familyItem.slug}${returnSystemQuery}`}
                  className="demaa-card group flex min-h-[15rem] flex-col rounded-[1.15rem] p-5 text-left"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                    <ServiceIcon icon={familyItem.icon} className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                    {familyItem.type}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
                    {familyItem.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                    {familyItem.shortDescription}
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-dema-forest">
                      Voir la fiche
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </section>

            <section className="mt-5">
              <RelatedSystemsLinks
                systems={relatedSystems}
                description="Quelques kits opérationnels où cette famille d'aides peut être utile."
                systemTab="financement"
              />
            </section>
          </div>
        </main>
      </>
    );
  }

  const relatedSystems = getRelatedSystemsForAidSlug(item!.slug);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/aides-et-subventions${returnSystemQuery}`}
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux aides
          </Link>

          <div className="mt-5">
            <AidDetailContent item={item!} returnSystemSlug={returnSystemSlug ?? undefined} />
          </div>

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques kits opérationnels où ce sujet d'aide ou de subvention peut être pertinent."
              systemTab="financement"
            />
          </section>
        </div>
      </main>
    </>
  );
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
