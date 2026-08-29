import OrganiserHub from "@/components/OrganiserHub";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

const title = "Modèles et cas concrets pour organiser son activité | Demaa";
const description =
  "Des modèles prêts à copier et des cas concrets pour mieux organiser le travail dans votre entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/organiser",
});

export default function OrganiserIndexPage() {
  const jsonLd = buildPublicIndexJsonLd({
    name: "Organiser",
    description,
    path: "/organiser",
    items: [
      { name: "Modèles prêts à copier", path: "/modeles" },
      { name: "Cas concrets et processus", path: "/organiser/processus" },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <OrganiserHub />
    </>
  );
}
