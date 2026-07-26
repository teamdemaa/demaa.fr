"use client";

import {
  ArrowRight,
  Calculator,
  Check,
  Route,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import AccountingRecommendationDialog from "@/components/AccountingRecommendationDialog";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import {
  getDemaaServiceBySlug,
  type DemaaService,
} from "@/lib/service-catalog";

type AccompagnementServicesProps = {
  source?: string;
  sectorLabel: string;
  systemName: string;
  systemSlug: string;
};

const CARD_CLASS =
  "group flex h-full min-h-[24rem] w-full flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-dema-forest/20 hover:shadow-[0_18px_45px_rgba(23,35,29,0.07)] sm:p-7";

const accountingItems = [
  "Besoin qualifié par un humain",
  "Jusqu’à 3 recommandations adaptées",
  "Création, tenue, paie, fiscalité et formalités",
  "Mise en relation gratuite",
] as const;

function OfferList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-sm leading-relaxed text-dema-muted"
        >
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ServiceHeading({
  category,
  icon,
  title,
}: {
  category: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <>
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        {icon}
      </span>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-forest">
        {category}
      </p>
      <h3 className="mt-2 text-[1.45rem] font-semibold leading-tight tracking-[-0.02em] text-brand-blue">
        {title}
      </h3>
    </>
  );
}

export default function AccompagnementServices({
  sectorLabel,
  source = "Système opérationnel — Services",
  systemName,
  systemSlug,
}: AccompagnementServicesProps) {
  const [selectedService, setSelectedService] = useState<DemaaService | null>(
    null,
  );
  const turnkeySystemService = getDemaaServiceBySlug("organisation-equipes");
  const accountingService = getDemaaServiceBySlug("expert-comptable");
  const showAccounting =
    systemSlug !== "cabinet-comptable" && Boolean(accountingService);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {turnkeySystemService ? (
          <button
            type="button"
            onClick={() => setSelectedService(turnkeySystemService)}
            className={CARD_CLASS}
            aria-haspopup="dialog"
          >
            <ServiceHeading
              category="Accompagnement"
              icon={<Route className="h-5 w-5" aria-hidden="true" />}
              title={turnkeySystemService.name}
            />
            <p className="mt-3 text-base font-semibold leading-relaxed text-brand-blue">
              {turnkeySystemService.shortDescription}
            </p>
            <OfferList items={turnkeySystemService.deliverables} />
            <p className="mt-6 text-2xl font-semibold tracking-tight text-brand-blue">
              {turnkeySystemService.price}
            </p>
            <p className="mt-1 text-xs text-dema-muted">Premier échange offert</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-dema-forest">
              Mettre en place mon système
              <ArrowRight
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </button>
        ) : null}

        {showAccounting && accountingService ? (
          <AccountingRecommendationDialog
            buttonClassName={CARD_CLASS}
            sectorLabel={sectorLabel}
            systemName={systemName}
            systemSlug={systemSlug}
            triggerContent={(
              <>
                <ServiceHeading
                  category="Comptabilité"
                  icon={<Calculator className="h-5 w-5" aria-hidden="true" />}
                  title={accountingService.name}
                />
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {accountingService.shortDescription}
                </p>
                <OfferList items={accountingItems} />
                <p className="mt-6 text-2xl font-semibold tracking-tight text-brand-blue">
                  Gratuit
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-dema-forest">
                  Recevoir mes recommandations
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </>
            )}
          />
        ) : null}
      </div>

      {selectedService ? (
        <ServiceIntroductionModal
          service={selectedService}
          source={source}
          systemSlug={systemSlug}
          onClose={() => setSelectedService(null)}
        />
      ) : null}
    </>
  );
}
