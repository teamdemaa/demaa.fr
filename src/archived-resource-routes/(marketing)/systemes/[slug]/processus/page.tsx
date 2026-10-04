import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemProcessesContent from "@/components/SystemProcessesContent";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemProcessGuideDetails } from "@/lib/system-process-guide-details";
import { orderSystemeRoutinesForDisplay } from "@/lib/system-process-order";

type SystemProcessesPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SystemProcessesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  return {
    title: data
      ? `Processus métier - ${data.system.name} - Demaa`
      : "Processus métier introuvables - Demaa",
    description: data
      ? `Les processus essentiels du système métier ${data.system.name}, à consulter ou à imprimer.`
      : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function SystemProcessesPage({
  params,
}: SystemProcessesPageProps) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);
  if (!data) notFound();

  const systeme = data.detail.systeme;
  const routines = systeme
    ? orderSystemeRoutinesForDisplay(systeme.routines, systeme.cards, data.system.slug)
    : [];
  if (!routines.length) notFound();

  return (
    <>
      <div className="print:hidden">
        <Navbar minimal />
      </div>
      <main className="min-h-screen bg-background px-4 py-10 text-brand-blue print:bg-white print:px-0 print:py-0 sm:px-6 lg:px-8">
        <SystemProcessesContent
          routines={routines}
          systemName={data.system.name}
          systemSlug={data.system.slug}
          processGuideDetails={getSystemProcessGuideDetails(data.system.slug, routines)}
          closeHref={`/solutions/${data.system.slug}`}
        />
      </main>
    </>
  );
}
