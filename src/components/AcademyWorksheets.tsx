import Link from "next/link";
import { ACADEMY_COURSES, academyWorksheetHref } from "@/lib/academy-courses";

export default function AcademyWorksheets() {
  return <section aria-labelledby="supports-cours" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <h2 id="supports-cours" className="demaa-section-title text-3xl sm:text-4xl">Les supports des cours</h2>
    <p className="mt-4 max-w-2xl text-dema-muted">Dix tableaux simples à compléter pour passer de la méthode à votre organisation. Chaque support contient un exemple fictif et une ligne à remplir.</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">{ACADEMY_COURSES.map(course => <article key={course.slug} className="border-t border-dema-line py-5"><p className="text-xs uppercase tracking-widest text-dema-muted">{course.category} · CSV</p><h3 className="mt-2 text-xl leading-tight">{course.title}</h3><div className="mt-4 flex flex-wrap gap-5 text-sm text-dema-forest"><a href={academyWorksheetHref(course.slug)} download className="underline underline-offset-4">Télécharger le modèle</a><Link href={`/tutoriels/${course.slug}#exercice`} className="underline underline-offset-4">Voir le cours et l’exercice</Link></div></article>)}</div>
  </section>;
}
