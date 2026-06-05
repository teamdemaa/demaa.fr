"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getToolPricingInfo } from "@/lib/tool-pricing";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

type SoftwareDetailContentProps = {
  tool: ToolDirectoryItem;
  compact?: boolean;
};

export default function SoftwareDetailContent({
  tool,
  compact = false,
}: SoftwareDetailContentProps) {
  const pricing = getToolPricingInfo(tool);

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper px-6 py-8 sm:px-8 sm:py-10"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
          {tool.category}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
          {tool.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base font-normal leading-relaxed text-dema-muted md:text-lg">
          {tool.description}
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-3 text-sm font-normal leading-relaxed text-dema-muted md:text-base">
            {tool.bestFor}
          </p>
        </div>

        <aside className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Tarification</h2>
          <p className="mt-3 text-sm font-normal leading-relaxed text-dema-muted">
            {pricing.summary}
          </p>
          <div className="mt-4 space-y-2">
            {pricing.plans.map((plan) => (
              <div
                key={`${plan.name}-${plan.price}`}
                className="rounded-[1rem] bg-dema-sage/70 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-brand-blue">{plan.name}</p>
                  <p className="text-right text-sm font-semibold text-brand-blue">{plan.price}</p>
                </div>
                {plan.detail ? (
                  <p className="mt-1 text-xs leading-relaxed text-dema-muted">{plan.detail}</p>
                ) : null}
              </div>
            ))}
          </div>
          {pricing.note ? (
            <p className="mt-3 text-xs leading-relaxed text-dema-muted">{pricing.note}</p>
          ) : null}
          {tool.memberDealLabel ? (
            <div className="mt-4 rounded-[1rem] border border-dema-forest/15 bg-dema-sage/70 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">
                Offre membre
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-blue">
                {tool.memberDealLabel}
              </p>
              {tool.memberDealDescription ? (
                <p className="mt-1 text-xs leading-relaxed text-dema-muted">
                  {tool.memberDealDescription}
                </p>
              ) : null}
              <Link
                href="/mon-espace"
                className="mt-3 inline-flex text-xs font-semibold text-dema-forest transition hover:text-brand-blue"
              >
                Accéder à l&apos;espace membre
              </Link>
            </div>
          ) : null}
        </aside>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={tool.url}
          target="_blank"
          rel="noreferrer"
          className="demaa-primary-button gap-2 px-5 py-3"
        >
          Visiter le site du logiciel
          <ArrowUpRight className="h-4 w-4" />
        </a>
        {pricing.sourceUrl ? (
          <a
            href={pricing.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="demaa-secondary-button gap-2 px-5 py-3"
          >
            Voir les tarifs
            <ArrowUpRight className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
