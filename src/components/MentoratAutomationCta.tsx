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
      title: "Faites gagner du temps à votre équipe",
      description: systemName
        ? `Pour l’activité « ${systemName} », nous partons de vos outils et de vos priorités pour améliorer le travail et automatiser les étapes utiles.`
        : "Nous partons de vos outils et de vos priorités pour améliorer le travail et automatiser les étapes utiles.",
    };
  }

  if (variant === "modele") {
    return {
      title: modelSlug
        ? "Faites évoluer ce modèle avec votre équipe"
        : "Faites évoluer ces modèles avec votre équipe",
      description: modelSlug
        ? "Ce modèle constitue un point de départ. Nous vous aidons à l’adapter à votre fonctionnement et à automatiser uniquement les étapes qui apportent un gain concret."
        : "Ces modèles constituent des points de départ. Nous vous aidons à les adapter à votre fonctionnement et à automatiser uniquement les étapes qui apportent un gain concret.",
    };
  }

  return {
    title: "Gagnez du temps au quotidien avec l’automatisation et l’IA",
    description: `Pendant ${AUTOMATION_OFFER.durationLabel}, nous avançons avec vous sur les priorités qui font perdre du temps à votre équipe, à partir de vos outils actuels.`,
  };
}

export default function MentoratAutomationCta(props: MentoratAutomationCtaProps) {
  const copy = getCopy(props);

  return (
    <section
      aria-label="Accompagnement automatisation et IA"
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
          Découvrir l’accompagnement
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
