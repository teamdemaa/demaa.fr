import Link from "next/link";
import {
  ArrowUpRight,
  Calculator,
  Megaphone,
  ReceiptText,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CanonicalService } from "@/lib/canonical-service-catalog";

const ICONS: Record<CanonicalService["slug"], LucideIcon> = {
  "automatisation-processus": Workflow,
  "expert-comptable": Calculator,
  "marketing-vente": Megaphone,
  "assistance-facturation": ReceiptText,
};

function ServiceCard({ service }: { service: CanonicalService }) {
  const Icon = ICONS[service.slug];

  return (
    <article className="flex min-h-[25rem] min-w-0 flex-col rounded-[1.4rem] border border-dema-line bg-dema-paper p-6 shadow-[0_8px_24px_rgba(23,35,29,0.025)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>

      <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
        {service.eyebrow}
      </p>
      <h3 className="mt-7 text-xl font-semibold leading-tight tracking-[-0.025em] text-brand-blue">
        {service.name}
      </h3>
      <p className="mt-3 text-sm leading-6 text-dema-muted">{service.summary}</p>

      <div className="mt-auto border-t border-dema-line/80 pt-5">
        <p className="text-sm font-semibold text-dema-forest">
          {service.pricing.label}
        </p>
        <Link
          href={`/services/${service.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          Découvrir le service
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function ServicesCatalog({
  services,
}: {
  services: readonly CanonicalService[];
}) {
  return (
    <section aria-labelledby="services-catalog-title">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
        Catalogue Demaa
      </p>
      <h2
        id="services-catalog-title"
        className="mt-1.5 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-3xl"
      >
        Un périmètre lisible, sans catalogue à rallonge
      </h2>
      <div className="mt-7 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </section>
  );
}
