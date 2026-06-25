"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import type { DemaaTraining } from "@/lib/training-catalog";

type TrainingDetailContentProps = {
  training: DemaaTraining;
  compact?: boolean;
};

export default function TrainingDetailContent({
  training,
  compact = false,
}: TrainingDetailContentProps) {
  const isExternal = training.href.startsWith("http");

  const primaryCta = isExternal ? (
    <a
      href={training.href}
      target="_blank"
      rel="noreferrer"
      className="demaa-primary-button gap-2 px-5 py-3"
    >
      {training.cta}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <Link href={training.href} className="demaa-primary-button gap-2 px-5 py-3">
      {training.cta}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section className={compact ? "" : "rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8"}>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
              <ServiceIcon icon={training.icon} className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
              {training.category}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
            {training.name}
          </h1>
          <p className="mt-3 text-sm font-medium text-brand-blue/70">
            {training.provider}
            {training.format ? ` · ${training.format}` : ""}
            {training.location ? ` · ${training.location}` : ""}
          </p>
          <p className="mt-4 text-base leading-relaxed text-dema-muted md:text-lg">
            {training.description}
          </p>
        </div>
      </section>

      <section className={`grid gap-5 ${compact ? "" : "lg:grid-cols-[1fr_0.9fr]"}`}>
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">À quoi ça sert ?</h2>
          <p className="mt-4 text-sm leading-relaxed text-dema-muted md:text-base">
            {training.shortDescription}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-dema-muted md:text-base">
            {training.bestFor}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Accès</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-dema-muted">
            <p>
              <span className="font-medium text-brand-blue">Organisme</span>
              {` · ${training.provider}`}
            </p>
            {training.format ? (
              <p>
                <span className="font-medium text-brand-blue">Format</span>
                {` · ${training.format}`}
              </p>
            ) : null}
            {training.location ? (
              <p>
                <span className="font-medium text-brand-blue">Lieu</span>
                {` · ${training.location}`}
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
