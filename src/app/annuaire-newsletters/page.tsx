import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import NewsletterDirectoryClient from "@/components/NewsletterDirectoryClient";
import { getAllNewsletters } from "@/lib/newsletter-content";

export const metadata: Metadata = {
  title: "Annuaire newsletters par secteur - Demaa",
  description:
    "Explorez les newsletters Demaa par secteur d'activité, consultez les articles publiés et abonnez-vous aux prochaines éditions.",
  alternates: {
    canonical: "/annuaire-newsletters",
  },
  openGraph: {
    title: "Annuaire newsletters par secteur - Demaa",
    description:
      "Explorez les newsletters Demaa par secteur d'activité, consultez les articles publiés et abonnez-vous aux prochaines éditions.",
    url: "/annuaire-newsletters",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Annuaire newsletters par secteur - Demaa",
    description:
      "Explorez les newsletters Demaa par secteur d'activité, consultez les articles publiés et abonnez-vous aux prochaines éditions.",
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
