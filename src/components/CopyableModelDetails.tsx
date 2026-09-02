import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import CopyableModelCopyLink from "@/components/CopyableModelCopyLink";
import DocumentModelPreview from "@/components/DocumentModelPreview";
import DriveFolderTemplateCreator from "@/components/DriveFolderTemplateCreator";
import DriveFolderTreePreview from "@/components/DriveFolderTreePreview";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import ModelPlatformBadge from "@/components/ModelPlatformBadge";
import type { CopyableModelDefinition } from "@/lib/copyable-model-catalog";
import { getDocumentModelBySlug } from "@/lib/document-models";
import { buildCompanyDriveFolderTemplate } from "@/lib/drive-folder-templates";
import { isGoogleDriveTemplateConfigured } from "@/lib/google-drive-template.server";

export default function CopyableModelDetails({
  backLink,
  model,
  variant = "page",
}: {
  backLink?: Readonly<{ href: string; label: string }>;
  model: CopyableModelDefinition;
  variant?: "page" | "modal";
}) {
  const documentModel = model.documentModelSlug
    ? getDocumentModelBySlug(model.documentModelSlug)
    : null;
  const currentYear = new Date().getFullYear();
  const driveTemplate = model.driveFolderTemplateSlug
    ? buildCompanyDriveFolderTemplate(currentYear)
    : null;
  const Heading = variant === "modal" ? "h2" : "h1";

  return (
    <article className={variant === "page" ? "mx-auto w-full max-w-6xl" : "w-full"}>
      {variant === "page" && backLink ? (
        <Link href={backLink.href} className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-dema-muted transition hover:text-dema-forest">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLink.label}
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
          {driveTemplate ? (
            <DriveFolderTreePreview template={driveTemplate} />
          ) : documentModel ? (
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
          {driveTemplate ? (
            <Suspense fallback={<div className="mt-7 h-40 animate-pulse rounded-xl bg-dema-sage/35" />}>
              <DriveFolderTemplateCreator
                configured={isGoogleDriveTemplateConfigured()}
                modelSlug={model.slug}
                year={currentYear}
              />
            </Suspense>
          ) : (
            <CopyableModelCopyLink modelSlug={model.slug} platform={model.platform} />
          )}
        </div>
      </div>

      {model.relatedOrganiserSlug && model.relatedOrganiserLabel ? (
        <Link href={`/organiser/${model.relatedOrganiserSlug}`} className="mt-8 flex min-h-16 items-center justify-between gap-4 border-y border-dema-line px-2 py-4 text-brand-blue transition hover:text-dema-forest">
          <span>{model.relatedOrganiserLabel}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      ) : null}

      <div className="mt-8">
        <MentoratAutomationCta modelSlug={model.slug} variant="modele" />
      </div>
    </article>
  );
}
