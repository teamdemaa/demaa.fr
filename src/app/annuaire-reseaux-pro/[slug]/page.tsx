import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProNetworkDetailContent from "@/components/ProNetworkDetailContent";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getDemaaProNetworkBySlug, getDemaaProNetworks } from "@/lib/pro-network-catalog";
import { getRelatedSystemsForProNetworkSlug } from "@/lib/related-systems";

type ProNetworkDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    retourSysteme?: string | string[];
  }>;
};

export async function generateStaticParams() {
  return getDemaaProNetworks().map((network) => ({
    slug: network.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProNetworkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const network = getDemaaProNetworkBySlug(slug);

  if (!network) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${network.name} - Réseaux Pro Demaa`,
    description: network.description,
    alternates: {
      canonical: `/annuaire-reseaux-pro/${network.slug}`,
    },
    openGraph: {
      title: `${network.name} - Réseaux Pro Demaa`,
      description: network.description,
      url: `/annuaire-reseaux-pro/${network.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${network.name} - Réseaux Pro Demaa`,
      description: network.description,
    },
  };
}

export default async function ProNetworkDetailPage({
  params,
  searchParams,
}: ProNetworkDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const network = getDemaaProNetworkBySlug(slug);

  if (!network) {
    notFound();
  }

  const relatedSystems = getRelatedSystemsForProNetworkSlug(network.slug);
  const retourSysteme = getParamValue(resolvedSearchParams.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/kit-operationnel/${encodeURIComponent(returnEnterprise.slug)}`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : {
        href: "/annuaire-reseaux-pro",
        label: "Retour aux réseaux pro",
      };

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLink.label}
          </Link>

          <div className="mt-5">
            <ProNetworkDetailContent network={network} />
          </div>

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques kits opérationnels où ce réseau pro est particulièrement utile."
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
