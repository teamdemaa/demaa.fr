import { notFound } from "next/navigation";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import ServiceRouteDialog from "@/components/ServiceRouteDialog";
import {
  getCanonicalServiceBySlug,
  getCanonicalServiceDetailRouteParams,
} from "@/lib/canonical-service-catalog";

type ServiceModalPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCanonicalServiceDetailRouteParams();
}
export default async function ServiceModalPage({ params }: ServiceModalPageProps) {
  const { slug } = await params;
  const service = getCanonicalServiceBySlug(slug);
  if (!service || service.detailHref !== `/services/${service.slug}`) notFound();

  return (
    <ServiceRouteDialog ariaLabel={`Détails de ${service.name}`}>
      <CanonicalServiceDetails headingAs="h2" service={service} variant="modal" />
    </ServiceRouteDialog>
  );
}
