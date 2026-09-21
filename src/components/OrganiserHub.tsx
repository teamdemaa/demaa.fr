import AcademySearchHub, {
  type AcademySearchCard,
} from "@/components/AcademySearchHub";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

export default function OrganiserHub() {
  // The Academy landing page is deliberately a concise editorial selection.
  // These six courses are the ones with the original DEMAA illustration set.
  const courses: AcademySearchCard[] = getAllAcademyContent()
    .filter((content) => content.kind === "course")
    .flatMap((content) => {
      const { card } = content.identity;
      return card.image ? [{
        category: content.identity.category,
        image: card.image,
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
