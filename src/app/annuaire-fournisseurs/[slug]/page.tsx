import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import SupplierDetailContent from "@/components/SupplierDetailContent";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { getRelatedSystemsForSupplierSlug } from "@/lib/related-systems";
import { demaaSuppliers, getDemaaSupplierBySlug } from "@/lib/supplier-catalog";

type SupplierDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    retourSysteme?: string | string[];
  }>;
};

export async function generateStaticParams() {
  return demaaSuppliers.map((supplier) => ({
    slug: supplier.slug,
  }));
}

export async function generateMetadata({
  params,
}: SupplierDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supplier = getDemaaSupplierBySlug(slug);

  if (!supplier) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${supplier.name} - Annuaire fournisseurs Demaa`,
    description: supplier.description,
    alternates: {
      canonical: `/annuaire-fournisseurs/${supplier.slug}`,
    },
    openGraph: {
      title: `${supplier.name} - Annuaire fournisseurs Demaa`,
      description: supplier.description,
      url: `/annuaire-fournisseurs/${supplier.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${supplier.name} - Annuaire fournisseurs Demaa`,
      description: supplier.description,
    },
  };
}

export default async function SupplierDetailPage({
  params,
  searchParams,
}: SupplierDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const supplier = getDemaaSupplierBySlug(slug);

  if (!supplier) {
    notFound();
  }

  const relatedSystems = getRelatedSystemsForSupplierSlug(supplier.slug);
  const retourSysteme = getParamValue(resolvedSearchParams.retourSysteme);
  const returnEnterprise = retourSysteme
    ? await getEnterpriseBySlug(retourSysteme)
    : null;
  const backLink = returnEnterprise
    ? {
        href: `/kit-operationnel/${encodeURIComponent(returnEnterprise.slug)}?tab=fournisseurs`,
        label: `Retour à ${returnEnterprise.name}`,
      }
    : {
        href: "/annuaire-fournisseurs",
        label: "Retour aux fournisseurs",
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
            <SupplierDetailContent supplier={supplier} />
          </div>

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où ce fournisseur revient souvent."
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
