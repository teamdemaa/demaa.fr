import OrganiserHub from "@/components/OrganiserHub";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

const title = "Cas concrets pour organiser son activité | Demaa";
const description =
  "Des processus expliqués étape par étape, avec les outils et les modèles utiles pour mieux organiser le travail dans votre entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/organiser",
});

export default function OrganiserIndexPage() {
  const jsonLd = buildPublicIndexJsonLd({
    name: "Organisation",
    description,
    path: "/organiser",
    items: [
      { name: "Cas concrets et processus", path: "/organiser#cas-concrets" },
      { name: "Modèles prêts à copier", path: "/modeles" },
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
