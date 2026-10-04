import Navbar from "@/components/Navbar";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "L’équipe | DEMAA",
  description: "Deux fondatrices aux parcours complémentaires et une équipe de confiance avec laquelle nous travaillons depuis de nombreuses années.",
  path: "/equipe",
});

export default function TeamPage() {
  return <>
    <Navbar publicNavigationActiveView="none" />
    <main className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <header className="pb-12 pt-12 text-center md:pt-16">
        <h1 className="text-balance font-light leading-[0.94] tracking-tight" style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}>
          <span className="demaa-hero-title block text-dema-forest">L’équipe.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-dema-muted">Nous travaillons depuis de nombreuses années avec la même équipe de confiance. Cette relation durable nous permet de construire les projets avec une connaissance commune du terrain et de nos façons de travailler.</p>
      </header>
      <section className="py-8" aria-labelledby="founders-title">
        <h2 id="founders-title" className="demaa-section-title text-3xl sm:text-4xl">Deux parcours complémentaires.</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Aïssata Gory</h3><p className="mt-2 text-sm text-dema-forest">Finance & pilotage</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">Directrice financière et entrepreneure, Aïssata apporte son expérience de la gestion financière et de la comptabilité, notamment chez CBRE et Transdev.</p></article>
          <article className="border-t border-dema-line pt-6"><h3 className="text-2xl font-medium">Oumou Gory</h3><p className="mt-2 text-sm text-dema-forest">Développement & opérations</p><p className="mt-5 max-w-lg text-base leading-7 text-dema-muted">Spécialiste du lancement et de la structuration de projets, Oumou a été directrice pays chez Heetch et consultante senior chez Deloitte et PwC.</p></article>
        </div>
      </section>
    </main>
  </>;
}
