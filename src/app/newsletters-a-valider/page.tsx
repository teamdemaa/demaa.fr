import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileClock } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  getNewsletterBySlug,
  getPendingNewsletterArticles,
} from "@/lib/newsletter-content";

export const metadata: Metadata = {
  title: "Newsletters à valider - Demaa",
  description: "Vue interne légère des éditions de newsletters en attente de validation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PendingNewslettersPage() {
  const entries = getPendingNewsletterArticles();

  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background px-4 py-16">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_60px_rgba(23,35,29,0.08)] md:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <FileClock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  Validation éditoriale
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                  Newsletters à valider
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-dema-muted">
              Cette vue légère sert à relire les éditions en attente avant publication. Ce n&apos;est pas encore un vrai back-office, mais une file de validation simple.
            </p>
          </div>

          <section className="mt-8">
            {entries.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {entries.map((entry) => {
                  const newsletter = getNewsletterBySlug(entry.newsletterSlug);

                  return (
                    <article
                      key={`${entry.newsletterSlug}:${entry.slug}`}
                      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_6px_18px_rgba(0,0,0,0.045)]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-coral/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-coral">
                          A valider
                        </span>
                        {newsletter ? (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                            {newsletter.title}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-4 text-2xl font-semibold leading-tight text-brand-blue">
                        {entry.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        {entry.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/75"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Link
                          href={`/newsletters-a-valider/${entry.newsletterSlug}/${entry.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-dema-forest transition hover:text-brand-blue"
                        >
                          Ouvrir la prévisualisation
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper p-10 text-center">
                <h2 className="text-xl font-bold text-brand-blue">Aucune édition en attente</h2>
                <p className="mt-3 text-sm font-normal text-dema-muted">
                  Toutes les éditions actuellement connues sont déjà publiées.
                </p>
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
}
