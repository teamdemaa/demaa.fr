import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { StructurationLanding } from "@/components/StructurationLanding";

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
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream text-brand-blue">
        <StructurationLanding />
      </main>
    </>
  );
}
