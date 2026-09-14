import TransmissionLandingPage from "@/components/TransmissionLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Préparer son entreprise à la vente | Demaa";
const description =
  "Un accompagnement de six mois pour structurer les processus, les responsabilités, les outils et le pilotage de votre entreprise avant sa vente.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <TransmissionLandingPage />;
}
