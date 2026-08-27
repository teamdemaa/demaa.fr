"use client";

import { ArrowRight } from "lucide-react";
import type { CopyableModelPlatform } from "@/lib/copyable-model-catalog";
import { trackCopyableModelEvent } from "@/lib/kit-analytics-client";

export default function CopyableModelCopyLink({
  modelSlug,
  platform,
}: {
  modelSlug: string;
  platform: CopyableModelPlatform;
}) {
  return (
    <a
      href={`/api/modeles/${modelSlug}/copier`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCopyableModelEvent("copyable_model_copy_clicked", {
        modelSlug,
        platform,
        surface: "model_detail",
      })}
      className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue lg:mt-auto"
    >
      Copier gratuitement
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
