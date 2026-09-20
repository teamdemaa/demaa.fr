import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiniAdviceLibrary from "@/components/SiniAdviceLibrary";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";
import { getPublishedMethods } from "@/lib/tutorial-catalog";

export const metadata: Metadata = {
  title: "Conseil et méthodes | sini — aperçu",
  description: "Des méthodes concrètes pour reprendre, vendre ou préparer la transmission d’une entreprise.",
  robots: { index: false, follow: false },
};

export default function SiniAdvicePage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="advice" publicNavigationVariant="sini" />
      <main className="min-h-screen bg-sini-background text-[#17283e]">
        <header className="mx-auto w-full max-w-6xl px-5 pb-10 pt-14 text-left sm:px-8 sm:pb-12 sm:pt-20 lg:pt-24">
          <h1 className={`${satoshiHeroTitleClassName} max-w-5xl`}>
            Des méthodes concrètes pour reprendre, préparer ou transmettre.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-[#627181] sm:text-lg sm:leading-8">
            Chaque méthode répond à une question précise, cite ses sources et propose une action réalisable.
          </p>
        </header>
        <SiniAdviceLibrary methods={getPublishedMethods()} />
        <aside className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[1.25rem] border border-[#d8e0e7] bg-white px-6 py-8 sm:px-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.17em] text-[#597391]">Un besoin plus personnel ?</p>
            <h2 className="mt-3 font-serif text-3xl text-[#17283e]">Préparer la suite avec un accompagnement.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#627181]">Les méthodes sont libres d’accès. L’accompagnement, lorsqu’il est utile, constitue un parcours distinct.</p>
            <Link href="/accompagnement" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#244a68] px-5 text-sm font-medium text-white transition hover:bg-[#315f82]">Découvrir l’accompagnement</Link>
          </div>
        </aside>
      </main>
    </>
  );
}
