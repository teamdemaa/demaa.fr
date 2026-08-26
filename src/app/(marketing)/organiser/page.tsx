import type { Metadata } from "next";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

const title = "Des cas concrets pour mieux organiser votre entreprise | Demaa";
const description =
  "Des processus concrets pour simplifier ce qui prend du temps et rendre votre entreprise moins dépendante de vous.";

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

export default function OrganiserIndexPage() {
  return (
    <>
      <Navbar />
      <ActionPlanNavbar activeView="academy" routeNavigation />
      <AcademyIndexClient contents={getAllAcademyContent()} />
    </>
  );
}
