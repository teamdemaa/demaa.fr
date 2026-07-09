import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemDetailContent from "@/components/SystemDetailContent";
import { isSystemDetailTab } from "@/lib/system-detail-tabs";
import {
  buildSystemPageIntro,
  buildSystemPageJsonLd,
  buildSystemPageMetadata,
  getSystemDetailPageData,
} from "@/lib/system-detail-page";

type SystemDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: SystemDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    return {
      title: "Système introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildSystemPageMetadata(data);
}

export default async function SystemDetailPage({
  params,
  searchParams,
}: SystemDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    notFound();
  }

  const initialTab = getParamValue(resolvedSearchParams.tab);
  const normalizedInitialTab = initialTab === "cours" ? "ressources" : initialTab;
  const jsonLd = buildSystemPageJsonLd(data);

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Revenir
          </Link>

          <div className="mt-4">
            <SystemDetailContent
              system={data.system}
              detail={data.detail}
              intro={buildSystemPageIntro(data)}
              initialActiveTab={isSystemDetailTab(normalizedInitialTab) ? normalizedInitialTab : undefined}
              headingAs="h1"
            />
          </div>
        </div>
      </main>
    </>
  );
}
