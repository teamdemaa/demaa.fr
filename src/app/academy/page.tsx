import type { Metadata } from "next";
import AcademyClient from "@/components/AcademyClient";
import Navbar from "@/components/Navbar";
import { getAllCourseEntries } from "@/lib/course-content";
import { getAllDocumentModels } from "@/lib/document-models";

export const metadata: Metadata = {
  title: "Academy Demaa : cours et ressources pour dirigeants",
  description:
    "Retrouvez les cours et les ressources Demaa pour mieux comprendre, structurer et piloter votre entreprise.",
  alternates: {
    canonical: "/academy",
  },
  openGraph: {
    title: "Academy Demaa : cours et ressources pour dirigeants",
    description:
      "Retrouvez les cours et les ressources Demaa pour mieux comprendre, structurer et piloter votre entreprise.",
    url: "/academy",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
};

export default function AcademyPage() {
  const courses = getAllCourseEntries();
  const resources = getAllDocumentModels();

  return (
    <>
      <Navbar />
      <main className="min-h-[85vh] w-full flex-1 bg-background">
        <AcademyClient courses={courses} resources={resources} />
      </main>
    </>
  );
}
