import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
  toolDirectory,
} from "@/lib/tool-directory";

type LogicielDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return toolDirectory.map((tool) => ({
    slug: getToolDirectorySlug(tool),
  }));
}

export async function generateMetadata({
  params,
}: LogicielDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolDirectoryItemBySlug(slug);

  if (!tool) {
    return {
      title: "Logiciel introuvable - Demaa",
    };
  }

  return {
    title: `${tool.name} - Annuaire Logiciels Demaa`,
    description: tool.description,
  };
}

export default async function LogicielDetailPage({
  params,
}: LogicielDetailPageProps) {
  const { slug } = await params;
  const tool = getToolDirectoryItemBySlug(slug);

  if (!tool) {
    notFound();
  }

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/annuaire-logiciel"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-brand-coral"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Revenir à l&apos;annuaire des logiciels
          </Link>

          <section className="mt-8 rounded-[2rem] border border-brand-blue/8 bg-[#FFF9F8] px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-coral">
              {tool.category}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
              {tool.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
              {tool.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {tool.sectors.map((sector) => (
                <span
                  key={sector}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-blue/75"
                >
                  {sector}
                </span>
              ))}
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-coral/10 px-3 py-1.5 text-xs font-medium text-brand-coral"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-brand-blue/8 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-brand-blue">
                À quoi sert ce logiciel ?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                {tool.bestFor}
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Utile pour structurer l'activité sans multiplier les fichiers.",
                  "Pertinent si vous voulez gagner du temps sur un usage précis.",
                  "À comparer avec vos outils actuels avant de changer toute votre stack.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-coral" />
                    <p className="text-sm leading-relaxed text-gray-600">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-brand-blue/8 bg-white p-6 sm:p-8">
              <p className="text-sm font-medium text-gray-400">Tarification</p>
              <p className="mt-2 text-3xl font-semibold text-brand-blue">{tool.pricingHint}</p>

              <div className="mt-8 border-t border-brand-blue/8 pt-6">
                <p className="text-sm font-medium text-gray-400">Lien officiel</p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-coral"
                >
                  Visiter le site du logiciel
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
