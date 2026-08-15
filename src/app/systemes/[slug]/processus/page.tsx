import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import SystemRecapPrintButton from "@/components/SystemRecapPrintButton";
import { getSystemDetailPageData } from "@/lib/system-detail-page";

type SystemProcessesPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SystemProcessesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);

  return {
    title: data
      ? `Processus métier - ${data.system.name} - Demaa`
      : "Processus métier introuvables - Demaa",
    description: data
      ? `Les processus essentiels du système métier ${data.system.name}, à consulter ou à imprimer.`
      : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function SystemProcessesPage({
  params,
}: SystemProcessesPageProps) {
  const { slug } = await params;
  const data = await getSystemDetailPageData(slug);
  if (!data) notFound();

  const routines = data.detail.systeme?.routines ?? [];

  return (
    <>
      <div className="print:hidden">
        <Navbar minimal />
      </div>
      <main className="min-h-screen bg-background px-4 py-10 text-brand-blue print:bg-white print:px-0 print:py-0 sm:px-6 lg:px-8">
        <article
          data-system-processes
          data-system-recap
          className="mx-auto w-full max-w-4xl rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_18px_50px_rgba(23,35,29,0.06)] print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none sm:p-10"
        >
          <header className="border-b border-dema-line pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Processus métier
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {data.system.name}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-dema-muted sm:text-base">
                  Les processus essentiels à structurer pour piloter cette activité au quotidien.
                </p>
              </div>
              <SystemRecapPrintButton />
            </div>
          </header>

          <section className="py-8" aria-labelledby="processes-title">
            <h2 id="processes-title" className="text-2xl font-semibold tracking-[-0.025em]">
              Liste des processus
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

          <footer className="border-t border-dema-line pt-6 text-xs leading-relaxed text-dema-muted">
            Cette liste reflète les processus actuellement publiés sur Demaa et peut évoluer.
          </footer>
        </article>
      </main>
    </>
  );
}
