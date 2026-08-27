import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import CanonicalServiceDetails from "@/components/CanonicalServiceDetails";
import Navbar from "@/components/Navbar";
import {
  getCanonicalServiceBySlug,
  getCanonicalServiceDetailRouteParams,
} from "@/lib/canonical-service-catalog";
import {
  buildServicePageJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCanonicalServiceDetailRouteParams();
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getCanonicalServiceBySlug(slug);

  if (!service || service.detailHref !== `/services/${service.slug}`) notFound();

  const title = `${service.name} | Services Demaa`;
  const canonical = service.detailHref;

  return buildPublicPageMetadata({
    title,
    description: service.summary,
    path: canonical,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getCanonicalServiceBySlug(slug);

  if (!service || service.detailHref !== `/services/${service.slug}`) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeServicesJsonLd(buildServicePageJsonLd(service)),
        }}
      />
      <Navbar />
      <main className="min-h-screen min-w-0 max-w-full bg-dema-cream px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto min-w-0 max-w-5xl">
          <Link
            href="/application-metier"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à l’application métier
          </Link>
          <CanonicalServiceDetails service={service} />
        </div>
      </main>
    </>
  );
}
