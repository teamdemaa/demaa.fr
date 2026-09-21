import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getAllAcademyContent } from "@/lib/academy-course-content";

export default function OrganiserHub() {
  // The Academy landing page is deliberately a concise editorial selection.
  // These six courses are the ones with the original DEMAA illustration set.
  const courses = getAllAcademyContent()
    .filter((content) => content.kind === "course")
    .slice(0, 6);

  return (
    <>
      <Navbar minimal publicNavigationActiveView="academy" />
      <main className="min-h-screen bg-background">
        <section
          id="cours"
          aria-label="Cours Academy"
          className="mx-auto w-full max-w-[128rem] px-5 pb-16 pt-14 sm:px-8 sm:pt-16 lg:px-12"
        >
          <div className="grid grid-cols-1 gap-x-10 gap-y-11 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => {
              const { card } = course.identity;
              return (
                <Link
                  key={course.identity.slug}
                  href={`/organiser/${course.identity.slug}`}
                  className="group block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-4"
                  aria-label={`Ouvrir le cours ${card.title}`}
                >
                  <article className="transition-transform duration-200 ease-out group-hover:-translate-y-px motion-reduce:transform-none">
                    <div className="relative aspect-video overflow-hidden rounded-[1.65rem] border border-dema-line/75 bg-[#F1F4F1]">
                      <Image
                        src={card.image!}
                        alt={card.imageAlt}
                        fill
                        priority={index < 3}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.01]"
                      />
                    </div>
                    <div className="px-0.5 pb-1 pt-5">
                      <p className="text-[0.72rem] font-medium uppercase tracking-[0.15em] text-dema-forest/65 sm:text-[0.78rem]">
                        Méthode · {course.identity.category}
                      </p>
                      <h3 className="mt-3 text-balance text-[1.55rem] font-light leading-[1.14] tracking-[-0.04em] text-brand-blue transition-colors group-hover:text-dema-forest sm:text-[1.8rem] lg:text-[2rem]">
                        {course.identity.title}
                      </h3>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </>
  );
}
