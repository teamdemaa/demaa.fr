import { getCanonicalOrigin } from "@/lib/site-url";
import { serializePublicJsonLd } from "@/lib/public-index-json-ld";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ResourcesNavigation from "@/components/ResourcesNavigation";
import { ACADEMY_COURSES, ACADEMY_LEARNING_LABEL, academyWorksheetHref, type AcademyCourse } from "@/lib/academy-courses";

export default function AcademyCourseArticle({ course }: { course: AcademyCourse }) {
  const index = ACADEMY_COURSES.findIndex(({ slug }) => slug === course.slug);
  const next = ACADEMY_COURSES[(index + 1) % ACADEMY_COURSES.length];
  const origin = getCanonicalOrigin();
  const jsonLd = { "@context": "https://schema.org", "@type": "Article", headline: course.title, description: course.objective, url: `${origin}/tutoriels/${course.slug}`, image: `${origin}${course.image}`, inLanguage: "fr-FR", datePublished: "2026-10-03", dateModified: "2026-10-03", author: { "@type": "Organization", name: "Demaa" } };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }} />
    <Navbar minimal publicNavigationActiveView="academy" publicNavigationVariant="demaa" />
    <main className="min-w-0 bg-background">
      <ResourcesNavigation activeView="tutorials" />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link href="/tutoriels" className="text-sm text-dema-muted underline underline-offset-4">Tous les cours</Link>
        <header className="mt-8">
          <p className="text-xs uppercase tracking-[0.14em] text-dema-forest">{ACADEMY_LEARNING_LABEL} · {course.category}</p>
          <h1 className="demaa-section-title mt-4 text-balance text-4xl leading-tight tracking-tight sm:text-5xl">{course.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-dema-muted">{course.objective}</p>
          <figure className="mt-8">
            <div className="relative aspect-video overflow-hidden rounded-2xl"><Image src={course.image} alt={course.imageAlt} fill sizes="(min-width: 896px) 848px, 100vw" className="object-cover" /><span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8 text-right text-xs text-white/50">{course.imageCaption}</span></div>
            <figcaption className="mt-3 text-xs text-dema-muted">{course.imageSource ? <a href={course.imageSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Photo : {course.imageCredit} · Unsplash</a> : <span>{course.imageCredit}</span>}</figcaption>
          </figure>
        </header>
        <div className="mx-auto max-w-2xl text-base leading-8">
          <p className="mt-10">{course.intro}</p>
          <nav aria-label="Étapes du cours" className="my-8 border-y border-dema-line py-6"><ol className="space-y-2">{course.steps.map((step, i) => <li key={step.title}><a href={`#etape-${i + 1}`} className="text-dema-forest underline decoration-dema-line underline-offset-4">{i + 1}. {step.title}</a></li>)}</ol></nav>
          {course.steps.map((step, i) => <section key={step.title} id={`etape-${i + 1}`} className="mt-10 scroll-mt-28"><h2 className="text-2xl font-medium leading-tight tracking-tight">{i + 1}. {step.title}</h2><p className="mt-4">{step.body}</p></section>)}
          <aside className="mt-10 rounded-2xl bg-dema-sage/60 p-6"><h2 className="text-xl font-medium">Un exemple concret</h2><p className="mt-3">{course.example}</p></aside>
          <section id="exercice" className="mt-10 scroll-mt-28"><p className="text-xs uppercase tracking-widest text-dema-forest">À vous de jouer</p><h2 className="mt-2 text-2xl font-medium">Appliquer à votre entreprise</h2><p className="mt-4">{course.exercise}</p><a href={academyWorksheetHref(course.slug)} download className="mt-5 inline-flex min-h-12 items-center rounded-full bg-dema-forest px-6 py-3 text-sm font-medium text-white">Télécharger le support CSV</a><p className="mt-3 text-sm leading-6 text-dema-muted">Ouvrez le tableau dans Excel ou Google Sheets. Remplacez l’exemple fictif par votre situation et complétez la ligne vide.</p></section>
          <section className="mt-10"><h2 className="text-2xl font-medium">Avant de passer à la suite</h2><ul className="mt-4 list-disc space-y-2 pl-5">{course.checks.map(check => <li key={check}>{check}</li>)}</ul><p className="mt-5"><strong>Le piège à éviter : </strong>{course.mistake}</p></section>
          <footer className="mt-12 border-t border-dema-line pt-8">
            <p className="text-sm uppercase tracking-widest text-dema-muted">Le cours suivant</p>
            <h2 className="mt-3 text-2xl font-normal leading-snug text-dema-forest">{next.title}</h2>
            <Link href={`/tutoriels/${next.slug}`} className="mt-5 inline-flex min-h-12 items-center rounded-full bg-dema-forest px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest focus-visible:ring-offset-4">Lire le cours suivant <span aria-hidden="true" className="ml-3">→</span></Link>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-dema-muted"><Link href="/modeles" className="underline underline-offset-4">Tous les modèles</Link><Link href="/solutions" className="underline underline-offset-4">Solutions par activité</Link></div>
          </footer>
        </div>
      </article>
    </main>
  </>;
}
