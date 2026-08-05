import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { getOperationalSystemDemoUrl } from "@/lib/document-models";
import { hasEditableOperationalSystemAsset } from "@/lib/editable-operational-system-assets.server";
import { normalizeSystemDetailTab } from "@/lib/system-detail-tabs";
import {
  buildSystemPageIntro,
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  getSystemDetailPageData,
} from "@/lib/system-detail-page";

type OperationalSystemPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: OperationalSystemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    return {
      title: "Système opérationnel introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildSystemPageMetadata(data);
}

export default async function OperationalSystemPage({
  params,
  searchParams,
}: OperationalSystemPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    notFound();
  }

  const initialTab = getParamValue(resolvedSearchParams.tab);
  const jsonLd = buildSystemPageJsonLd(data);
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <SystemDetailContent
            system={data.system}
            detail={data.detail}
            demoUrl={getOperationalSystemDemoUrl(data.system.slug)}
            intro={buildSystemPageIntro(data)}
            initialActiveTab={normalizeSystemDetailTab(initialTab)}
            deliveryAvailable={hasEditableSystem}
            headingAs="h1"
          />
        </div>
      </main>
    </>
  );
}
