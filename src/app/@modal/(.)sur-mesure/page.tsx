import { notFound } from "next/navigation";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import ServiceRouteDialog from "@/components/ServiceRouteDialog";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";

export default function ApplicationServiceModalPage() {
  const service = getCanonicalServiceBySlug("application-metier");
  if (!service) notFound();

  return (
    <ServiceRouteDialog ariaLabel="Détails de Application métier">
      <CanonicalServiceDetails headingAs="h2" service={service} variant="modal" />
    </ServiceRouteDialog>
  );
}
