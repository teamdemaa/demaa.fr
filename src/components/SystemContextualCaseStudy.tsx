import Link from "next/link";
import type { ContextualAcademyCaseStudy } from "@/lib/academy-case-study-placement";

export default function SystemContextualCaseStudy({
  content,
}: {
  content: ContextualAcademyCaseStudy;
}) {
  return (
    <section aria-labelledby="system-case-study-title">
      <h3
        id="system-case-study-title"
        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-dema-muted"
      >
        Cas concret
      </h3>
      <Link
        href={`/academie/${content.contentSlug}`}
        className="group mt-4 block rounded-[1.2rem] border border-dema-line bg-dema-forest p-6 text-white shadow-[0_10px_28px_rgba(23,35,29,0.06)] transition hover:-translate-y-px hover:shadow-[0_14px_32px_rgba(23,35,29,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 sm:p-7"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65">
          Étude de cas · {content.durationMinutes} min
        </span>
        <span className="mt-2 block text-xl font-semibold leading-snug sm:text-2xl">
          {content.title}
        </span>
        <span className="mt-3 block max-w-2xl text-sm leading-relaxed text-white/75">
          {content.promise}
        </span>
        <span className="mt-5 inline-flex text-sm font-semibold underline decoration-white/35 underline-offset-4">
          Découvrir le cas concret
        </span>
      </Link>
    </section>
  );
}
