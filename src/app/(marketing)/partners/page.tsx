import DemaaPartnersLandingPage from "@/components/DemaaPartnersLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Demaa Partners | Faire grandir la valeur de votre entreprise";
const description =
  "Structurez une entreprise de services plus rentable, plus prévisible et moins dépendante de son dirigeant grâce à des processus clairs et un pilotage fiable.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/partners",
});

export default function PartnersPage() {
  return <DemaaPartnersLandingPage />;
}
