import { Check, CircleAlert, ClipboardCheck, UserRoundCheck } from "lucide-react";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto";

export function getServicePriceLabel(pricing: PublishedServiceOfferDto["pricing"]) {
  if (pricing.mode === "quote") return "Sur devis";

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(pricing.amountMinor / 100)} € HT`;
}

function ScopeList({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof Check;
  items: readonly string[];
  title: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-brand-blue">{title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-dema-muted">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dema-forest" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ServiceOfferDetails({
  offer,
  formEndpoint = "/api/service-request",
  headingAs: Heading = "h2",
}: {
  offer: PublishedServiceOfferDto;
  formEndpoint?: string;
  headingAs?: "h1" | "h2";
}) {
  const operator = offer.operatorType === "demaa" ? "Demaa" : "ODEMA";

  return (
    <div className="min-w-0 max-w-full">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            {offer.categoryTitle}
          </p>
          <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue sm:text-4xl">
            {offer.title}
          </Heading>
          <div className="mt-7 rounded-[1.1rem] border border-dema-line bg-dema-cream/60 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
              Résultat attendu
            </p>
            <p className="mt-3 text-base leading-relaxed text-dema-muted">
              {offer.description}
            </p>
          </div>
        </section>

        <aside className="h-fit rounded-[1.1rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-muted">
            Tarif
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-brand-blue">
            {getServicePriceLabel(offer.pricing)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Prestation opérée par {operator}.
          </p>
          <a
            href="#service-request-form"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
          >
            Échanger sur ce service
          </a>
        </aside>
      </div>

      <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2">
        <ScopeList icon={ClipboardCheck} items={offer.scope.deliverables} title="Livrables" />
        <ScopeList icon={Check} items={offer.scope.prerequisites} title="Prérequis" />
        <ScopeList icon={CircleAlert} items={offer.scope.exclusions} title="Non inclus" />
        <ScopeList
          icon={UserRoundCheck}
          items={offer.scope.clientResponsibilities}
          title="Votre participation"
        />
      </div>

      <section
        id="service-request-form"
        className="mt-8 scroll-mt-6 rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 sm:p-7"
        aria-labelledby="service-request-title"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
          Votre projet
        </p>
        <h3 id="service-request-title" className="mt-2 text-2xl font-semibold text-brand-blue">
          Parler de votre besoin
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted">
          Partagez le contexte essentiel. Aucun numéro de téléphone n’est demandé.
        </p>
        <ServiceRequestForm endpoint={formEndpoint} serviceSlug={offer.slug} />
      </section>
    </div>
  );
}
