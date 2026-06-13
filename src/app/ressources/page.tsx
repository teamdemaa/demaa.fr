import Image from "next/image";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";
import { getAllEditorialEntries } from "@/lib/editorial-content";

export const metadata: Metadata = {
  title: "Ressources Demaa",
  description: "Retrouvez les articles, ressources et templates utiles pour structurer, piloter et développer votre activité.",
  alternates: {
    canonical: "/ressources",
  },
  openGraph: {
    title: "Ressources Demaa",
    description: "Retrouvez les articles, ressources et templates utiles pour structurer, piloter et développer votre activité.",
    url: "/ressources",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ResourcesIndexPage() {
  const entries = getAllEditorialEntries();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <section className="w-full flex flex-col items-center justify-center pt-8 pb-8 md:pt-10 md:pb-8 px-4 text-center bg-[#ffffff] border-b border-brand-coral/10 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-brand-blue mb-3">
            Nos <span className="text-brand-coral">ressources</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium">
            Un seul espace pour retrouver les contenus, ressources et templates utiles à votre activité.
          </p>
        </section>

        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entries.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                Aucun contenu publié pour le moment.
              </div>
            )}

            {entries.map((entry) => (
              <Link key={entry.slug} href={`/ressources/${entry.slug}`} className="block group h-full">
                <article className="h-full overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-dema-cream border-b border-gray-100">
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-end bg-[linear-gradient(135deg,#f8f5ef_0%,#f3efe6_100%)] p-5">
                        <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                          {entry.type}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col p-6 h-full">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2 text-sm text-brand-coral font-medium">
                        <BookOpen className="w-4 h-4" />
                        <span>{new Date(entry.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                        {entry.type}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-brand-blue transition-colors group-hover:text-neutral-700">
                      {entry.title}
                    </h2>
                    <p className="mt-3 text-gray-500 leading-relaxed">
                      {entry.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-dema-sage/75 px-2.5 py-1 text-[10px] font-medium text-brand-blue/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex justify-end pt-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-brand-blue transition-colors group-hover:bg-neutral-100 group-hover:text-neutral-700">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
