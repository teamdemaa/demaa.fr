import { notFound } from "next/navigation";
import SystemProcessesContent from "@/components/SystemProcessesContent";
import SystemProcessesRouteDialog from "@/components/SystemProcessesRouteDialog";
import { getSystemDetailPageData } from "@/lib/system-detail-page";

type SystemProcessesModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SystemProcessesModalPage({
  params,
}: SystemProcessesModalPageProps) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);
  if (!data) notFound();

  return (
    <SystemProcessesRouteDialog ariaLabel={`Processus métier : ${data.system.name}`}>
      <SystemProcessesContent
        routines={data.detail.systeme?.routines ?? []}
        systemName={data.system.name}
        systemSlug={data.system.slug}
        variant="modal"
      />
    </SystemProcessesRouteDialog>
  );
}
