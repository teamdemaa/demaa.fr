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

type CoursesIndexPageProps = {
  searchParams: Promise<{ retourSysteme?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CoursesIndexPage({
  searchParams,
}: CoursesIndexPageProps) {
  const entries = getAllCourseEntries();
  const resolvedSearchParams = await searchParams;
  const returnSystemSlug = getParamValue(resolvedSearchParams.retourSysteme);
  const backLink = returnSystemSlug
    ? {
        href: `/systemes/${returnSystemSlug}?tab=cours`,
        label: "Retour au système",
      }
    : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-[85vh]">
        <CoursesIndexClient
          entries={entries}
          backLink={backLink}
          returnSystemSlug={returnSystemSlug}
        />
      </main>
    </>
  );
}
