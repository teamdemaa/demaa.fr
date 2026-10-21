import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import AccountingDirectoryClient from "@/components/AccountingDirectoryClient";
import {
  getAccountingDirectoryFacets,
  getAccountingFirms,
} from "@/lib/accounting-directory";
import {
  accountingDirectorySeoPages,
  getAccountingDirectorySeoPage,
} from "@/lib/accounting-directory-seo-pages";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type AccountingDirectorySeoPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return accountingDirectorySeoPages.map((page) => ({ category: page.slug }));
}

export async function generateMetadata({
  params,
}: AccountingDirectorySeoPageProps): Promise<Metadata> {
  const { category } = await params;
  const seoPage = getAccountingDirectorySeoPage(category);

  if (!seoPage) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildPublicPageMetadata({
    title: `${seoPage.title} - Demaa`,
    description: seoPage.description,
    path: `/annuaire-experts-comptables/${seoPage.slug}`,
  });
}

export default async function AccountingDirectorySeoPage({
  params,
}: AccountingDirectorySeoPageProps) {
  const { category } = await params;
  const seoPage = getAccountingDirectorySeoPage(category);

  if (!seoPage) {
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
          title={seoPage.title}
          description={seoPage.description}
          initialFilters={seoPage.filters}
        />
      </main>
    </>
  );
}
