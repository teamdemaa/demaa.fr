"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import ModelPlatformBadge from "@/components/ModelPlatformBadge";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

export default function CopyableModelCard({
  model,
  titleLevel = 2,
}: {
  model: CopyableModelDefinition;
  titleLevel?: 2 | 3;
}) {
  const titleClassName = "mt-3 text-xl font-medium leading-tight tracking-[-0.025em] text-brand-blue";

  return (
    <Link
      href={`/modeles/${model.slug}`}
      onClick={() => trackCopyableModelEvent("copyable_model_opened", {
        modelSlug: model.slug,
        platform: model.platform,
        surface: "catalogue",
      })}
      className="group flex h-full min-h-72 flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 transition hover:-translate-y-0.5 hover:border-dema-forest/30 hover:shadow-[0_16px_45px_rgba(31,52,43,0.08)] sm:p-6"
    >
      <div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/65 text-dema-forest">
          <Copy className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest/70">{model.category}</p>
        {titleLevel === 3 ? (
          <h3 className={titleClassName}>{model.title}</h3>
        ) : (
          <h2 className={titleClassName}>{model.title}</h2>
        )}
        <p className="mt-3 text-sm leading-6 text-dema-muted">{model.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-7">
        <ModelPlatformBadge platform={model.platform} />
        <span className="rounded-lg border border-dema-forest/25 bg-dema-sage/25 px-2.5 py-1.5 text-xs font-medium text-dema-forest">Gratuit</span>
      </div>
    </Link>
  );
}
