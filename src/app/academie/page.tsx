import type { Metadata } from "next";
import AcademyCatalogClient from "@/components/AcademyCatalogClient";
import Navbar from "@/components/Navbar";
import { getAllAcademyVideos } from "@/lib/academy-video-catalog";

const title = "Académie Demaa : apprendre à entreprendre";
const description =
  "Des vidéos courtes et des fiches pratiques pour mieux piloter, vendre, organiser et sécuriser votre entreprise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/academie" },
  openGraph: {
    title,
    description,
    url: "/academie",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function AcademyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream px-4 pb-24 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pb-28">
        <section className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="demaa-hero-title text-[clamp(3rem,6.3vw,5.4rem)] leading-[0.94] tracking-[-0.05em] text-dema-forest">
              Apprendre à entreprendre
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-dema-muted sm:text-lg">
              Des réponses courtes et concrètes pour mieux piloter, vendre,
              organiser et sécuriser votre entreprise.
            </p>
          </div>
          <AcademyCatalogClient videos={getAllAcademyVideos()} />
        </section>
      </main>
    </>
  );
}
