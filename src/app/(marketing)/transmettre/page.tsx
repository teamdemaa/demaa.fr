import TransmissionLandingPage from "@/components/TransmissionLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Vendre ou transmettre son entreprise | Demaa";
const description =
  "Préparez une entreprise plus claire, plus autonome et plus simple à vendre ou à transmettre, puis présentez votre projet à Demaa.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/transmettre",
});

export default function TransmettrePage() {
  return <TransmissionLandingPage />;
}
