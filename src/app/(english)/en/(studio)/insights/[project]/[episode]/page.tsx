import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import EnglishArticleContent from "@/components/EnglishArticleContent";
import EnglishLandscape from "@/components/EnglishLandscape";
import PublicationReading from "@/components/PublicationReading";
import { englishPublishedArticle } from "@/lib/english-publications.server";
import { ENGLISH_LEARNING_SERIES } from "@/lib/english-learning-series";
import { getApproachLandscape } from "@/lib/academy-project-series";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
type Props = { params: Promise<{ project: string; episode: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const { project, episode } = await params; const a = await englishPublishedArticle(project,episode); if (!a) notFound();
  return buildPublicPageMetadata({ title: `${a.title} | DEMAA`, description: a.description, path: `/en/insights/${project}/${episode}`, type: "article" });
}
export default async function Article({ params }: Props) {
  const { project, episode } = await params; const a = await englishPublishedArticle(project,episode); if (!a) notFound();
  const p = ENGLISH_LEARNING_SERIES.find(p => p.slug === project); const photo = project === "demaa" ? getApproachLandscape(a.number) : undefined;
  return <><Navbar minimal localeCode="en" publicNavigationActiveView="academy" /><main className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
    <Link href={project === "demaa" ? "/en/insights" : `/en/insights/${project}`} className="text-sm text-dema-muted underline underline-offset-4">{project === "demaa" ? "← All insights" : `← ${p!.name} episodes`}</Link>
    <article className="mx-auto mt-10 max-w-[680px]"><header className="mb-10 sm:mb-14"><p className="text-xs uppercase tracking-[0.18em] text-dema-muted">{project === "demaa" ? "Approach" : `${p!.name} · EP${String(a.number).padStart(2,"0")}`}</p><h1 className="demaa-section-title mt-5 text-5xl leading-[1.08] sm:text-6xl">{a.title}</h1>{photo && <EnglishLandscape photo={photo} />}</header>
      <div className="space-y-6 text-lg leading-8 text-brand-blue/85 sm:text-xl sm:leading-9"><EnglishArticleContent paragraphs={a.paragraphs} project={project} number={a.number} /></div>
      <PublicationReading project={project} number={a.number} localeCode="en" />
    </article>
  </main></>;
}
