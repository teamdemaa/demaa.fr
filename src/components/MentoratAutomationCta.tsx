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
        ? `Pour l’activité « ${systemName} », nous aidons votre équipe à améliorer ses outils, automatiser les étapes inutiles et construire une solution interne lorsqu’elle en a besoin.`
        : "Nous aidons votre équipe à améliorer ses outils, automatiser les étapes inutiles et construire une solution interne lorsqu’elle en a besoin.",
    };
  }

  if (variant === "modele") {
    return {
      title: modelSlug
        ? "Faites évoluer ce modèle avec votre équipe"
        : "Faites évoluer ces modèles avec votre équipe",
      description: modelSlug
        ? "Ce modèle organise une première façon de travailler. Votre équipe apprend ensuite à l’adapter, à automatiser les étapes utiles ou à le transformer en outil interne lorsque cela fait sens."
        : "Ces modèles organisent vos premières façons de travailler. Votre équipe apprend ensuite à les adapter, à automatiser les étapes utiles ou à les transformer en outils internes lorsque cela fait sens.",
    };
  }

  return {
    title: "Gagnez du temps avec l’automatisation et l’IA",
    description: `Pendant ${AUTOMATION_OFFER.durationLabel}, nous travaillons avec vous pour mieux organiser votre entreprise, automatiser ce qui vous ralentit et utiliser l’IA là où elle est vraiment utile.`,
  };
}

export default function MentoratAutomationCta(props: MentoratAutomationCtaProps) {
  const copy = getCopy(props);

  return (
    <section
      aria-label="Formation et mentorat en automatisation"
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
          Voir comment ça fonctionne
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
