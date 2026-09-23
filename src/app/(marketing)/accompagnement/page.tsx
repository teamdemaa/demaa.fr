import OperationalAccompanimentLandingPage from "@/components/OperationalAccompanimentLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Accompagnement en organisation d’entreprise pour PME | Demaa";
const description =
  "En quatre semaines, nous organisons un flux de travail prioritaire : informations, suivi, responsabilités et routines pour rendre votre entreprise moins dépendante de vous.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/accompagnement",
});

export default function AccompagnementPage() {
  return <OperationalAccompanimentLandingPage />;
}
