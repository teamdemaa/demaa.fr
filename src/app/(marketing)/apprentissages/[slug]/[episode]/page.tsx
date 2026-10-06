import Link from "next/link";
import Image from "next/image";
import PublicationArticleContent from "@/components/PublicationArticleContent";
import PublicationReading from "@/components/PublicationReading";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { publishedArticle } from "@/lib/publications.server";
import { PROJECTS, publicationTitles, publicationSlot } from "@/lib/publication-contract";
import { getLearningProjectSeries, getApproachLandscape } from "@/lib/academy-project-series";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

type Props = { params: Promise<{ slug: string; episode: string }> };
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export function generateStaticParams() {
  return PROJECTS.flatMap(project => publicationTitles(project).map((_, number) => ({ slug: project, episode: publicationSlot(project, number).slug })));
}
export async function generateMetadata({ params }: Props) {
  const { slug, episode } = await params;
  const article = await publishedArticle(slug, episode);
  if (!article) notFound();
  return buildPublicPageMetadata({ title: `${article.title} | DEMAA`, description: article.description, path: `/apprentissages/${slug}/${episode}`, type: "article" });
}
export default async function EpisodePage({ params }: Props) {
  const { slug, episode } = await params;
  const article = await publishedArticle(slug, episode);
  const project = getLearningProjectSeries(slug);
  if (!article || (!project && slug !== "demaa")) notFound();
  const photo = slug === "demaa" ? getApproachLandscape(article.number) : undefined;
  return <>
    <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
    <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <Link href={slug === "demaa" ? "/apprentissages" : `/apprentissages/${slug}`} className="text-sm text-dema-muted underline underline-offset-4">{slug === "demaa" ? "← Les apprentissages" : `← Les épisodes de ${project!.name}`}</Link>
      <article className="mx-auto mt-10 max-w-[680px]">
        <header className="mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-dema-muted">{slug === "demaa" ? "Approche" : `${project!.name} · EP${String(article.number).padStart(2, "0")}`}</p>
          <h1 className="demaa-section-title mt-5 text-5xl leading-[1.08] sm:text-6xl">{article.title}</h1>
          {photo && <figure className="mt-8">
            <div className="relative aspect-video overflow-hidden rounded-2xl">
              <Image src={photo.image} alt={photo.imageAlt} fill sizes="(min-width: 720px) 680px, 100vw" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-right text-xs text-white/50">{photo.imageCaption}</span>
            </div>
            {photo.imageSource && <figcaption className="mt-3 text-xs text-dema-muted"><a href={photo.imageSource} target="_blank" rel="noopener noreferrer" className="underline">Photo : {photo.imageCredit} · {photo.imageProvider}</a>{photo.imageLicense && <> · <a href={photo.imageLicense} className="underline">CC BY 2.0</a> · Photo recadrée</>}</figcaption>}
          </figure>}
        </header>
        <div className="space-y-6 text-lg leading-8 text-brand-blue/85 sm:text-xl sm:leading-9">
          <PublicationArticleContent text={article.text} genesisProject={article.number === 0 ? slug : undefined} framework={(slug === "demaa" ? article.number === 1 : (article.number === 1 || article.number === 2)) ? { kind: article.number === 1 ? "strategy" : "plan", project: slug } : undefined} />
        </div>
        <PublicationReading project={slug} number={article.number} />
      </article>
    </main>
  </>;
}
