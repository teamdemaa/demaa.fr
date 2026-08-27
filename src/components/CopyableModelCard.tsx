"use client";

import { ArrowUpRight, Copy } from "lucide-react";
import Link from "next/link";
import ModelPlatformBadge from "@/components/ModelPlatformBadge";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

export default function CopyableModelCard({ model }: { model: CopyableModelDefinition }) {
  return (
    <Link
      href={`/modeles/${model.slug}`}
      onClick={() => trackCopyableModelEvent("copyable_model_opened", {
        modelSlug: model.slug,
        platform: model.platform,
        surface: "catalogue",
      })}
      className="group flex min-h-72 flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 transition hover:-translate-y-0.5 hover:border-dema-forest/30 hover:shadow-[0_16px_45px_rgba(31,52,43,0.08)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/65 text-dema-forest">
          <Copy className="h-4 w-4" aria-hidden="true" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-brand-blue/35 transition group-hover:text-dema-forest" aria-hidden="true" />
      </div>
      <div className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest/70">{model.category}</p>
        <h2 className="mt-3 text-xl font-medium leading-tight tracking-[-0.025em] text-brand-blue">{model.title}</h2>
        <p className="mt-3 text-sm leading-6 text-dema-muted">{model.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-7">
        <ModelPlatformBadge platform={model.platform} />
        <span className="rounded-lg border border-dema-forest/25 bg-dema-sage/25 px-2.5 py-1.5 text-xs font-medium text-dema-forest">Gratuit</span>
      </div>
    </Link>
  );
}
