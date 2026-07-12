import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";
import { getServicePageMetadata } from "@/lib/service-metadata";

type ServiceModalPageProps = {
  params: Promise<{ slug: string }>;
};

function isHiddenOrganisationSlug(slug: string) {
  return slug === "organisation" || slug === "organisation-automatisation";
}

export async function generateMetadata({
  params,
}: ServiceModalPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isHiddenOrganisationSlug(slug)) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const service = getDemaaServiceBySlug(slug);

  if (!service) {
    return {
      title: "Page introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return getServicePageMetadata(service);
}

export default async function ServiceModalPage({
  params,
}: ServiceModalPageProps) {
  const { slug } = await params;
  if (isHiddenOrganisationSlug(slug)) {
    notFound();
  }

  const service = getDemaaServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailDialog service={service} source="Annuaire services" />;
}
