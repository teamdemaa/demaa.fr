import TransmissionLandingPage from "@/components/TransmissionLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Préparer son entreprise à la vente | Demaa";
const description = "Demaa structure les processus, les outils et les informations de votre entreprise pour la rendre plus simple à présenter et à transmettre.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <TransmissionLandingPage />;
}
