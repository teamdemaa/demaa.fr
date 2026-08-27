import type { LucideIcon } from "lucide-react";

export const SOLUTION_RAIL_CLASS_NAME =
  "mt-4 grid max-w-full snap-x snap-mandatory grid-flow-col items-stretch auto-cols-[82%] gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:auto-cols-[calc((100%_-_2rem)_/_2.5)] lg:auto-cols-[calc((100%_-_3rem)_/_3.5)] [&::-webkit-scrollbar]:hidden";

export const SOLUTION_RAIL_CARD_FRAME_CLASS_NAME =
  "relative h-[15.5rem] min-w-0 snap-start";

export const SOLUTION_RAIL_CARD_INTERACTIVE_CLASS_NAME =
  "group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper p-5 text-left shadow-[0_10px_28px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:shadow-[0_14px_32px_rgba(23,35,29,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

export default function SolutionRailCardContent({
  category,
  description,
  Icon,
  title,
}: {
  category: string;
  description: string;
  Icon: LucideIcon;
  title: string;
}) {
  return (
    <span className="flex h-full min-h-0 flex-col">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-4 block min-h-[2.5em] line-clamp-2 text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.15em] text-dema-muted">
        {category}
      </span>
      <span className="mt-1.5 block min-h-[2.5em] line-clamp-2 text-lg font-semibold leading-tight text-brand-blue">
        {title}
      </span>
      <span className="mt-2 line-clamp-2 text-[13px] leading-5 text-dema-muted">
        {description}
      </span>
    </span>
  );
}
