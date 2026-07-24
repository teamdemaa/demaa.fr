import type { Metadata } from "next";
import StructurationLandingPage from "@/components/StructurationLandingPage";

export const metadata: Metadata = {
  title: "Structurer votre entreprise | Prévisualisation Demaa",
  description:
    "Prévisualisation de l’offre Demaa pour structurer l’entreprise, installer son système opérationnel et réduire sa dépendance au dirigeant.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StructurationPreviewPage() {
  return <StructurationLandingPage />;
}
