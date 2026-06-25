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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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
          {!compact ? (
            <aside className="w-full rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 lg:max-w-sm">
              <p className="text-sm font-semibold text-brand-blue">Offre</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                  {supplier.offerHint}
                </span>
                <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                  {supplier.family}
                </span>
                {supplier.partner ? (
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    partenaire
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                {supplier.bestFor}
              </p>
            </aside>
          ) : null}
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
