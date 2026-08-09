import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemRecapPrintButton from "@/components/SystemRecapPrintButton";
import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import { getActiveRenderableSolutionSectionsForSystem } from "@/lib/firebase-solution-registry-selection.server";
import { filterPublicSolutionSections } from "@/lib/public-solution-section-visibility";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemResourcesForSystem } from "@/lib/system-resource-catalog";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";

type SystemRecapPageProps = {
  params: Promise<{ slug: string }>;
};

const SECTION_LABELS = {
  software: "Outils",
  services: "Services",
  providers: "Fournisseurs",
  models: "Modèles",
  networks: "Réseaux professionnels",
} as const;

export async function generateMetadata({
  params,
}: SystemRecapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  return {
    title: data ? `Récapitulatif - ${data.system.name} - Demaa` : "Récapitulatif introuvable - Demaa",
    description: data
      ? `Process, solutions et ressources du système métier ${data.system.name}.`
      : undefined,
    robots: { index: false, follow: false },
  };
}

function getSolutionHref(interaction: {
  interactionMode: string;
  href?: string;
}) {
  return interaction.interactionMode === "external_link" || interaction.interactionMode === "detail"
    ? interaction.href
    : undefined;
}

export default async function SystemRecapPage({ params }: SystemRecapPageProps) {
  const { slug } = await params;
  const [data, solutionSections] = await Promise.all([
    getSystemDetailPageData(slug),
    getActiveRenderableSolutionSectionsForSystem(slug),
  ]);

  if (!data) notFound();

  const visibleSolutionSections = composeCanonicalServicesForSystem(
    slug,
    filterPublicSolutionSections(mergeRenderableSolutionSections(solutionSections)),
  );
  const resources = getSystemResourcesForSystem(slug).filter(
    (resource) => resource.resourceSlug !== "recapitulatif-systeme",
  );
  const routines = data.detail.systeme?.routines ?? [];

  return (
    <>
      <div className="print:hidden">
        <Navbar minimal />
      </div>
      <main className="min-h-screen bg-background px-4 py-10 text-brand-blue print:bg-white print:px-0 print:py-0 sm:px-6 lg:px-8">
        <article className="mx-auto w-full max-w-4xl rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_18px_50px_rgba(23,35,29,0.06)] print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-10">
          <header className="border-b border-dema-line pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Récapitulatif du système métier
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {data.system.name}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted sm:text-base">
                  {data.system.description}
                </p>
              </div>
              <SystemRecapPrintButton />
            </div>
          </header>

          <section className="py-8" aria-labelledby="recap-process-title">
            <h2 id="recap-process-title" className="text-2xl font-semibold tracking-[-0.025em]">
              Process
            </h2>
            <div className="mt-5 divide-y divide-dema-line border-y border-dema-line">
              {routines.map((routine, index) => (
                <article key={routine.routineId} className="break-inside-avoid py-5">
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dema-sage font-mono text-xs font-semibold text-dema-forest">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-base font-medium">{routine.title}</h3>
                      <p className="mt-1 text-xs text-dema-muted">{routine.cadence}</p>
                      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-dema-muted">
                        {routine.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2">
                            <span aria-hidden="true">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-dema-line py-8" aria-labelledby="recap-solutions-title">
            <h2 id="recap-solutions-title" className="text-2xl font-semibold tracking-[-0.025em]">
              Solutions
            </h2>
            {visibleSolutionSections.length > 0 ? (
              <div className="mt-6 space-y-8">
                {visibleSolutionSections.map((section) => (
                  <div key={section.section} className="break-inside-avoid">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-dema-forest">
                      {SECTION_LABELS[section.section]}
                    </h3>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {section.placements.map((placement) => {
                        const href = getSolutionHref(placement.resource.interaction);
                        return (
                          <li key={placement.placementId} className="rounded-xl border border-dema-line p-4">
                            {href ? (
                              <Link
                                href={href}
                                target={href.startsWith("http") ? "_blank" : undefined}
                                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4"
                              >
                                {placement.resource.name}
                              </Link>
                            ) : (
                              <p className="font-medium">{placement.resource.name}</p>
                            )}
                            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                              {placement.usage}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                Les solutions de ce métier sont en cours de vérification.
              </p>
            )}
          </section>

          <section className="border-t border-dema-line pt-8" aria-labelledby="recap-resources-title">
            <h2 id="recap-resources-title" className="text-2xl font-semibold tracking-[-0.025em]">
              Ressources
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {resources.map((resource) => (
                <li key={resource.resourceSlug} className="break-inside-avoid rounded-xl border border-dema-line p-4">
                  {resource.availability === "available" ? (
                    <a
                      href={`/api/systeme-kit/open/${resource.resourceSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4"
                    >
                      {resource.title}
                    </a>
                  ) : (
                    <p className="font-medium">{resource.title}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {resource.description}
                  </p>
                  {resource.availability === "coming-soon" ? (
                    <p className="mt-2 text-xs font-medium text-dema-muted">Bientôt disponible</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <footer className="mt-10 border-t border-dema-line pt-6 text-xs leading-relaxed text-dema-muted">
            Ce récapitulatif reflète les contenus actuellement publiés sur Demaa. Les solutions et ressources peuvent évoluer.
          </footer>
        </article>
      </main>
    </>
  );
}
