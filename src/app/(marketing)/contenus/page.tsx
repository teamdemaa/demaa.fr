import Navbar from "@/components/Navbar";
import ContentDirectoryClient from "@/components/ContentDirectoryClient";
import { getAllPublishedContent } from "@/lib/content-catalog";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Contenus | Demaa",
  description: "Des contenus pratiques pour comprendre les sujets qui structurent et font avancer une entreprise.",
  path: "/contenus",
});

export default function ContentDirectoryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background">
        <ContentDirectoryClient entries={getAllPublishedContent()} />
      </main>
    </>
  );
}
