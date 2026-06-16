import type { Metadata } from "next";
import HomeHubPage from "@/components/HomeHubPage";

export const metadata: Metadata = {
  title: "Structurez efficacement votre entreprise | Organisation TPE - Demaa",
  description:
    "Pour que votre entreprise ne repose plus uniquement sur vous, mettez en place les bons systèmes et créez les conditions d'une croissance durable.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Structurez efficacement votre entreprise | Organisation TPE - Demaa",
    description:
      "Pour que votre entreprise ne repose plus uniquement sur vous, mettez en place les bons systèmes et créez les conditions d'une croissance durable.",
    url: "/",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structurez efficacement votre entreprise | Organisation TPE - Demaa",
    description:
      "Pour que votre entreprise ne repose plus uniquement sur vous, mettez en place les bons systèmes et créez les conditions d'une croissance durable.",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return <HomeHubPage />;
}
