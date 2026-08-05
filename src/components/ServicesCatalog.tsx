import Link from "next/link";
import {
  AppWindow,
  Globe2,
  MapPin,
  MousePointerClick,
  Search,
  Share2,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  servicePageCategories,
  servicePageEntries,
  type ServicePageEntry,
} from "@/lib/services-page-catalog";

const ICONS: Record<ServicePageEntry["icon"], LucideIcon> = {
  workflow: Workflow,
  application: AppWindow,
  website: Globe2,
  local: MapPin,
  seo: Search,
  "google-ads": MousePointerClick,
  "social-ads": Share2,
};

function ServiceCard({ service }: { service: ServicePageEntry }) {
  const Icon = ICONS[service.icon];
  const contactHref = `mailto:team@demaa.fr?subject=${encodeURIComponent(`Demande — ${service.name}`)}`;

  return (
    <article className="flex min-h-[21rem] w-[min(82vw,19rem)] shrink-0 snap-start flex-col rounded-[1.4rem] border border-dema-line bg-dema-paper p-6 shadow-[0_8px_24px_rgba(23,35,29,0.025)] sm:w-[19rem] lg:w-[calc((100%-2rem)/3)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>

      <h3 className="mt-7 text-xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue">
        {service.name}
      </h3>
      <p className="mt-3 text-sm leading-6 text-dema-muted">{service.description}</p>

      <div className="mt-auto border-t border-dema-line/80 pt-5">
        <p className="text-sm font-semibold text-dema-forest">{service.price}</p>
        <Link
          href={contactHref}
          className="mt-3 inline-flex text-sm font-medium text-brand-blue/65 transition hover:text-dema-forest"
        >
          Parler de ce service
        </Link>
      </div>
    </article>
  );
}

export default function ServicesCatalog() {
  return (
    <div className="space-y-14 md:space-y-16">
      {servicePageCategories.map((category) => {
        const services = servicePageEntries.filter(
          (service) => service.category === category.id,
        );

        return (
          <section key={category.id} aria-labelledby={`services-${category.id}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
              {category.eyebrow}
            </p>
            <h2
              id={`services-${category.id}`}
              className="mt-1.5 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-3xl"
            >
              {category.title}
            </h2>

            <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}


