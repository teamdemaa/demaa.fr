import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import RelatedSystemsLinks from "@/components/RelatedSystemsLinks";
import ServiceDetailContent from "@/components/ServiceDetailContent";
import AssistantPolyvalentLanding from "@/components/AssistantPolyvalentLanding";
import ServiceExpandedContent from "@/components/ServiceExpandedContent";
import { hasExpandedServiceContent } from "@/lib/service-expanded-content";
import { getServicePageMetadata } from "@/lib/service-metadata";
import { getRelatedSystemsForServiceSlug } from "@/lib/related-systems";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
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

function isHiddenOrganisationSlug(slug: string) {
  return slug === "organisation" || slug === "organisation-automatisation";
}

export async function generateStaticParams() {
  return demaaServices
    .filter((service) => !isHiddenOrganisationSlug(service.slug))
    .map((service) => ({
      slug: service.slug,
    }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
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

export default async function ServiceDetailPage({
  params,
  searchParams,
}: ServiceDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  if (isHiddenOrganisationSlug(slug)) {
    notFound();
  }

  const service = getDemaaServiceBySlug(slug);

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

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div>
            <ServiceDetailContent service={service} />
          </div>

          {hasExpandedServiceContent(service.slug) ? (
            <section className="mt-5">
              <ServiceExpandedContent
                serviceSlug={service.slug}
                variant="page"
                systemName={returnEnterprise?.name}
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
