import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { ServiceIcon } from "@/components/ServiceIcon";
import ServiceRequestCta from "@/components/ServiceRequestCta";
import {
  demaaServices,
  getDemaaServiceBySlug,
} from "@/lib/service-catalog";

type ServiceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return demaaServices.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
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

  return {
    title: `${service.name} - Demaa`,
    description: service.description,
    openGraph: {
      title: `${service.name} - Demaa`,
      description: service.description,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = getDemaaServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const serviceSource =
    service.slug === "structuration-automatisation" ? "Demaa" : "Partenaire";

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-dema-cream px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/annuaire-services"
            className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Retour aux services
          </Link>

          <section className="mt-5 rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <ServiceIcon icon={service.icon} className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                    {service.category}
                  </p>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
                  {service.name}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
                  {service.description}
                </p>
              </div>
              <aside className="w-full rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 lg:max-w-sm">
                <p className="text-sm font-semibold text-brand-blue">Tarif</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                    {service.price}
                  </span>
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    {service.category}
                  </span>
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    {serviceSource}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {service.bestFor}
                </p>
                <ServiceRequestCta service={service} />
              </aside>
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
              <h2 className="text-xl font-semibold text-brand-blue">Ce qui est inclus</h2>
              <ul className="mt-4 space-y-3">
                {service.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
              <h2 className="text-xl font-semibold text-brand-blue">Utile pour</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.usefulFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h2 className="mt-6 text-xl font-semibold text-brand-blue">Mots-clés</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-dema-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
