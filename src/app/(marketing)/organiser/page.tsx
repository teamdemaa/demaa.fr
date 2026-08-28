import AcademyIndexClient from "@/components/AcademyIndexClient";
import Navbar from "@/components/Navbar";
import OrganiserSectionNavigation from "@/components/OrganiserSectionNavigation";
import { getAllAcademyContent } from "@/lib/academy-course-content";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

const title = "Des cas concrets pour mieux organiser votre entreprise | Demaa";
const description =
  "Des processus concrets pour voir clairement ce qu’il faut mettre en place dans votre activité.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/organiser",
});

export default function OrganiserIndexPage() {
  const contents = getAllAcademyContent();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Organiser",
    description,
    path: "/organiser",
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
      <Navbar publicNavigationActiveView="academy" />
      <OrganiserSectionNavigation activeSection="processes" />
      <AcademyIndexClient contents={contents} />
    </>
  );
}
