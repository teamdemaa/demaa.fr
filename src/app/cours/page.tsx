import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getAllCourseEntries } from "@/lib/course-content";

export const metadata: Metadata = {
  title: "Cours pour dirigeants de TPE - Demaa",
  description:
    "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
  alternates: {
    canonical: "/cours",
  },
  openGraph: {
    title: "Cours pour dirigeants de TPE - Demaa",
    description:
      "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
    url: "/cours",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cours pour dirigeants de TPE - Demaa",
    description:
      "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
  },
};

export default function CoursesIndexPage() {
  const entries = getAllCourseEntries();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <section className="w-full flex flex-col items-center justify-center pt-8 pb-8 md:pt-10 md:pb-8 px-4 text-center bg-[#ffffff] border-b border-brand-coral/10 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-brand-blue mb-3">
            Nos <span className="text-brand-coral">cours</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-medium">
            Un espace simple pour apprendre les sujets clés et avancer plus sereinement.
          </p>
        </section>

        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <Link key={entry.slug} href={`/cours/${entry.slug}`} className="block group h-full">
                <article className="h-full overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                  <div className="flex aspect-[16/10] items-end border-b border-gray-100 bg-[linear-gradient(135deg,#f8f5ef_0%,#f3efe6_100%)] p-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-blue">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Cours
                    </span>
                  </div>
                  <div className="flex h-full flex-col p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2 text-sm text-brand-coral font-medium">
                        <BookOpen className="w-4 h-4" />
                        <span>{entry.duration}</span>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
                        {entry.category}
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
