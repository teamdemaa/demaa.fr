import type { Metadata } from "next";
import ServicesLandingPage from "@/components/ServicesLandingPage";

export const metadata: Metadata = {
  title: "Services pour structurer et développer votre entreprise | Demaa",
  description:
    "Des services concrets pour mieux organiser votre activité, la digitaliser et développer votre visibilité.",
};

export default function ServicesPage() {
  return <ServicesLandingPage />;
}
