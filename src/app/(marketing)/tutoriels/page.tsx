import Link from "next/link";
import { publishedArticles } from "@/lib/publications.server";
import LearningSubscription from "@/components/LearningSubscription";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

const title = "Apprentissages du Studio | DEMAA";
const description =
  "Des cas concrets et des méthodes pour construire et développer une entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/tutoriels",
});

export const dynamic = "force-dynamic";

export default async function TutorialsPage() {
  const cards = getAcademyPreviewCards();
  const studioArticles = (await publishedArticles()).filter(article => article.project === "demaa");
  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-background">
        <ResourcesNavigation activeView="tutorials" />
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
            <span className="block text-brand-blue/62">On partage</span>
            <span className="demaa-hero-title block text-dema-forest">nos apprentissages.</span>
          </h1>
        </header>
        <AcademyPreviewLibrary cards={cards} showControls={false} />
        {studioArticles.length > 0 && <section aria-labelledby="studio-learning-title" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><h2 id="studio-learning-title" className="demaa-section-title mb-8 text-4xl sm:text-5xl">Dans le Studio</h2><div className="border-t border-dema-line">{[1, 2, 0].flatMap(number => studioArticles.filter(article => article.number === number)).map(article => <Link key={article.slug} href={`/tutoriels/demaa/${article.slug}`} className="flex items-center justify-between gap-6 border-b border-dema-line py-6 text-xl text-brand-blue sm:text-2xl"><span>{article.title}</span><span aria-hidden="true">→</span></Link>)}</div></section>}
        <div className="mx-auto max-w-4xl px-5 pb-16"><LearningSubscription /></div>
      </main>
    </>
  );
}
