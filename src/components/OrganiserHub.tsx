import Navbar from "@/components/Navbar";
import AcademyPreviewLibrary from "@/components/AcademyPreviewLibrary";
import { getAcademyPreviewCards } from "@/lib/academy-preview-catalog";

export default function OrganiserHub() {
  const cards = getAcademyPreviewCards();

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background">
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span className="block text-brand-blue/62">Organiser et piloter son entreprise,</span>
            <span className="demaa-hero-title block text-dema-forest">un sujet à la fois.</span>
          </h1>
        </header>
        <AcademyPreviewLibrary cards={cards} />
      </main>
    </>
  );
}
