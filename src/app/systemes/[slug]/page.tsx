import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { notFound } from "next/navigation";
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
  const jsonLd = buildSystemPageJsonLd(data);

  return (
    <>
      <main className="min-h-screen bg-brand-blue/35 p-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative mx-auto flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] md:p-8">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <SystemDetailContent
              system={data.system}
              detail={data.detail}
              intro={buildSystemPageIntro(data)}
              initialActiveTab={isSystemDetailTab(initialTab) ? initialTab : undefined}
              headingAs="h1"
            />
          </div>
        </div>
      </main>
    </>
  );
}
