import Link from "next/link";
import {
  Calculator,
  ClipboardList,
  Compass,
  FileCheck2,
  GraduationCap,
  PanelsTopLeft,
  Megaphone,
  MessagesSquare,
  SearchCheck,
  Workflow,
  ChevronDown,
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
  "recruter-un-alternant": GraduationCap,
};

const PARTNER_SERVICE_DISPLAY_ORDER: Partial<Record<CanonicalService["slug"], number>> = {
  "expert-comptable": 0,
  "assistance-administrative": 1,
  "coach-business": 2,
  "recruter-un-alternant": 3,
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
    <h3 className={`mt-4 line-clamp-2 ${LIBRARY_CARD_TITLE_CLASSNAME}`}>{service.name}</h3>
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
  id,
  services,
  title,
  onServiceSelect,
}: {
  description: string;
  id: string;
  services: readonly CanonicalService[];
  title: string;
  onServiceSelect?: (service: CanonicalService) => void;
}) {
  if (services.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
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

function PartnerServicesDisclosure({
  onServiceSelect,
  services,
}: {
  onServiceSelect?: (service: CanonicalService) => void;
  services: readonly CanonicalService[];
}) {
  if (services.length === 0) return null;

  return (
    <details className="group">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 border-b border-dema-line py-3 text-left marker:content-none focus-visible:border-b-2 focus-visible:border-dema-forest focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <span className="text-xl font-normal leading-[1.3] text-brand-blue">
          Avec nos partenaires de confiance
        </span>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-dema-forest transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-1 pt-4 sm:pb-2">
        <p className="max-w-3xl text-sm leading-6 text-dema-muted">
          Demaa qualifie votre besoin et organise la mise en relation.
        </p>
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} onSelect={onServiceSelect} />
          ))}
        </div>
      </div>
    </details>
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
        (PARTNER_SERVICE_DISPLAY_ORDER[left.slug] ?? 4) -
        (PARTNER_SERVICE_DISPLAY_ORDER[right.slug] ?? 4),
    );

  return (
    <section aria-label="Services">
      <div className="space-y-10 sm:space-y-12">
        <ServiceSection
          id="services-section-demaa"
          title="Nos accompagnements"
          description="Conçus et réalisés directement par Demaa."
          services={demaaServices}
          onServiceSelect={onServiceSelect}
        />
        <PartnerServicesDisclosure
          services={partnerServices}
          onServiceSelect={onServiceSelect}
        />
      </div>
    </section>
  );
}
