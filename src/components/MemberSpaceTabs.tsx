import Link from "next/link";

type MemberSpaceTabsProps = {
  actionPlans: Array<{
    id: string;
    summary: string;
    systemName: string;
    updatedAt: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "Date non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date non renseignée";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MemberSpaceTabs({
  actionPlans,
}: MemberSpaceTabsProps) {
  return (
    <div className="mt-8">
      <section>
        <SectionHeader
          title="Mes plans"
          description="Vos plans sauvegardés, prêts à être repris et mis à jour."
        />
        {actionPlans.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {actionPlans.map((actionPlan) => (
              <Link
                key={actionPlan.id}
                href={`/plans/${actionPlan.id}`}
                className="demaa-card rounded-[1.15rem] p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {actionPlan.systemName}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue">
                  Plan d’action
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-dema-muted">
                  {actionPlan.summary}
                </p>
                <p className="mt-4 text-xs text-dema-muted">
                  Sauvegardé le {formatDate(actionPlan.updatedAt)}
                </p>
                <span className="mt-4 inline-flex text-sm font-medium text-dema-forest underline decoration-dema-forest/20 underline-offset-4">
                  Ouvrir le plan
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper p-6 text-sm leading-relaxed text-dema-muted">
            Aucun plan sauvegardé pour le moment.
          </div>
        )}
      </section>

    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="demaa-section-title text-3xl tracking-tight text-brand-blue/85">
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dema-muted">
        {description}
      </p>
    </div>
  );
}
