import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { getOperationalSystemDemoUrl } from "@/lib/document-models";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import { getAcademyVideosForSystem } from "@/lib/academy-video-catalog";
import { getRenderableSolutionSectionsForSystem } from "@/lib/system-solutions-ui.server";
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
    getRenderableSolutionSectionsForSystem(slug),
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
  const [data, solutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) {
    notFound();
  }

  const initialTab = getParamValue(resolvedSearchParams.tab);
  const jsonLd = buildSystemPageJsonLd(data, solutionSections);
  const hasEditableSystem = hasEditableOperationalSystemAsset(data.system.slug);
  const academyVideos = getAcademyVideosForSystem(data.system.slug).map(
    (video) => ({
      slug: video.slug,
      title: video.cardTitle,
      category: video.courseCategory,
    }),
  );

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
            demoUrl={getOperationalSystemDemoUrl(data.system.slug)}
            intro={buildSystemPageIntro(data)}
            initialActiveTab={normalizeSystemDetailTab(initialTab)}
            deliveryAvailable={hasEditableSystem}
            headingAs="h1"
            solutionSections={solutionSections}
            academyVideos={academyVideos}
          />
        </div>
      </main>
    </>
  );
}
