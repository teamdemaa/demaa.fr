import { publishedArticles } from "@/lib/publications.server";
import LearningSubscription from "@/components/LearningSubscription";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import landscapes from "@/lib/academy-courses-data.json";
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
  const projectCards = getAcademyPreviewCards();
  const studioArticles = (await publishedArticles()).filter(article => article.project === "demaa");
  const studioCards = [1, 2, 0].flatMap(number => studioArticles.filter(article => article.number === number)).map((article, index) => ({
    format: "Approche" as const, category: "", title: article.title,
    href: `/tutoriels/demaa/${article.slug}`,
    image: landscapes[[5, 4, 7][index]].image,
    imageAlt: landscapes[[5, 4, 7][index]].imageAlt,
    imageCaption: landscapes[[5, 4, 7][index]].imageCaption,
    summary: "", searchTerms: [],
  }));
  const cards = [...projectCards, ...studioCards];
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
        <div className="mx-auto max-w-4xl px-5 pb-16"><LearningSubscription /></div>
      </main>
    </>
  );
}
