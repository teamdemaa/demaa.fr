import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LearningProjectSeries from "@/components/LearningProjectSeries";
import { LEARNING_PROJECT_SERIES, getLearningProjectSeries } from "@/lib/academy-project-series";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type SeriesPageProps = Readonly<{ params: Promise<{ slug: string }> }>;
export const dynamicParams = false;

export function generateStaticParams() {
  return LEARNING_PROJECT_SERIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getLearningProjectSeries(slug);
  if (!project) notFound();
  return buildPublicPageMetadata({
    title: `${project.name} · Apprentissages | DEMAA`,
    description: project.description,
    path: `/tutoriels/${slug}`,
  });
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const project = getLearningProjectSeries(slug);
  if (!project) notFound();
  return <LearningProjectSeries project={project} />;
}
