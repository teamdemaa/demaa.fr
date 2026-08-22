import Link from "next/link";
import {
  Calculator,
  ClipboardList,
  Compass,
  FileCheck2,
  PanelsTopLeft,
  Megaphone,
  MessagesSquare,
  SearchCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { CanonicalService } from "@/lib/canonical-service-catalog";
import { LIBRARY_CARD_TITLE_CLASSNAME } from "@/lib/library-card-ui";

const ICONS: Record<CanonicalService["slug"], LucideIcon> = {
  "coach-business": Compass,
  "automatisation-processus": Workflow,
  "application-metier": PanelsTopLeft,
  "assistance-administrative": ClipboardList,
  "expert-comptable": Calculator,
  "formalites-entreprise": FileCheck2,
  "gestion-reseaux-sociaux": MessagesSquare,
  "publicite-en-ligne": Megaphone,
  "prospection-ciblee": SearchCheck,
};

const PARTNER_SERVICE_DISPLAY_ORDER: Partial<Record<CanonicalService["slug"], number>> = {
  "expert-comptable": 0,
  "coach-business": 1,
};

function getServiceCardPriceLabel(service: CanonicalService) {
  if (service.pricing) return service.pricing.label;
  const lowestPackage = service.packages.reduce<CanonicalService["packages"][number] | null>(
    (lowest, current) => !lowest || current.pricing.amountMinor < lowest.pricing.amountMinor
      ? current
      : lowest,
    null,
  );
  if (!lowestPackage) return null;
  return service.packages.length > 1
    ? `À partir de ${lowestPackage.pricing.label}`
    : lowestPackage.pricing.label;
}

function ServiceCard({
  onSelect,
  service,
}: {
  onSelect?: (service: CanonicalService) => void;
  service: CanonicalService;
}) {
  const Icon = ICONS[service.slug];
  const priceLabel = getServiceCardPriceLabel(service);
  const className = "group flex min-w-0 flex-col rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_8px_24px_rgba(23,35,29,0.025)] transition hover:border-dema-forest/30 hover:shadow-[0_10px_28px_rgba(23,35,29,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 sm:p-6 md:h-full";
  const content = <>
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
      </span>
    </div>
    <p className="mt-4 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">{service.eyebrow}</p>
    <h3 className={`mt-2 line-clamp-2 ${LIBRARY_CARD_TITLE_CLASSNAME}`}>{service.name}</h3>
    <p className="mt-2 line-clamp-2 text-sm leading-5 text-dema-muted">{service.summary}</p>
    {priceLabel ? (
      <p className="mt-6 text-sm font-normal text-dema-muted md:mt-auto md:pt-5">{priceLabel}</p>
    ) : null}
  </>;

  return (
    <article className="min-w-0 md:h-[19rem]">
      {onSelect ? (
        <button type="button" onClick={() => onSelect(service)} className={className}>
          {content}
        </button>
      ) : (
        <Link href={service.detailHref} className={className}>{content}</Link>
      )}
    </article>
  );
}

function ServiceSection({
  description,
  services,
  title,
  onServiceSelect,
}: {
  description: string;
  services: readonly CanonicalService[];
  title: string;
  onServiceSelect?: (service: CanonicalService) => void;
}) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby={`services-section-${services[0]?.delivery}`}>
      <h2
        id={`services-section-${services[0]?.delivery}`}
        className="text-xl font-normal leading-[1.3] text-brand-blue"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-dema-muted">
        {description}
      </p>
      <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} onSelect={onServiceSelect} />
        ))}
      </div>
    </section>
  );
}

export default function ServicesCatalog({
  onServiceSelect,
  services,
}: {
  onServiceSelect?: (service: CanonicalService) => void;
  services: readonly CanonicalService[];
}) {
  const demaaServices = services.filter((service) => service.delivery === "demaa");
  const partnerServices = services
    .filter((service) => service.delivery === "third-party")
    .sort(
      (left, right) =>
        (PARTNER_SERVICE_DISPLAY_ORDER[left.slug] ?? 2) -
        (PARTNER_SERVICE_DISPLAY_ORDER[right.slug] ?? 2),
    );

  return (
    <section aria-label="Services">
      <div className="space-y-10 sm:space-y-12">
        <ServiceSection
          title="Nos accompagnements"
          description="Conçus et réalisés directement par Demaa."
          services={demaaServices}
          onServiceSelect={onServiceSelect}
        />
        <ServiceSection
          title="Avec nos partenaires de confiance"
          description="Demaa qualifie votre besoin et organise la mise en relation."
          services={partnerServices}
          onServiceSelect={onServiceSelect}
        />
      </div>
    </section>
  );
}
