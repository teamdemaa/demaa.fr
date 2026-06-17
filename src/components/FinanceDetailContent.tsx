"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import type { DemaaFinanceItem } from "@/lib/finance-catalog";

type FinanceDetailContentProps = {
  item: DemaaFinanceItem;
  compact?: boolean;
};

export default function FinanceDetailContent({
  item,
  compact = false,
}: FinanceDetailContentProps) {
  const isExternal = item.href.startsWith("http");

  const primaryCta = isExternal ? (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="demaa-primary-button gap-2 px-5 py-3"
    >
      {item.cta}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={item.href} className="demaa-primary-button gap-2 px-5 py-3">
      {item.cta}
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
                <ServiceIcon icon={item.icon} className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                {item.category}
              </p>
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
              {item.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
              {item.description}
            </p>
          </div>
          {!compact ? (
            <aside className="w-full rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5 lg:max-w-sm">
              <p className="text-sm font-semibold text-brand-blue">Repère utile</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-dema-sage/75 px-3 py-1 text-[10px] font-medium text-brand-blue/70">
                  {item.offerHint}
                </span>
                <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/70">
                  {item.family}
                </span>
                {item.partner ? (
                  <span className="inline-flex rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium lowercase text-brand-blue/70">
                    partenaire
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                {item.bestFor}
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted md:text-base">
            {item.shortDescription}
          </p>
          <h2 className="mt-6 text-xl font-semibold text-brand-blue">Utile pour</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.usefulFor.map((entry) => (
              <span
                key={entry}
                className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
              >
                {entry}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Mots-clés</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dema-line bg-dema-paper px-3 py-1.5 text-xs font-medium text-dema-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {primaryCta}
          </div>
        </div>
      </section>
    </div>
  );
}
