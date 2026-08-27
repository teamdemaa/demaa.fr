import { ArrowLeft, ArrowRight, Check, Workflow } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CopyableModelCopyLink from "@/components/CopyableModelCopyLink";
import DocumentModelPreview from "@/components/DocumentModelPreview";
import ModelPlatformBadge from "@/components/ModelPlatformBadge";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { getDocumentModelBySlug } from "@/lib/document-models";

export default function CopyableModelDetails({
  model,
  variant = "page",
}: {
  model: CopyableModelDefinition;
  variant?: "page" | "modal";
}) {
  const documentModel = model.documentModelSlug
    ? getDocumentModelBySlug(model.documentModelSlug)
    : null;
  const Heading = variant === "modal" ? "h2" : "h1";
  const SectionHeading = variant === "modal" ? "h3" : "h2";

  return (
    <article className={variant === "page" ? "mx-auto w-full max-w-6xl" : "w-full"}>
      {variant === "page" ? (
        <Link href="/modeles" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux modèles
        </Link>
      ) : null}

      <header className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <ModelPlatformBadge platform={model.platform} />
          <span className="rounded-lg border border-dema-forest/25 bg-dema-sage/25 px-2.5 py-1.5 text-xs font-medium text-dema-forest">Gratuit</span>
        </div>
        <Heading className={`${variant === "modal" ? "mt-5 text-3xl" : "mt-6 text-4xl sm:text-5xl"} font-light tracking-[-0.045em] text-brand-blue`}>
          {model.title}
        </Heading>
        <p className="mt-4 max-w-3xl text-base leading-7 text-dema-muted">{model.description}</p>
      </header>

      <div className="mt-8 grid overflow-hidden rounded-[1.35rem] border border-dema-line bg-white lg:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.8fr)]">
        <div className="min-h-[18rem] border-b border-dema-line bg-[#f7f7f3] sm:min-h-[25rem] lg:min-h-[32rem] lg:border-b-0 lg:border-r">
          {documentModel ? (
            <DocumentModelPreview model={documentModel} />
          ) : (
            <div className="flex h-full min-h-[18rem] items-center justify-center p-8 text-center text-dema-muted sm:min-h-[25rem]">Aperçu du modèle indisponible.</div>
          )}
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Ce que le modèle vous permet</p>
          <ul className="mt-6 space-y-5">
            {model.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm leading-6 text-brand-blue/80">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <CopyableModelCopyLink modelSlug={model.slug} platform={model.platform} />
          <p className="mt-3 text-center text-xs text-dema-muted">Modèle gratuit · Copie dans votre propre espace</p>
        </div>
      </div>

      <section className="mt-8 grid gap-6 rounded-[1.35rem] border border-dema-forest/20 bg-[linear-gradient(135deg,rgba(231,238,229,.72),rgba(255,255,255,.94))] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Adaptation sur mesure</p>
          <SectionHeading className="mt-3 text-2xl font-light tracking-[-0.035em] text-brand-blue sm:text-3xl">Besoin de l’adapter à votre entreprise ?</SectionHeading>
          <p className="mt-3 max-w-2xl leading-7 text-dema-muted">Nous pouvons adapter cette structure à vos champs, vos étapes et vos responsabilités, puis ajouter Fillout, Make ou une génération de documents si cela apporte une vraie valeur.</p>
        </div>
        <div className="lg:min-w-60">
          <Suspense fallback={<div className="h-11 w-56 animate-pulse rounded-full bg-dema-sage/50" />}>
            <OrganisationSessionBookingButton
              className="demaa-primary-button w-full"
              label="Faire adapter ce modèle"
              requestType="copyable_model_customization"
              source="Modèles à copier"
              sourceIsAuthoritative
              modelSlug={model.slug}
              modelPlatform={model.platform}
            />
          </Suspense>
          <p className="mt-3 text-center text-xs text-dema-muted">Adaptation sur devis · 550 € HT / jour</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <Workflow className="h-5 w-5 text-dema-forest" aria-hidden="true" />
          <SectionHeading className="mt-4 text-xl font-medium text-brand-blue">Le flux couvert</SectionHeading>
          <p className="mt-3 text-sm leading-6 text-dema-muted"><strong className="font-medium text-brand-blue">Départ :</strong> {model.workflowStart}</p>
          <p className="mt-2 text-sm leading-6 text-dema-muted"><strong className="font-medium text-brand-blue">Fin :</strong> {model.workflowEnd}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Structure incluse</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {model.includedSections.map((section) => (
              <li key={section} className="rounded-full bg-dema-sage/45 px-3 py-2 text-xs font-medium text-dema-forest">{section}</li>
            ))}
          </ul>
        </div>
      </section>

      {model.relatedOrganiserSlug && model.relatedOrganiserLabel ? (
        <Link href={`/organiser/${model.relatedOrganiserSlug}`} className="mt-8 flex min-h-16 items-center justify-between gap-4 border-y border-dema-line px-2 py-4 text-brand-blue transition hover:text-dema-forest">
          <span>{model.relatedOrganiserLabel}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}
