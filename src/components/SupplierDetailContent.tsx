"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import type { DemaaSupplier } from "@/lib/supplier-catalog";

type SupplierDetailContentProps = {
  supplier: DemaaSupplier;
  compact?: boolean;
};

export default function SupplierDetailContent({
  supplier,
  compact = false,
}: SupplierDetailContentProps) {
  const isExternal = supplier.href.startsWith("http");

  const primaryCta = isExternal ? (
    <a
      href={supplier.href}
      target="_blank"
      rel="noreferrer"
      className="demaa-primary-button gap-2 px-5 py-3"
    >
      {supplier.cta}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={supplier.href} className="demaa-primary-button gap-2 px-5 py-3">
      {supplier.cta}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8"}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ServiceIcon icon={supplier.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {supplier.category}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
            {supplier.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
            {supplier.description}
          </p>
        </div>
      </section>

      <section className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[1fr_0.9fr]"}`}>
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted md:text-base">
            {supplier.shortDescription}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-dema-muted md:text-base">
            {supplier.bestFor}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Accès</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-dema-muted">
            <p>
              <span className="font-medium text-brand-blue">Offre</span>
              {` · ${supplier.offerHint}`}
            </p>
            <p>
              <span className="font-medium text-brand-blue">Famille</span>
              {` · ${supplier.family}`}
            </p>
            {supplier.partner ? (
              <p>
                <span className="font-medium text-brand-blue">Statut</span>
                {" · partenaire"}
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {primaryCta}
          </div>
        </div>
      </section>
    </div>
  );
}
