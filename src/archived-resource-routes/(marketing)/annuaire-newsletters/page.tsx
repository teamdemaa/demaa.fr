import Navbar from "@/components/Navbar";
import NewsletterDirectoryClient from "@/components/NewsletterDirectoryClient";
import { getAllNewsletters } from "@/lib/newsletter-content";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Annuaire newsletters par secteur - Demaa",
  description:
    "Explorez les newsletters recommandees par Demaa par secteur d'activite et accedez aux sources editoriales deja actives sur leur site d'origine.",
  path: "/annuaire-newsletters",
});

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
