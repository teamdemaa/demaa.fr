import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";
import { getServicePageMetadata } from "@/lib/service-metadata";

type ServiceModalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ServiceModalPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const service = getDemaaServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServiceDetailDialog service={service} source="Annuaire services" />;
}
