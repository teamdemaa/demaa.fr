import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTOMATION_ACCOMPANIMENT_PATH } from "@/lib/mentorat-automation-content";

type MentoratAutomationCtaProps = Readonly<{
  modelSlug?: string;
  systemName?: string;
  systemSlug?: string;
  variant: "general" | "metier" | "modele";
}>;

function buildCtaHref({ modelSlug, systemSlug, variant }: MentoratAutomationCtaProps) {
  const params = new URLSearchParams();
  params.set(
    "source",
    variant === "general"
      ? "solutions-hub"
      : variant === "metier"
        ? "solution-metier"
        : modelSlug
          ? "modele-detail"
          : "modeles-index",
  );
  if (systemSlug) params.set("systemSlug", systemSlug);
  if (modelSlug) params.set("modelSlug", modelSlug);
  return `${AUTOMATION_ACCOMPANIMENT_PATH}?${params.toString()}`;
}

function getCopy({ modelSlug, systemName, variant }: MentoratAutomationCtaProps) {
  if (variant === "metier") {
    return {
      title: "Automatisez les tâches chronophages de votre activité",
      description: systemName
        ? `Pour l’activité « ${systemName} », nous partons des tâches répétitives qui ralentissent votre équipe et mettons en place les automatisations adaptées à son fonctionnement.`
        : "Nous partons des tâches répétitives qui ralentissent votre équipe et mettons en place les automatisations adaptées à son fonctionnement.",
    };
  }

  if (variant === "modele") {
    return {
      title: modelSlug
        ? "Passez du modèle à l’automatisation"
        : "Passez des modèles à l’automatisation",
      description: modelSlug
        ? "Ce modèle organise une première façon de travailler. Nous aidons ensuite votre équipe à automatiser les tâches répétitives qui l’entourent et à garder la maîtrise de ce qui est mis en place."
        : "Ces modèles organisent vos premières façons de travailler. Nous aidons ensuite votre équipe à automatiser les tâches répétitives qui les entourent et à garder la maîtrise de ce qui est mis en place.",
    };
  }

  return {
    title: "Faites gagner du temps à votre équipe grâce à l’automatisation",
    description:
      "Pendant 2 mois, nous aidons votre équipe à réduire les ressaisies, les relances et les mises à jour inutiles, puis à garder la maîtrise des automatisations mises en place.",
  };
}

export default function MentoratAutomationCta(props: MentoratAutomationCtaProps) {
  const copy = getCopy(props);

  return (
    <section
      aria-label="Accompagnement à l’automatisation"
      className="rounded-[1.5rem] bg-dema-forest px-6 py-8 text-dema-paper sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-sage">
            Accompagnement à l’automatisation
          </p>
          <h2 className="mt-5 text-2xl font-light leading-tight tracking-[-0.035em] sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-dema-paper/72 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </div>

        <Link
          href={buildCtaHref(props)}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-dema-paper px-7 text-sm font-semibold text-dema-forest transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-paper/70 focus-visible:ring-offset-2 focus-visible:ring-offset-dema-forest"
        >
          Voir comment ça fonctionne
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
