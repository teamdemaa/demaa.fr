import { notFound } from "next/navigation";
import SystemProcessesContent from "@/components/SystemProcessesContent";
import SystemProcessesRouteDialog from "@/components/SystemProcessesRouteDialog";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemProcessGuideDetails } from "@/lib/system-process-guide-details";
import { orderSystemeRoutinesForDisplay } from "@/lib/system-process-order";

type SystemProcessesModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SystemProcessesModalPage({
  params,
}: SystemProcessesModalPageProps) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);
  if (!data) notFound();
  const systeme = data.detail.systeme;
  const routines = systeme
    ? orderSystemeRoutinesForDisplay(systeme.routines, systeme.cards, data.system.slug)
    : [];
  if (!routines.length) notFound();

  return (
    <SystemProcessesRouteDialog ariaLabel={`Processus métier : ${data.system.name}`}>
      <SystemProcessesContent
        routines={routines}
        systemName={data.system.name}
        systemSlug={data.system.slug}
        processGuideDetails={getSystemProcessGuideDetails(data.system.slug, routines)}
        variant="modal"
      />
    </SystemProcessesRouteDialog>
  );
}
