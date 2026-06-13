import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SoftwareDetailContent from "@/components/SoftwareDetailContent";
import {
  findToolDirectoryItemBySlug,
  hasStandaloneToolPage,
  resolveToolDirectorySlugInList,
} from "@/lib/tool-directory";
import { getUnifiedToolDirectory } from "@/lib/tool-directory-firestore";

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tools = await getUnifiedToolDirectory();
  const canonicalSlug = resolveToolDirectorySlugInList(tools, slug);

  if (!canonicalSlug) {
    return {
      title: "Outil introuvable - Demaa",
    };
  }

  const tool = findToolDirectoryItemBySlug(tools, canonicalSlug);

  if (!tool) {
    return {
      title: "Outil introuvable - Demaa",
    };
  }

  if (hasStandaloneToolPage(tool)) {
    return {
      title: "Outil introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${tool.name} - Annuaire outils Demaa`,
    description: tool.description,
    alternates: {
      canonical: `/annuaire-outils/${canonicalSlug}`,
    },
    openGraph: {
      title: `${tool.name} - Annuaire outils Demaa`,
      description: tool.description,
      url: `/annuaire-outils/${canonicalSlug}`,
    },
  };
}

export default async function ToolDetailPage({
  params,
}: ToolDetailPageProps) {
  const { slug } = await params;
  const tools = await getUnifiedToolDirectory();
  const canonicalSlug = resolveToolDirectorySlugInList(tools, slug);

  if (!canonicalSlug) {
    notFound();
  }

  if (slug !== canonicalSlug) {
    permanentRedirect(`/annuaire-outils/${canonicalSlug}`);
  }

  const tool = findToolDirectoryItemBySlug(tools, canonicalSlug);

  if (!tool) {
    notFound();
  }

  if (hasStandaloneToolPage(tool)) {
    notFound();
  }

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/annuaire-outils"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Revenir à l&apos;annuaire des outils
          </Link>

          <div className="mt-8">
            <SoftwareDetailContent tool={tool} />
          </div>
        </div>
      </main>
    </>
  );
}
