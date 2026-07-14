import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { StructurationLanding } from "@/components/StructurationLanding";

const STRUCTURATION_PAGE_ENABLED = false;

export const metadata: Metadata = {
  title: "Prévisualisation organisation - Demaa",
  description:
    "Prévisualisation de la landing page Demaa consacrée à l'organisation et à l'autonomie de l'entreprise.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function StructurationPage() {
  if (!STRUCTURATION_PAGE_ENABLED) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <StructurationLanding />
      </main>
    </>
  );
}
