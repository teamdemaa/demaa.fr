import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import LearningSubscription from "@/components/LearningSubscription";
import { ENGLISH_LEARNING_SERIES, englishLandscape } from "@/lib/english-learning-series";
import { englishPublishedArticles } from "@/lib/english-publications.server";
import { getApproachLandscape } from "@/lib/academy-project-series";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
export const dynamic = "force-dynamic";
export const metadata = buildPublicPageMetadata({ title: "Insights | DEMAA", description: "Real examples, decisions and methods from building and growing our ventures.", path: "/en/insights" });
export default async function Insights() {
  const studio = (await englishPublishedArticles()).filter(a => a.project === "demaa").sort((a,b) => [3,0,1].indexOf(a.number) - [3,0,1].indexOf(b.number));
  const cards = [
    ...studio.map(a => { const photo = englishLandscape(getApproachLandscape(a.number)!); return { format: "Approche" as const, category: "", title: a.title, href: `/en/insights/demaa/${a.slug}`, image: photo.image, imageAlt: photo.imageAlt, imageCaption: photo.imageCaption, summary: "", searchTerms: [] }; }),
    ...ENGLISH_LEARNING_SERIES.map(p => ({ format: "Projet" as const, category: String(p.number).padStart(2,"0"), title: p.name, href: `/en/insights/${p.slug}`, image: p.image, imageAlt: p.imageAlt, imageCaption: p.imageCaption, summary: p.description, searchTerms: [] })),
  ];
  return <><Navbar minimal localeCode="en" publicNavigationActiveView="academy" /><main className="min-h-screen bg-background">
    <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8"><h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}><span className="block text-brand-blue/62">What we’re learning</span><span className="demaa-hero-title block text-dema-forest">as we build.</span></h1></header>
    <AcademyPreviewLibrary cards={cards} showControls={false} localeCode="en" />
    <div className="mx-auto max-w-4xl px-5 pb-16"><LearningSubscription localeCode="en" /></div>
  </main></>;
}
