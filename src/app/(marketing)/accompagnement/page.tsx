import TransmissionLandingPage from "@/components/TransmissionLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Structuration, automatisation & IA | Demaa";
const description = "Demaa structure et automatise un fonctionnement prioritaire pour faire gagner du temps à l’équipe et rendre l’entreprise plus simple à piloter ou à transmettre.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <TransmissionLandingPage />;
}
