import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ServiceOfferDetails from "@/components/ServiceOfferDetails";
import {
  getPublishedServiceOfferV2BySlug,
  getPublishedServiceOffersV2,
} from "@/lib/service-catalog-v2";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedServiceOffersV2().map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = getPublishedServiceOfferV2BySlug(slug);

  if (!offer) {
    return {
      title: "Service indisponible | Demaa",
      robots: { index: false, follow: false },
    };
  }

  const title = `${offer.title} | Services Demaa`;
  const canonical = `/services/${offer.slug}`;

  return {
    title,
    description: offer.description,
    alternates: { canonical },
    openGraph: {
      title,
      description: offer.description,
      url: canonical,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const offer = getPublishedServiceOfferV2BySlug(slug);

  if (!offer) notFound();

  return (
    <main className="min-h-screen min-w-0 max-w-full bg-dema-cream px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto min-w-0 max-w-5xl">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tous les services
        </Link>
        <ServiceOfferDetails offer={offer} headingAs="h1" />
      </div>
    </main>
  );
}
