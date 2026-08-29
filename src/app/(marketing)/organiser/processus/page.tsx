import AcademyIndexClient from "@/components/AcademyIndexClient";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

const title = "Cas concrets et processus pour organiser son entreprise | Demaa";
const description =
  "Des processus concrets pour voir clairement ce qu’il faut mettre en place dans votre activité.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/organiser/processus",
});

export default function OrganiserProcessusPage() {
  const contents = getAllAcademyContent();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Cas concrets et processus",
    description,
    path: "/organiser/processus",
    items: contents.map((content) => ({
      name: content.identity.shortTitle,
      path: `/organiser/${content.identity.slug}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <Navbar minimal publicNavigationActiveView="academy" />
      <AcademyIndexClient
        contents={contents}
        backLink={{ href: "/organiser", label: "← Retour à Organiser" }}
      />
    </>
  );
}
