"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Calculator, Check, Compass, Route } from "lucide-react";
import AccountingRecommendationDialog from "@/components/AccountingRecommendationDialog";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";

type AccompagnementServicesProps = {
  source?: string;
  sectorLabel: string;
  systemName: string;
  systemSlug: string;
};

const CARD_CLASS =
  "group flex h-full min-h-[28rem] w-full flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-dema-forest/20 hover:shadow-[0_18px_45px_rgba(23,35,29,0.07)]";

const accountingItems = [
  "Comptabilité et obligations déclaratives",
  "Suivi adapté à votre activité",
  "Échanges avec un interlocuteur dédié",
  "Cabinet sélectionné selon votre contexte",
] as const;

function OfferList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-dema-muted">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PaidServiceHeading({
  category,
  duration,
  icon,
  title,
}: {
  category: string;
  duration: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
          {icon}
        </span>
        <span className="rounded-full bg-dema-cream px-3 py-1 text-xs font-semibold text-dema-forest">
          {duration}
        </span>
      </div>
      <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
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
  source = "Kit opérationnel — Services",
  systemName,
  systemSlug,
}: AccompagnementServicesProps) {
  const [isStructureOpen, setIsStructureOpen] = useState(false);
  const structureService = getDemaaServiceBySlug("organisation-equipes");
  const accountingService = getDemaaServiceBySlug("expert-comptable");
  const showAccounting = systemSlug !== "cabinet-comptable" && Boolean(accountingService);

  return (
    <>
      <section className="demaa-surface flex flex-col gap-5 rounded-[1.25rem] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-brand-blue">
              Session stratégique offerte avec un spécialiste
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-dema-muted">
              30 minutes pour faire le point sur votre situation, clarifier ce qui compte
              maintenant et repartir avec une prochaine étape claire. Gratuit et sans
              engagement, que vous choisissiez un service ou non.
            </p>
          </div>
        </div>
        <OrganisationSessionBookingButton
          source={source}
          label="Réserver ma session offerte"
          className="demaa-primary-button w-full shrink-0 sm:w-auto"
        />
      </section>

      <div
        className={`mt-4 grid gap-4 ${
          showAccounting ? "lg:grid-cols-2" : "max-w-2xl"
        }`}
      >
        {structureService ? (
          <button
            type="button"
            onClick={() => setIsStructureOpen(true)}
            className={CARD_CLASS}
            aria-haspopup="dialog"
          >
            <PaidServiceHeading
              category="Organisation de l’entreprise"
              duration="Mission d’un mois"
              icon={<Route className="h-5 w-5" aria-hidden="true" />}
              title={structureService.name}
            />
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              {structureService.shortDescription}
            </p>
            <OfferList items={structureService.deliverables} />
            <p className="mt-6 text-2xl font-semibold tracking-tight text-brand-blue">
              {structureService.price}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-dema-forest">
              Échanger sur cette mission
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
                <PaidServiceHeading
                  category="Gestion comptable"
                  duration="Suivi mensuel"
                  icon={<Calculator className="h-5 w-5" aria-hidden="true" />}
                  title={accountingService.name}
                />
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  Confier votre comptabilité à un cabinet qui comprend votre activité et vous
                  donne une base financière fiable pour piloter.
                </p>
                <p className="mt-4 rounded-[0.9rem] bg-dema-sage/60 px-3.5 py-3 text-sm font-medium leading-relaxed text-brand-blue">
                  Expertise comptable assurée par un cabinet inscrit à l’Ordre des
                  experts-comptables.
                </p>
                <OfferList items={accountingItems} />
                <p className="mt-6 text-2xl font-semibold tracking-tight text-brand-blue">
                  À partir de 250 € HT
                  <span className="ml-1 text-sm font-medium text-dema-muted">/ mois</span>
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-dema-forest">
                  Trouver mon expert-comptable
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

      {isStructureOpen && structureService ? (
        <ServiceIntroductionModal
          service={structureService}
          source={source}
          systemSlug={systemSlug}
          onClose={() => setIsStructureOpen(false)}
        />
      ) : null}
    </>
  );
}
