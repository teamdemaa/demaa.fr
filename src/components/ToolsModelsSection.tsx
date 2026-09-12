import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CopyableModelCard from "@/components/CopyableModelCard";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";

export default function ToolsModelsSection({
  models,
}: {
  models: readonly CopyableModelDefinition[];
}) {
  return (
    <section id="modeles" className="scroll-mt-24 border-t border-dema-line/70 py-16 sm:py-20" aria-labelledby="tools-models-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest/60">
            Prêts à utiliser
          </p>
          <h2 id="tools-models-title" className="demaa-section-title mt-3 text-3xl tracking-[-0.03em] text-brand-blue sm:text-4xl">
            Modèles à copier
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted sm:text-base">
            Des bases Airtable, Notion, Google Sheets et Google Drive déjà structurées pour un usage précis.
          </p>
        </div>
        <Link href="/modeles" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue">
          Voir tous les modèles
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.slice(0, 6).map((model) => (
          <div key={model.slug} className="min-w-0">
            <CopyableModelCard
              href={`/modeles/${model.slug}?from=outils`}
              model={model}
              titleLevel={3}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
