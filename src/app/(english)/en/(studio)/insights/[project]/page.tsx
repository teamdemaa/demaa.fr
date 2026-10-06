import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import LearningSubscription from "@/components/LearningSubscription";
import EnglishLandscape from "@/components/EnglishLandscape";
import { ENGLISH_LEARNING_SERIES, ENGLISH_EPISODE_TITLES } from "@/lib/english-learning-series";
import { englishPublishedArticles } from "@/lib/english-publications.server";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
type Props = { params: Promise<{ project: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const { project } = await params; const p = ENGLISH_LEARNING_SERIES.find(p => p.slug === project); if (!p) notFound();
  return buildPublicPageMetadata({ title: `${p.name} · Insights | DEMAA`, description: p.description, path: `/en/insights/${project}` });
}
export default async function Series({ params }: Props) {
  const { project } = await params; const p = ENGLISH_LEARNING_SERIES.find(p => p.slug === project); if (!p) notFound();
  const articles = (await englishPublishedArticles()).filter(a => a.project === project);
  return <><Navbar minimal localeCode="en" publicNavigationActiveView="academy" /><main className="mx-auto max-w-4xl px-5 py-12">
    <Link href="/en/insights" className="text-sm text-dema-muted underline underline-offset-4">All insights</Link>
    <header className="mt-8"><p className="text-xs uppercase tracking-widest text-dema-muted">Venture {String(p.number).padStart(2,"0")}</p><h1 className="demaa-section-title mt-3 text-5xl sm:text-6xl">{p.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-dema-muted">{p.description}</p><EnglishLandscape photo={p} /></header>
    <section className="mt-10 border-t border-dema-line py-8" aria-labelledby="episodes-title"><h2 id="episodes-title" className="text-2xl font-medium">The episodes</h2><ol className="mt-5 divide-y divide-dema-line">{ENGLISH_EPISODE_TITLES.map((title,number) => {
      const a = articles.find(a => a.number === number); const label = `EP${String(number).padStart(2,"0")} · ${title}`;
      return <li key={number}>{a ? <Link href={`/en/insights/${project}/${a.slug}`} className="block py-5">{label}</Link> : <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5"><span>{label}</span><span className="text-sm text-dema-muted">Coming soon</span></div>}</li>;
    })}</ol></section><LearningSubscription localeCode="en" />
  </main></>;
}
