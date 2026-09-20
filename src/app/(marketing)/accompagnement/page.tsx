import type { Metadata } from "next";
import TransmissionLandingPage from "@/components/TransmissionLandingPage";

const title = "Préparer son entreprise à la vente | sini";
const description =
  "Un accompagnement de six mois pour structurer les processus, les responsabilités, les outils et le pilotage de votre entreprise avant sa vente.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description, siteName: "sini", locale: "fr_FR", type: "website" },
  twitter: { card: "summary", title, description },
};

export default function AccompagnementPage() {
  return <TransmissionLandingPage />;
}
