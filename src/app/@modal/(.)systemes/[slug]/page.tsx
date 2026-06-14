import { notFound } from "next/navigation";
import SystemDetailContent from "@/components/SystemDetailContent";
import SystemDetailModal from "@/components/SystemDetailModal";
import { buildSystemPageIntro, getSystemDetailPageData } from "@/lib/system-detail-page";

type SystemModalPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isSystemDetailTab(tab?: string) {
  return (
    tab === "processus" ||
    tab === "outils" ||
    tab === "services" ||
    tab === "fournisseurs" ||
    tab === "ressources"
  );
}

export default async function SystemModalPage({
  params,
  searchParams,
}: SystemModalPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    notFound();
  }

  const initialTab = getParamValue(resolvedSearchParams.tab);
  const standaloneHref = isSystemDetailTab(initialTab)
    ? `/systemes/${data.system.slug}?tab=${encodeURIComponent(initialTab)}`
    : `/systemes/${data.system.slug}`;

  return (
    <SystemDetailModal title={data.system.name} standaloneHref={standaloneHref}>
      <SystemDetailContent
        system={data.system}
        detail={data.detail}
        intro={buildSystemPageIntro(data)}
        initialActiveTab={isSystemDetailTab(initialTab) ? initialTab : undefined}
        headingAs="h2"
        headingId="system-detail-title"
      />
    </SystemDetailModal>
  );
}
