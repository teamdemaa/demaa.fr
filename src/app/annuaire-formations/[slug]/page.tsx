import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import TrainingDetailContent from "@/components/TrainingDetailContent";
import { getRelatedSystemsForTrainingSlug } from "@/lib/related-systems";
import { getDemaaTrainings, getDemaaTrainingBySlug } from "@/lib/training-catalog";

type TrainingDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getDemaaTrainings().map((training) => ({
    slug: training.slug,
  }));
}

export async function generateMetadata({
  params,
}: TrainingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const training = getDemaaTrainingBySlug(slug);

  if (!training) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${training.name} - Annuaire formations Demaa`,
    description: training.description,
    alternates: {
      canonical: `/annuaire-formations/${training.slug}`,
    },
    openGraph: {
      title: `${training.name} - Annuaire formations Demaa`,
      description: training.description,
      url: `/annuaire-formations/${training.slug}`,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${training.name} - Annuaire formations Demaa`,
      description: training.description,
    },
  };
}

export default async function TrainingDetailPage({
  params,
}: TrainingDetailPageProps) {
  const { slug } = await params;
  const training = getDemaaTrainingBySlug(slug);

  if (!training) {
    notFound();
  }

  const relatedSystems = getRelatedSystemsForTrainingSlug(training.slug);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/annuaire-formations"
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux formations
          </Link>

          <div className="mt-5">
            <TrainingDetailContent training={training} />
          </div>

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où cette formation revient souvent."
              systemTab="formation"
            />
          </section>
        </div>
      </main>
    </>
  );
}
