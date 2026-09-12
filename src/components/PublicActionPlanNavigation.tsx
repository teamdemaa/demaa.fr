import { BookOpen, UsersRound, Workflow, Wrench } from "lucide-react";
import Link from "next/link";
import { PUBLIC_SPECIALISTS_ENABLED } from "@/lib/public-feature-flags";

export type PublicActionPlanView = "solutions" | "academy" | "services";

const navigationItems = [
  PUBLIC_SPECIALISTS_ENABLED
    ? { view: "services", label: "Spécialistes", href: "/specialistes", Icon: UsersRound }
    : { view: "services", label: "Sur mesure", href: "/sur-mesure", Icon: Workflow },
  { view: "solutions", label: "Outils", href: "/outils", Icon: Wrench },
  { view: "academy", label: "Tutoriels", href: "/tutoriels", Icon: BookOpen },
] as const;

const tabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-xs font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";

export default function PublicActionPlanNavigation({
  activeView,
}: {
  activeView: PublicActionPlanView | "none";
}) {
  return (
    <div
      className="grid w-full grid-cols-3 gap-1 rounded-full border border-dema-line/70 bg-dema-paper p-1 shadow-[0_3px_12px_rgba(23,35,29,0.035)] xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
      aria-label="Navigation principale"
    >
      {navigationItems.map(({ view, label, href, Icon }) => {
        const isActive = activeView === view;

        return (
          <Link
            key={view}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`${tabClassName} ${
              isActive
                ? "bg-dema-sage text-dema-forest xl:bg-transparent xl:font-semibold"
                : "text-dema-muted hover:text-brand-blue"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition ${
                isActive
                  ? "stroke-[2.3]"
                  : "stroke-[1.8] group-hover:stroke-2"
              }`}
              aria-hidden="true"
            />
            <span className="max-w-full truncate">{label}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-3 bottom-0 hidden h-0.5 origin-center rounded-full bg-dema-forest transition-[transform,opacity] duration-200 xl:block ${
                isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
