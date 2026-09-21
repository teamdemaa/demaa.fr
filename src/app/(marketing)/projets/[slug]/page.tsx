import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemaaStudioProjectPage } from "@/components/DemaaStudioLanding";
import {
  DEMAA_STUDIO_PROJECTS,
  getDemaaStudioProject,
} from "@/lib/demaa-studio-projects";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DEMAA_STUDIO_PROJECTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getDemaaStudioProject(slug);
  if (!project) return { title: "Projet introuvable | Demaa" };

  return buildPublicPageMetadata({
    title: `${project.name} | Projets Demaa`,
    description: project.summary,
    path: `/projets/${project.slug}`,
    keywords: [project.name, project.sector, "Demaa Studio"],
  });
}

export default async function DemaaStudioProjectRoute({ params }: Props) {
  const { slug } = await params;
  const project = getDemaaStudioProject(slug);
  if (!project) notFound();
  return <DemaaStudioProjectPage project={project} />;
}
