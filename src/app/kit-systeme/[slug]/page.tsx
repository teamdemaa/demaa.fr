import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { PILOTING_SHEET_URLS } from "@/lib/document-models";
import { getSystemDetailPageData } from "@/lib/system-detail-page";
import { getSystemKitDocumentEntries } from "@/lib/system-kit";

type SystemKitPageProps = {
  params: Promise<{ slug: string }>;
};

function getSpreadsheetDownloadHref(href: string) {
  return href.replace(/\/edit(?:\?.*)?$/, "/export?format=xlsx");
}

export async function generateMetadata({
  params,
}: SystemKitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    return {
      title: "Kit système introuvable - Demaa",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `Kit système ${data.system.name} | Demaa`,
    description: `Tous les documents du kit système pour ${data.system.name}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SystemKitPage({ params }: SystemKitPageProps) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  if (!data) {
    notFound();
  }

  const documents = getSystemKitDocumentEntries(data.system.slug, data.detail.systeme);
  const pilotingSheetHref = PILOTING_SHEET_URLS[data.system.slug];
  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <Link
            href={`/systemes/${data.system.slug}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Revenir au système
          </Link>

          <div className="mt-6 rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Kit système
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-blue sm:text-4xl">
              Le kit système pour {data.system.name}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-dema-muted">
              Tous les documents du système regroupés au même endroit, avec un accès direct métier par métier.
            </p>

            <div className="mt-6">
              <a
                href={`/api/kit-systeme/${data.system.slug}/download`}
                className="demaa-primary-button inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger tout le kit
              </a>
            </div>

          </div>

          <div className="mt-6 grid gap-4">
            {data.detail.systeme?.cards.map((card) => (
              <section
                key={card.pillar}
                className="rounded-[1.35rem] border border-dema-line bg-dema-paper p-5 sm:p-6"
              >
                <h2 className="text-xl font-semibold tracking-tight text-brand-blue">
                  {card.pillar}
                </h2>

                <div className="mt-5 space-y-3">
                  {card.pillar === "Direction" && pilotingSheetHref ? (
                    <div className="rounded-[1rem] border border-dema-line bg-dema-sage/40 px-4 py-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-brand-blue">
                            Organiser les routines de pilotage
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 text-sm text-dema-muted">
                            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                            <span>Plan des tâches de pilotage</span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-dema-muted">
                            Tâches récurrentes, responsables, fréquences et priorités.
                          </p>
                        </div>
                        <a
                          href={getSpreadsheetDownloadHref(pilotingSheetHref)}
                          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {card.items.map((item) => {
                    const entry = documents.find(
                      (documentEntry) =>
                        documentEntry.pillar === card.pillar &&
                        documentEntry.process === item.process &&
                        documentEntry.document === item.document
                    );

                    return (
                      <div
                        key={`${card.pillar}-${item.process}`}
                        className="rounded-[1rem] border border-dema-line bg-white px-4 py-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-brand-blue">{item.process}</p>
                            <div className="mt-2 inline-flex items-center gap-2 text-sm text-dema-muted">
                              <FileText className="h-4 w-4" aria-hidden="true" />
                              <span>{item.document}</span>
                            </div>
                          </div>

                          {entry?.downloadHref ? (
                            <a
                              href={entry.downloadHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
                            >
                              <Download className="h-4 w-4" aria-hidden="true" />
                              Télécharger
                            </a>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
