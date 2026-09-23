import OperationalAccompanimentLandingPage from "@/components/OperationalAccompanimentLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Organisez votre entreprise pour qu’elle repose moins sur vous | Demaa";
const description =
  "En quatre semaines, on met en place un système centralisé : informations, suivi, responsabilités, procédures et routines.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <OperationalAccompanimentLandingPage />;
}
