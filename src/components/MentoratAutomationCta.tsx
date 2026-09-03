import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
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
      title: "Mettez en place le système adapté à votre activité",
      description: systemName
        ? `Pour l’activité « ${systemName} », nous partons de votre fonctionnement réel pour construire un système clair avec vos outils actuels.`
        : "Nous partons de votre fonctionnement réel pour construire un système clair avec vos outils actuels.",
    };
  }

  if (variant === "modele") {
    return {
      title: modelSlug
        ? "Faites évoluer ce modèle avec votre équipe"
        : "Faites évoluer ces modèles avec votre équipe",
      description: modelSlug
        ? "Ce modèle constitue un point de départ. Nous l’adaptons à votre fonctionnement et l’intégrons dans un système que votre équipe peut réellement utiliser."
        : "Ces modèles constituent des points de départ. Nous les adaptons à votre fonctionnement et les intégrons dans des systèmes que votre équipe peut réellement utiliser.",
    };
  }

  return {
    title: "Mettez de l’ordre dans votre entreprise. Et des systèmes pour que ça dure.",
    description: `Pendant ${AUTOMATION_OFFER.durationLabel}, nous clarifions votre fonctionnement et mettons en place les systèmes opérationnels prioritaires définis avec vous.`,
  };
}

export default function MentoratAutomationCta(props: MentoratAutomationCtaProps) {
  const copy = getCopy(props);

  return (
    <section
      aria-label="Mise en place de systèmes opérationnels"
      className="rounded-[1.5rem] bg-dema-forest px-6 py-8 text-dema-paper sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-light leading-tight tracking-[-0.035em] sm:text-3xl">
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
          Découvrir la mise en place
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
