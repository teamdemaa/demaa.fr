import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Les modèles vivent désormais dans Académie et dans l’onglet Ressources.

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export async function generateStaticParams() {
  return [];
}

export default function DocumentModelDetailPage() {
  notFound();
}
