import type { Metadata } from "next";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

const title = "Organiser son entreprise | Demaa";
const description =
  "Des processus concrets pour organiser les demandes, les interventions, les documents et le suivi d’une TPE.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/organiser" },
  openGraph: {
    title,
    description,
    url: "/organiser",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function AcademyIndexPage() {
  return (
    <>
      <Navbar />
      <ActionPlanNavbar activeView="academy" routeNavigation />
      <AcademyIndexClient contents={getAllAcademyContent()} />
    </>
  );
}
