import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getAllCourseEntries } from "@/lib/course-content";
import CoursesIndexClient from "@/components/CoursesIndexClient";

export const metadata: Metadata = {
  title: "Cours pour dirigeants de TPE - Demaa",
  description:
    "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
  alternates: {
    canonical: "/cours",
  },
  openGraph: {
    title: "Cours pour dirigeants de TPE - Demaa",
    description:
      "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
    url: "/cours",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cours pour dirigeants de TPE - Demaa",
    description:
      "Retrouvez les cours Demaa pour comprendre les sujets clés, structurer vos décisions et monter en autonomie.",
  },
};

export default function CoursesIndexPage() {
  const entries = getAllCourseEntries();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <CoursesIndexClient entries={entries} />
      </main>
    </>
  );
}
