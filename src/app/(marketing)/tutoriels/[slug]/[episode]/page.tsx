import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import LearningSubscription from "@/components/LearningSubscription";
import { publishedArticle } from "@/lib/publications.server";
import { EPISODE_SLUGS, articleParagraphs } from "@/lib/publication-contract";
import { LEARNING_PROJECT_SERIES } from "@/lib/academy-project-series";
import { getLearningProjectSeries } from "@/lib/academy-project-series";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type Props = { params: Promise<{ slug: string; episode: string }> };
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export function generateStaticParams() {
  return LEARNING_PROJECT_SERIES.flatMap(project => EPISODE_SLUGS.map(episode => ({ slug: project.slug, episode })));
}
export async function generateMetadata({ params }: Props) {
  const { slug, episode } = await params;
  const article = await publishedArticle(slug, episode);
  if (!article) notFound();
  return buildPublicPageMetadata({ title: `${article.title} | DEMAA`, description: article.description, path: `/tutoriels/${slug}/${episode}`, type: "article" });
}
export default async function EpisodePage({ params }: Props) {
  const { slug, episode } = await params;
  const article = await publishedArticle(slug, episode);
  const project = getLearningProjectSeries(slug);
  if (!article || !project) notFound();
  return <>
    <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <Link href={`/tutoriels/${slug}`} className="text-sm text-dema-muted underline underline-offset-4">← Les épisodes de {project.name}</Link>
      <article className="mx-auto mt-10 max-w-[680px]">
        <header className="mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-dema-muted">{project.name} · EP{String(article.number).padStart(2, "0")}</p>
          <h1 className="demaa-section-title mt-5 text-5xl leading-[1.08] sm:text-6xl">{article.title}</h1>
        </header>
        <div className="space-y-6 text-base leading-8 text-brand-blue/85 sm:text-lg sm:leading-9">
          {articleParagraphs(article.text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </article>
      <div className="mx-auto mt-16 max-w-[680px] border-t border-dema-line pt-10"><LearningSubscription /></div>
    </main>
  </>;
}
