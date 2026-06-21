import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import AccountingDirectoryClient from "@/components/AccountingDirectoryClient";
import {
  getAccountingDirectoryFacets,
  getAccountingFirms,
  type AccountingDirectoryFilters,
} from "@/lib/accounting-directory";
import {
  accountingDirectorySeoPages,
  getAccountingDirectorySeoPage,
} from "@/lib/accounting-directory-seo";

type AccountingDirectorySeoPageProps = {
  params: Promise<{
    kind: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return accountingDirectorySeoPages.map((page) => ({
    kind: page.kind,
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: AccountingDirectorySeoPageProps): Promise<Metadata> {
  const { kind, slug } = await params;
  const page = getAccountingDirectorySeoPage(kind, slug);

  if (!page) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${page.title} - Demaa`,
    description: page.description,
    alternates: {
      canonical: `/annuaire-experts-comptables/${page.kind}/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} - Demaa`,
      description: page.description,
      url: `/annuaire-experts-comptables/${page.kind}/${page.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} - Demaa`,
      description: page.description,
    },
  };
}

export default async function AccountingDirectorySeoPage({
  params,
}: AccountingDirectorySeoPageProps) {
  const { kind, slug } = await params;
  const page = getAccountingDirectorySeoPage(kind, slug);

  if (!page) {
    notFound();
  }

  const [firms, facets] = await Promise.all([
    getAccountingFirms(),
    getAccountingDirectoryFacets(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background animate-in fade-in duration-700">
        <AccountingDirectoryClient
          firms={firms}
          facets={facets}
          title={page.title}
          description={page.description}
          initialFilters={page.filters as AccountingDirectoryFilters}
        />
      </main>
    </>
  );
}
