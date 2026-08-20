import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import AccountingFirmDetailContent from "@/components/AccountingFirmDetailContent";
import {
  getAccountingFirmBySlug,
  getAccountingFirms,
  getSimilarAccountingFirms,
} from "@/lib/accounting-directory";

type AccountingFirmDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const firms = await getAccountingFirms();

  return firms.map((firm) => ({
    slug: firm.slug,
  }));
}

export async function generateMetadata({
  params,
}: AccountingFirmDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const firm = await getAccountingFirmBySlug(slug);

  if (!firm) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${firm.name} - Expert-comptable - Demaa`,
    description: firm.description,
    alternates: {
      canonical: `/annuaire-experts-comptables/cabinets/${firm.slug}`,
    },
    openGraph: {
      title: `${firm.name} - Expert-comptable - Demaa`,
      description: firm.description,
      url: `/annuaire-experts-comptables/cabinets/${firm.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${firm.name} - Expert-comptable - Demaa`,
      description: firm.description,
    },
  };
}

export default async function AccountingFirmDetailPage({
  params,
}: AccountingFirmDetailPageProps) {
  const { slug } = await params;
  const firm = await getAccountingFirmBySlug(slug);

  if (!firm) {
    notFound();
  }

  const similarFirms = await getSimilarAccountingFirms(firm);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <AccountingFirmDetailContent firm={firm} similarFirms={similarFirms} />
      </main>
    </>
  );
}
