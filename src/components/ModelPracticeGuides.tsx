import Link from "next/link";
import type { PracticeTutorialDefinition } from "@/lib/tutorial-catalog";

export default function ModelPracticeGuides({
  compact = false,
  modelTitles,
  tutorials,
}: {
  compact?: boolean;
  modelTitles?: Readonly<Record<string, string>>;
  tutorials: readonly PracticeTutorialDefinition[];
}) {
  if (tutorials.length === 0) return null;

  return (
    <section aria-labelledby={compact ? "model-guides-title" : "models-guides-title"}>
      <h2
        id={compact ? "model-guides-title" : "models-guides-title"}
        className={compact
          ? "text-2xl font-medium tracking-[-0.025em] text-brand-blue"
          : "demaa-catalog-section-title text-brand-blue"}
      >
        {compact ? "Modes d’emploi de ce modèle" : "Modes d’emploi"}
      </h2>
      {!compact ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-dema-muted">
          Configurez les modèles utiles avec des étapes courtes et des exemples concrets.
        </p>
      ) : null}
      <div className={`grid grid-cols-1 gap-4 ${compact ? "mt-5" : "mt-6 sm:grid-cols-2"}`}>
        {tutorials.map((tutorial) => (
          <Link
            key={tutorial.slug}
            href={`/tutoriels/${tutorial.slug}`}
            className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 transition-colors hover:border-dema-forest/20 hover:bg-dema-sage/10 sm:p-6"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest/70">
              {modelTitles?.[tutorial.modelSlug] ?? `${tutorial.tool} · ${tutorial.topic}`}
            </p>
            <h3 className="mt-3 text-xl font-normal leading-tight tracking-[-0.02em] text-brand-blue">
              {tutorial.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-dema-muted">
              {tutorial.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
