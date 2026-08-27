import ServicesLandingPage from "@/components/ServicesLandingPage";
import {
  buildServicesIndexJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Services pour organiser votre entreprise et gagner du temps | Demaa";
const description =
  "Des services concrets pour gagner du temps et faire en sorte que votre entreprise dépende moins de vous.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeServicesJsonLd(buildServicesIndexJsonLd()),
        }}
      />
      <ServicesLandingPage />
    </>
  );
}
