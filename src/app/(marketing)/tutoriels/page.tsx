import TutorialsHub from "@/components/TutorialsHub";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { getPublishedMethods } from "@/lib/tutorial-catalog";

const title = "Méthodes pour reprendre, structurer ou vendre | Demaa";
const description =
  "Des méthodes courtes, documentées et directement applicables pour reprendre, structurer ou vendre une entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/tutoriels",
});

export default function TutorialsPage() {
  const tutorials = getPublishedMethods();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Méthodes",
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
