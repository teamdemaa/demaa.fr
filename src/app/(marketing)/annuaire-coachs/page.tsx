import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import CoachDirectoryClient from "@/components/CoachDirectoryClient";
import { coachProfiles } from "@/lib/coach-directory";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = {
  ...buildPublicPageMetadata({
    title: "Annuaire de coachs pour dirigeants | Demaa",
    description: "Explorez des profils publics de coachs selon vos besoins de pilotage, d’organisation, de leadership ou de développement commercial.",
    path: "/annuaire-coachs",
  }),
  robots: { index: false, follow: false },
};

export default function CoachDirectoryPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="specialists" publicNavigationVariant="demaa" />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <header className="mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-14 lg:px-8">
          <Link href="/specialistes" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-dema-muted transition hover:text-dema-forest"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux spécialistes</Link>
          <h1 className="mt-4 font-serif text-4xl font-light leading-tight tracking-tight sm:text-5xl">Trouver un coach pour votre entreprise.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">Des profils aux approches différentes, à explorer selon votre situation. Comparez leurs spécialités, consultez leur site ou demandez à Demaa de vérifier une mise en relation.</p>
        </header>
        <CoachDirectoryClient coaches={coachProfiles} />
      </main>
    </>
  );
}
