import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import { getAllAcademyContent } from "@/lib/academy-course-content";

const title = "Structurer son entreprise | Demaa";
const description =
  "Des tutoriels concrets à lire pour mieux comprendre, organiser et structurer son entreprise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/academie",
  },
  openGraph: {
    title,
    description,
    url: "/academie",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

type AcademyIndexPageProps = {
  searchParams: Promise<{ retourSysteme?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AcademyIndexPage({ searchParams }: AcademyIndexPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnSystemSlug = getParamValue(resolvedSearchParams.retourSysteme);
  const backLink = returnSystemSlug
    ? {
        href: `/systemes/${returnSystemSlug}`,
        label: "Retour au système métier",
      }
    : undefined;

  return (
    <>
      <Navbar />
      <AcademyIndexClient
        contents={getAllAcademyContent()}
        backLink={backLink}
      />
    </>
  );
}
