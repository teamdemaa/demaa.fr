import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CircleAlert, FileClock } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";
import {
  getNewsletterBySlug,
  getPendingNewsletterArticleBySlugs,
} from "@/lib/newsletter-content";

type PendingNewsletterArticlePageProps = {
  params: Promise<{ newsletterSlug: string; articleSlug: string }>;
};

export const metadata: Metadata = {
  title: "Prévisualisation newsletter à valider - Demaa",
  description: "Prévisualisation interne d'une édition de newsletter en attente de validation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PendingNewsletterArticlePage({
  params,
}: PendingNewsletterArticlePageProps) {
  const { newsletterSlug, articleSlug } = await params;
  const article = getPendingNewsletterArticleBySlugs(newsletterSlug, articleSlug);
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!article || !newsletter) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh] py-16 px-4">
        <article className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <Link
            href="/newsletters-a-valider"
            className="inline-flex items-center text-brand-blue hover:text-neutral-700 font-medium mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux éditions à valider
          </Link>

          <div className="mb-8 rounded-[1.15rem] border border-dema-forest/15 bg-dema-sage/65 px-5 py-4 text-sm text-dema-forest">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
                <FileClock className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">Prévisualisation interne</p>
                <p className="mt-1 leading-relaxed">
                  Cette édition est en statut <strong>a_valider</strong>. Étape suivante attendue:
                  relecture, ajustement éventuel, puis passage manuel en <strong>publie</strong>.
                </p>
              </div>
            </div>
          </div>

          <header className="mb-12 border-b border-gray-100 pb-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand-coral/10 px-4 py-2 text-sm font-medium text-brand-coral">
                {newsletter.title}
              </span>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-neutral-700">
                Brouillon éditorial
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-brand-blue mt-6 mb-4 leading-tight">
              {article.title}
            </h1>
            <p className="text-lg leading-8 text-gray-600">{article.description}</p>
          </header>

          <div className="mb-8 rounded-[1.15rem] border border-brand-coral/15 bg-brand-coral/5 px-5 py-4 text-sm text-brand-blue">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 h-4 w-4 text-brand-coral" />
              <div className="leading-relaxed">
                <p>
                  Pour valider ce contenu avec moi, tu peux maintenant me dire par exemple:
                  <strong> publie cet article</strong>, <strong>raccourcis-le</strong> ou
                  <strong> réécris l&apos;angle</strong>.
                </p>
                <p className="mt-3">
                  Si tu veux le passer en publié dans le repo, la commande prévue est :
                </p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-brand-blue px-4 py-3 text-xs text-white">
                  {`npm run newsletter:status -- ${newsletter.slug} ${article.slug} publie`}
                </pre>
                <p className="mt-3">
                  Et pour générer un nouveau brouillon du même type :
                </p>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-brand-blue px-4 py-3 text-xs text-white">
                  {`npm run newsletter:generate -- ${newsletter.slug} "nouvel angle du mois" --dry-run`}
                </pre>
              </div>
            </div>
          </div>

          <div className="[&>p]:mb-6 [&>p]:text-lg [&>p]:leading-8 [&>p]:text-gray-700 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-brand-blue [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-brand-blue [&>ul]:mb-7 [&>ul]:list-disc [&>ul]:space-y-3 [&>ul]:pl-6 [&>ul>li]:text-lg [&>ul>li]:leading-8 [&>ul>li]:text-gray-700 [&>ol]:mb-7 [&>ol]:list-decimal [&>ol]:space-y-3 [&>ol]:pl-6 [&>ol>li]:text-lg [&>ol>li]:leading-8 [&>ol>li]:text-gray-700 [&>strong]:font-semibold [&>strong]:text-brand-blue">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  );
}
