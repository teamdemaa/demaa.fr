import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyableModelDetails from "@/components/CopyableModelDetails";
import Navbar from "@/components/Navbar";
import {
  getPublishedCopyableModelBySlug,
  getPublishedCopyableModelRouteParams,
} from "@/lib/copyable-model-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type ModelPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedCopyableModelRouteParams();
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getPublishedCopyableModelBySlug(slug);
  if (!model) notFound();

  return buildPublicPageMetadata({
    title: model.seoTitle,
    description: model.seoDescription,
    path: `/modeles/${model.slug}`,
  });
}

export default async function ModelPage({ params, searchParams }: ModelPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;
  const source = Array.isArray(from) ? from[0] : from;
  const model = getPublishedCopyableModelBySlug(slug);
  if (!model) notFound();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <CopyableModelDetails
          backLink={source === "organisation"
            ? { href: "/modeles?from=organisation", label: "Retour aux modèles" }
            : undefined}
          model={model}
        />
      </main>
    </>
  );
}
