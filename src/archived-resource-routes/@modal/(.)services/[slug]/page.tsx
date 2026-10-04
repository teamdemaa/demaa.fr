import { notFound } from "next/navigation";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import ServiceRouteDialog from "@/components/ServiceRouteDialog";
import {
  getCanonicalServiceBySlug,
  getCanonicalServiceDetailRouteParams,
  getCanonicalServiceRecordBySlug,
} from "@/lib/canonical-service-catalog";

type ServiceModalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...getCanonicalServiceDetailRouteParams(), { slug: "automatisation-ia" }];
}
export default async function ServiceModalPage({ params }: ServiceModalPageProps) {
  const { slug } = await params;
  const service = slug === "automatisation-ia"
    ? getCanonicalServiceRecordBySlug(slug)
    : getCanonicalServiceBySlug(slug);
  if (!service || service.detailHref !== `/services/${service.slug}`) notFound();

  return (
    <ServiceRouteDialog ariaLabel={`Détails de ${service.name}`}>
      <CanonicalServiceDetails headingAs="h2" service={service} variant="modal" />
    </ServiceRouteDialog>
  );
}
