import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Academy - Demaa",
  description:
    "Maîtrisez les bases de la gestion d'entreprise avec les ressources Academy de Demaa.",
  alternates: {
    canonical: "/academy",
  },
};

export const dynamic = "force-dynamic";

export default function AcademyPage() {
  return <HomeHubPage initialTab="academy" />;
}
