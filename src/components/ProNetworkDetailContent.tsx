"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";

type ProNetworkDetailContentProps = {
  network: DemaaProNetwork;
  compact?: boolean;
};

export default function ProNetworkDetailContent({
  network,
  compact = false,
}: ProNetworkDetailContentProps) {
  const isExternal = network.href.startsWith("http");

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8"}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ServiceIcon icon={network.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {network.category}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
            {network.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
            {network.description}
          </p>
        </div>
      </section>

      <section className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[1fr_0.9fr]"}`}>
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted md:text-base">
            {network.shortDescription}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-dema-muted md:text-base">
            {network.bestFor}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Accès</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted">
            Ouvrez le site ou l’annuaire du réseau pour voir les modalités d’adhésion, les événements et les ressources utiles.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isExternal ? (
              <a
                href={network.href}
                target="_blank"
                rel="noreferrer"
                className="demaa-primary-button gap-2 px-5 py-3"
              >
                {network.cta}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <Link href={network.href} className="demaa-primary-button gap-2 px-5 py-3">
                {network.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
