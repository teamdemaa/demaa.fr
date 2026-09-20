import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock3, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getPublishedMethods } from "@/lib/tutorial-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedMethods().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const method = getPublishedMethods().find((item) => item.slug === slug);
  return {
    title: method ? `${method.title} | sini — aperçu` : "Méthode introuvable | sini — aperçu",
    description: method?.summary,
    robots: { index: false, follow: false },
  };
}

export default async function SiniAdviceArticlePage({ params }: Props) {
  const { slug } = await params;
  const method = getPublishedMethods().find((item) => item.slug === slug);
  if (!method) notFound();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="advice" publicNavigationVariant="sini" />
      <main className="min-w-0 overflow-x-clip bg-sini-background text-[#17283e]">
        <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link href="/conseil" className="inline-flex items-center gap-2 text-sm text-[#627181] transition hover:text-[#244a68]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux conseils
          </Link>
          <header className="mx-auto mt-8 max-w-5xl">
            <p className="text-[10px] font-medium tracking-[0.17em] text-[#597391]">sini · {method.category} · {method.readingMinutes} min</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">{method.title}</h1>
          </header>

          <div className="mx-auto mt-12 grid min-w-0 max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <div className="min-w-0 space-y-12">
              <section className="rounded-[1.5rem] bg-[#244a68] px-6 py-7 text-white sm:px-8 sm:py-9" aria-label="Réponse courte">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#dce8f1]">Réponse courte</p>
                <div className="mt-4 space-y-4 text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                  {method.answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              {method.sections.map((section, index) => (
                <section key={section.title} aria-labelledby={`sini-method-${index + 1}`}>
                  <div className="flex items-start gap-4">
                    <span className="pt-1 font-serif text-xl italic text-[#597391]">0{index + 1}</span>
                    <h2 id={`sini-method-${index + 1}`} className="font-serif text-2xl leading-tight sm:text-3xl">{section.title}</h2>
                  </div>
                  <div className="mt-5 space-y-4 text-base leading-8 text-[#627181]">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.items ? (
                      <ul className="space-y-3 pt-1">
                        {section.items.map((item) => <li key={item} className="flex gap-3"><Check className="mt-1.5 h-4 w-4 shrink-0 text-[#597391]" aria-hidden="true" /><span>{item}</span></li>)}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}

              <section className="border-y border-[#d8e0e7] py-8" aria-labelledby="sini-method-example">
                <p className="font-serif text-lg italic text-[#597391]">Exemple construit</p>
                <h2 id="sini-method-example" className="mt-2 text-2xl tracking-tight sm:text-3xl">{method.example.title}</h2>
                <div className="mt-5 space-y-4 text-base leading-8 text-[#627181]">
                  {method.example.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-[#d8e0e7] bg-[#e7eef4] p-6 sm:p-8" aria-labelledby="sini-method-action">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#244a68]">Une action aujourd’hui</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#627181]"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{method.action.duration}</span>
                </div>
                <h2 id="sini-method-action" className="mt-3 text-2xl tracking-tight sm:text-3xl">{method.action.title}</h2>
                <p className="mt-4 text-base leading-7 text-[#627181]">{method.action.introduction}</p>
                <ol className="mt-5 space-y-3">
                  {method.action.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-serif text-xs text-[#244a68]">{index + 1}</span><span>{step}</span></li>)}
                </ol>
                <p className="mt-5 border-t border-[#cddae4] pt-5 text-sm font-medium leading-6 text-[#244a68]">Résultat : {method.action.result}</p>
              </section>

              <section aria-labelledby="sini-method-professional">
                <h2 id="sini-method-professional" className="text-2xl tracking-tight">Quand faire intervenir un professionnel ?</h2>
                <p className="mt-4 text-base leading-8 text-[#627181]">{method.professionalHelp}</p>
              </section>

              <section className="border-t border-[#d8e0e7] pt-8" aria-labelledby="sini-method-sources">
                <h2 id="sini-method-sources" className="text-sm font-semibold">Sources pour approfondir</h2>
                <ul className="mt-4 space-y-3">
                  {method.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-sm leading-6 text-[#627181] underline decoration-[#abc0d2] underline-offset-4 transition hover:text-[#244a68]">{source.label}<ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" /></a></li>)}
                </ul>
              </section>

              <aside className="rounded-[1.5rem] bg-white p-6 shadow-[0_16px_50px_rgba(23,40,62,0.04)] ring-1 ring-[#d8e0e7] sm:p-8" aria-labelledby="sini-method-cta">
                <h2 id="sini-method-cta" className="text-2xl tracking-tight">{method.cta.title}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#627181]">{method.cta.description}</p>
                <Link href={method.cta.href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#244a68] px-5 text-sm font-medium text-white transition hover:bg-[#315f82]">{method.cta.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </aside>
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-[#d8e0e7] bg-white p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-medium">À retenir</h2>
              <ul className="mt-4 space-y-4 text-sm leading-relaxed text-[#627181]">
                {method.keyPoints.map((point) => <li key={point} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#597391]" aria-hidden="true" /><span>{point}</span></li>)}
              </ul>
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
