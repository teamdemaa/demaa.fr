import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RecruitmentDetailContent from "@/components/RecruitmentDetailContent";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import {
  getDemaaRecruitmentItemBySlug,
  getDemaaRecruitmentItems,
} from "@/lib/recruitment-catalog";
import { getRelatedSystemsForRecruitmentSlug } from "@/lib/related-systems";

type RecruitmentDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getDemaaRecruitmentItems().map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: RecruitmentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getDemaaRecruitmentItemBySlug(slug);

  if (!item) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${item.name} - Annuaire recrutement Demaa`,
    description: item.description,
    alternates: {
      canonical: `/annuaire-recrutement/${item.slug}`,
    },
    openGraph: {
      title: `${item.name} - Annuaire recrutement Demaa`,
      description: item.description,
      url: `/annuaire-recrutement/${item.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} - Annuaire recrutement Demaa`,
      description: item.description,
    },
  };
}

export default async function RecruitmentDetailPage({
  params,
}: RecruitmentDetailPageProps) {
  const { slug } = await params;
  const item = getDemaaRecruitmentItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedSystems = getRelatedSystemsForRecruitmentSlug(item.slug);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/annuaire-recrutement"
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour au recrutement
          </Link>

          <div className="mt-5">
            <RecruitmentDetailContent item={item} />
          </div>

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où cette solution de recrutement revient souvent."
              systemTab="recrutement"
            />
          </section>
        </div>
      </main>
    </>
  );
}
