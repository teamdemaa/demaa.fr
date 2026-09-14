"use client";

import Link from "next/link";
import ModelPlatformBadge from "@/components/ModelPlatformBadge";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

export default function CopyableModelCard({
  href,
  model,
  titleLevel = 2,
}: {
  href?: string;
  model: CopyableModelDefinition;
  titleLevel?: 2 | 3;
}) {
  const titleClassName = "demaa-catalog-card-title mt-3 text-brand-blue";

  return (
    <Link
      href={href ?? `/modeles/${model.slug}`}
      onClick={() => trackCopyableModelEvent("copyable_model_opened", {
        modelSlug: model.slug,
        platform: model.platform,
        surface: "catalogue",
      })}
      className="group flex h-full min-h-64 flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 transition-colors duration-150 hover:border-dema-forest/20 hover:bg-dema-sage/10 sm:p-6"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest/70">{model.category}</p>
        {titleLevel === 3 ? (
          <h3 className={titleClassName}>{model.title}</h3>
        ) : (
          <h2 className={titleClassName}>{model.title}</h2>
        )}
        <p className="demaa-catalog-card-description mt-3 line-clamp-2 text-dema-muted">{model.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-7">
        <ModelPlatformBadge platform={model.platform} />
        <span className="rounded-lg border border-dema-forest/25 bg-dema-sage/25 px-2.5 py-1.5 text-xs font-medium text-dema-forest">Gratuit</span>
      </div>
    </Link>
  );
}
