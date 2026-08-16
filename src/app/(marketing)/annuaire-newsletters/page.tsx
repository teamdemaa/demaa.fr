import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import NewsletterDirectoryClient from "@/components/NewsletterDirectoryClient";
import { getAllNewsletters } from "@/lib/newsletter-content";

export const metadata: Metadata = {
  title: "Annuaire newsletters par secteur - Demaa",
  description:
    "Explorez les newsletters recommandees par Demaa par secteur d'activite et accedez aux sources editoriales deja actives sur leur site d'origine.",
  alternates: {
    canonical: "/annuaire-newsletters",
  },
  openGraph: {
    title: "Annuaire newsletters par secteur - Demaa",
    description:
      "Explorez les newsletters recommandees par Demaa par secteur d'activite et accedez aux sources editoriales deja actives sur leur site d'origine.",
    url: "/annuaire-newsletters",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire newsletters par secteur - Demaa",
    description:
      "Explorez les newsletters recommandees par Demaa par secteur d'activite et accedez aux sources editoriales deja actives sur leur site d'origine.",
  },
};

export default function NewsletterDirectoryPage() {
  const entries = getAllNewsletters();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <NewsletterDirectoryClient entries={entries} />
      </main>
    </>
  );
}
