"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  getAidItemsByFamily,
  type DemaaAidItem,
} from "@/lib/aid-catalog";

type AidDetailContentProps = {
  item: DemaaAidItem;
  returnSystemSlug?: string;
};

export default function AidDetailContent({ item, returnSystemSlug }: AidDetailContentProps) {
  const returnSystemQuery = returnSystemSlug
    ? `?retourSysteme=${encodeURIComponent(returnSystemSlug)}`
    : "";
  const relatedAids = useMemo(
    () => getAidItemsByFamily(item.family).filter((entry) => entry.slug !== item.slug).slice(0, 3),
    [item.family, item.slug],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ServiceIcon icon={item.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {item.family}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
            {item.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
            {item.description}
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted md:text-base">
            {item.shortDescription}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-dema-muted md:text-base">
            {item.bestFor}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Accès</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted">
            Consultez la source officielle pour vérifier les conditions, les montants et les modalités de demande.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="demaa-primary-button gap-2 px-5 py-3"
            >
              {item.cta}
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              href={`/aides-et-subventions/${slugifyAidFamily(item.family)}${returnSystemQuery}`}
              className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            >
              Voir la famille
            </Link>
          </div>
        </div>
      </section>

      {relatedAids.length ? (
        <section className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-brand-blue">Aides liées</h2>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                D&apos;autres dispositifs de la m&ecirc;me famille &agrave; regarder ensuite.
              </p>
            </div>
            <Link
              href={`/aides-et-subventions/${slugifyAidFamily(item.family)}${returnSystemQuery}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
            >
              Voir toute la famille
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedAids.map((relatedAid) => (
              <Link
                key={relatedAid.slug}
                href={`/aides-et-subventions/${relatedAid.slug}${returnSystemQuery}`}
                className="demaa-card group flex min-h-[14rem] flex-col rounded-[1.15rem] p-5 text-left"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-forest group-hover:text-dema-paper">
                  <ServiceIcon icon={relatedAid.icon} className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
                  {relatedAid.type}
                </p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-brand-blue">
                  {relatedAid.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {relatedAid.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function slugifyAidFamily(family: string) {
  if (family === "Création & reprise") {
    return "creation-reprise";
  }

  if (family === "Recrutement & alternance") {
    return "recrutement-alternance";
  }

  if (family === "Transition écologique") {
    return "transition-ecologique";
  }

  return "innovation-r-d";
}
