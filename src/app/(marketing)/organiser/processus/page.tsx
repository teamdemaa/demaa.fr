import type { Metadata } from "next";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

const title = "Des cas concrets pour organiser votre activité | Demaa";
const description =
  "Recherchez des processus concrets pour simplifier les demandes, les plannings, le suivi, les rapports et la facturation de votre entreprise.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/organiser/processus" },
  openGraph: {
    title,
    description,
    url: "/organiser/processus",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function OrganiserProcessusPage() {
  return (
    <>
      <Navbar minimal />
      <ActionPlanNavbar activeView="academy" routeNavigation />
      <AcademyIndexClient
        backLink={{ href: "/organiser", label: "Découvrir l’accompagnement" }}
        contents={getAllAcademyContent()}
      />
    </>
  );
}
