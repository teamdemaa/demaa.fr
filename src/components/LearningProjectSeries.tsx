import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LearningSubscription from "@/components/LearningSubscription";
import type { LearningProjectSeries as Series } from "@/lib/academy-project-series";

export default function LearningProjectSeries({ project }: { project: Series }) {
  return <>
    <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
    <main className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/tutoriels" className="text-sm text-dema-muted underline underline-offset-4">Tous les apprentissages</Link>
      <header className="mt-8">
        <p className="text-xs uppercase tracking-widest text-dema-muted">Projet {String(project.number).padStart(2, "0")}</p>
        <h1 className="demaa-section-title mt-3 text-5xl sm:text-6xl">{project.name}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-dema-muted">{project.description}</p>
        <figure className="mt-8">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 896px) 856px, 100vw" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-right text-xs text-white/50">{project.imageCaption}</span>
          </div>
          {project.imageSource && <figcaption className="mt-3 text-xs text-dema-muted"><a href={project.imageSource} target="_blank" rel="noopener noreferrer" className="underline">Photo : {project.imageCredit} · {project.imageProvider}</a>{project.imageLicense && <> · <a href={project.imageLicense} className="underline">CC BY 2.0</a> · Photo recadrée</>}</figcaption>}
        </figure>
      </header>
      <section className="mt-10 border-t border-dema-line py-8" aria-labelledby="episodes-title">
        <h2 id="episodes-title" className="text-2xl font-medium">Les épisodes</h2>
        {project.episodes.length ? <ol className="mt-5 divide-y divide-dema-line">{project.episodes.map(episode => <li key={episode.number}><Link href={episode.href} className="block py-5">EP{String(episode.number).padStart(2, "0")} · {episode.title}</Link></li>)}</ol> : <p className="mt-4 text-dema-muted">Les premiers épisodes seront publiés ici.</p>}
      </section>
      <LearningSubscription />
    </main>
  </>;
}
