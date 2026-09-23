import OperationalAccompanimentLandingPage from "@/components/OperationalAccompanimentLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Votre entreprise ne doit plus tenir dans votre tête | Demaa";
const description =
  "En quatre semaines, on installe un système de travail partagé : clients, informations, tâches, procédures et routines.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <OperationalAccompanimentLandingPage />;
}
