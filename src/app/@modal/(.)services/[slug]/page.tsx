import { notFound } from "next/navigation";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import ServiceRouteDialog from "@/components/ServiceRouteDialog";
import {
  getCanonicalServiceBySlug,
  getCanonicalServices,
} from "@/lib/canonical-service-catalog";

type ServiceModalPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getCanonicalServices().map((service) => ({ slug: service.slug }));
}
export default async function ServiceModalPage({ params }: ServiceModalPageProps) {
  const { slug } = await params;
  const service = getCanonicalServiceBySlug(slug);
  if (!service) notFound();

  return (
    <ServiceRouteDialog ariaLabel={`Détails de ${service.name}`}>
      <CanonicalServiceDetails headingAs="h2" service={service} />
    </ServiceRouteDialog>
  );
}
