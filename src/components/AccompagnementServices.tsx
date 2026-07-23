"use client";

import Link from "next/link";
import { ArrowRight, Check, Route } from "lucide-react";

type AccompagnementServicesProps = {
  source?: string;
  sectorLabel: string;
  systemName: string;
  systemSlug: string;
};

const CARD_CLASS =
  "group flex h-full min-h-[28rem] w-full flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-dema-forest/20 hover:shadow-[0_18px_45px_rgba(23,35,29,0.07)]";

const structureItems = [
  "Diagnostic de l’organisation et des priorités",
  "Tableau de suivi opérationnel configuré avec vos données",
  "Rôles, process et responsabilités clarifiés",
  "Plan d’action concret pour la suite",
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

export default function AccompagnementServices({
  source = "Accompagnement",
  systemSlug,
}: AccompagnementServicesProps) {
  const structureHref =
    `/annuaire-services/organisation?booking=1&source=${encodeURIComponent(source)}&systemSlug=${encodeURIComponent(systemSlug)}`;

  return (
    <div>
      <div className="grid max-w-2xl gap-4">
        <Link href={structureHref} className={CARD_CLASS}>
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <Route className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-dema-cream px-3 py-1 text-xs font-semibold text-dema-forest">
              Mission d’un mois
            </span>
          </div>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
            Organisation de l’entreprise
          </p>
          <h3 className="mt-2 text-[1.45rem] font-semibold leading-tight tracking-[-0.02em] text-brand-blue">
            Structuration & pilotage
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-dema-muted">
            Remettre de l’ordre dans votre entreprise pour qu’elle dépende moins de vous et
            puisse avancer avec des priorités, des rôles et des process clairs.
          </p>
          <OfferList items={structureItems} />
          <p className="mt-6 text-2xl font-semibold tracking-tight text-brand-blue">
            1 500 € HT
          </p>
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-dema-forest">
            Réserver ma session de cadrage offerte
            <ArrowRight
              className="h-4 w-4 transition group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>
      </div>
    </div>
  );
}
