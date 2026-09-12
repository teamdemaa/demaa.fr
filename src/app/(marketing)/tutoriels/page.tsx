import TutorialsHub from "@/components/TutorialsHub";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getPublishedTutorials } from "@/lib/tutorial-catalog";

const title = "Tutoriels Airtable pour organiser son entreprise | Demaa";
const description =
  "Des tutoriels pratiques, étape par étape, pour utiliser Airtable avec des modèles Demaa prêts à copier.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/tutoriels",
});

export default function TutorialsPage() {
  const tutorials = getPublishedTutorials();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Tutoriels",
    description,
    path: "/tutoriels",
    items: tutorials.map((tutorial) => ({
      name: tutorial.title,
      path: `/tutoriels/${tutorial.slug}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <TutorialsHub />
    </>
  );
}
