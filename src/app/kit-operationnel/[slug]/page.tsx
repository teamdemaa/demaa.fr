import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import {
  getMigrationSafePublishedSolutionSectionsForSystem,
  getMigrationSafeRenderableSolutionSectionsForSystem,
} from "@/lib/firebase-solution-registry-selection.server";
import { normalizeSystemDetailTab } from "@/lib/system-detail-tabs";
import {
  buildSystemPageIntro,
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  getSystemDetailPageData,
} from "@/lib/system-detail-page";

type OperationalKitPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
export async function generateMetadata({
  params,
}: OperationalKitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [data, solutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getMigrationSafePublishedSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    return {
      title: "Système opérationnel introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildSystemPageMetadata(data, solutionSections);
}

export default async function OperationalKitPage({
  params,
  searchParams,
}: OperationalKitPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [data, solutionSections, publishedSolutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getMigrationSafeRenderableSolutionSectionsForSystem(slug),
    getMigrationSafePublishedSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    notFound();
  }

  const initialTab = getParamValue(resolvedSearchParams.tab);
  const jsonLd = buildSystemPageJsonLd(data, publishedSolutionSections);
  const hasEditableSystem = hasEditableOperationalSystemAsset(data.system.slug);

  if (!hasEditableSystem) {
    notFound();
  }

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <SystemDetailContent
            system={data.system}
            systeme={data.detail.systeme}
            intro={buildSystemPageIntro(data)}
            initialActiveTab={normalizeSystemDetailTab(initialTab)}
            headingAs="h1"
            solutionSections={solutionSections}
          />
        </div>
      </main>
    </>
  );
}
