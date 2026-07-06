import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import ServiceDetailContent from "@/components/ServiceDetailContent";
import AssistantPolyvalentLanding from "@/components/AssistantPolyvalentLanding";
import ServiceExpandedContent from "@/components/ServiceExpandedContent";
import { hasExpandedServiceContent } from "@/lib/service-expanded-content";
import { getServicePageMetadata } from "@/lib/service-metadata";
import { getRelatedSystemsForServiceSlug } from "@/lib/related-systems";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { buildOperationalSystemDetail } from "@/lib/system-operations";
import { demaaServices, getDemaaServiceBySlug } from "@/lib/service-catalog";
import {
  RECRUITMENT_ASSISTANT_SERVICE_SLUG,
} from "@/lib/assistant-service-packs";

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    retourSysteme?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateStaticParams() {
  return demaaServices.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalizedSlug =
    slug === "organisation"
      ? "organisation-automatisation"
      : slug;
  const service = getDemaaServiceBySlug(normalizedSlug);

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

export default async function ServiceDetailPage({
  params,
  searchParams,
}: ServiceDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  if (slug === "organisation-automatisation") {
    permanentRedirect("/annuaire-services/organisation");
  }

  const normalizedSlug =
    slug === "organisation" ? "organisation-automatisation" : slug;
  const service = getDemaaServiceBySlug(normalizedSlug);

  if (!service) {
    notFound();
  }

  if (service.slug === RECRUITMENT_ASSISTANT_SERVICE_SLUG) {
    return <AssistantPolyvalentLanding service={service} />;
  }

  const relatedSystems = getRelatedSystemsForServiceSlug(service.slug);
  const returnSystemSlug = getParamValue(resolvedSearchParams.retourSysteme);
  const returnEnterprise = returnSystemSlug
    ? await getEnterpriseBySlug(returnSystemSlug)
    : null;
  const returnSystemDetail =
    service.slug === "organisation-automatisation" && returnEnterprise
      ? await buildOperationalSystemDetail(enterpriseToSystem(returnEnterprise))
      : null;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux services
          </Link>

          <div className="mt-5">
            <ServiceDetailContent service={service} />
          </div>

          {hasExpandedServiceContent(service.slug) ? (
            <section className="mt-5">
              <ServiceExpandedContent
                serviceSlug={service.slug}
                variant="page"
                systemName={returnEnterprise?.name}
                systeme={returnSystemDetail?.systeme}
              />
            </section>
          ) : null}

          <section className="mt-5">
            <RelatedSystemsLinks
              systems={relatedSystems}
              description="Quelques pages système où ce service est particulièrement pertinent."
            />
          </section>
        </div>
      </main>
    </>
  );
}
