import AcademySearchHub, {
  type AcademySearchCard,
} from "@/components/AcademySearchHub";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

// The Academy uses the approved, illustrated editorial set rather than the
// older course-pack thumbnails. Each card still opens the same detailed method.
const ACADEMY_REFERENCE_ARTWORK: Readonly<Record<string, string>> = {
  "piloter-sa-tresorerie": "/images/academy/illustrations/piloter-sa-tresorerie-v2.png",
  "comprendre-chiffre-affaires-benefice": "/images/academy/illustrations/comprendre-chiffre-affaires-benefice-v4.png",
  "fixer-ses-prix-sans-vendre-a-perte": "/images/academy/illustrations/fixer-ses-prix-sans-vendre-a-perte-v4.png",
  "construire-systeme-marketing-vente": "/images/academy/illustrations/construire-systeme-marketing-vente-v4.png",
  "transformer-demande-en-client": "/images/academy/illustrations/transformer-demande-en-client-v2.png",
  "deleguer-sans-perdre-le-controle": "/images/academy/illustrations/deleguer-sans-perdre-le-controle-v2.png",
};

export default function OrganiserHub() {
  // The Academy landing page is deliberately a concise editorial selection.
  // These six courses are the ones with the original DEMAA illustration set.
  const courses: AcademySearchCard[] = getAllAcademyContent()
    .filter((content) => content.kind === "course")
    .flatMap((content) => {
      const { card } = content.identity;
      return card.image ? [{
        category: content.identity.category,
        image: ACADEMY_REFERENCE_ARTWORK[content.identity.slug] ?? card.image,
        imageAlt: card.imageAlt,
        slug: content.identity.slug,
        title: content.identity.title,
      }] : [];
    })
    .slice(0, 6);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <AcademySearchHub courses={courses} />
    </>
  );
}
