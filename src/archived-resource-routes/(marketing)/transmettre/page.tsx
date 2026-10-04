import BusinessSaleLandingPage from "@/components/BusinessSaleLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Vendre son entreprise | Demaa";
const description =
  "Demaa présente gratuitement votre entreprise à des repreneurs dont le projet peut correspondre, puis organise les premières mises en relation.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/transmettre",
});

export default function TransmettrePage() {
  return <BusinessSaleLandingPage />;
}
