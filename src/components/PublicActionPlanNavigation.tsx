import { BookOpen, Building2, LibraryBig, Workflow } from "lucide-react";
import Link from "next/link";

export type PublicActionPlanView = "marketplace" | "resources" | "services" | "advice";

const navigationItems = [
  { view: "marketplace", label: "Reprendre", href: "/a-reprendre", Icon: Building2 },
  { view: "services", label: "Vendre", href: "/transmettre", Icon: Workflow },
  { view: "resources", label: "Ressources", href: "/tutoriels", Icon: LibraryBig },
] as const;

const siniNavigationItems = [
  { view: "marketplace", label: "Reprendre", href: "/", Icon: Building2 },
  { view: "services", label: "Vendre", href: "/transmettre", Icon: Workflow },
  { view: "advice", label: "Conseil", href: "/conseil", Icon: BookOpen },
] as const;

const tabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-xs font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";
const siniTabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-[10px] font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#597391]/30 sm:text-xs xl:gap-2 xl:px-3 xl:text-sm";
const containerClassName =
  "grid w-full grid-cols-3 gap-1 rounded-full border border-dema-line/70 bg-dema-paper p-1 shadow-[0_3px_12px_rgba(23,35,29,0.035)]";

export default function PublicActionPlanNavigation({
  activeView,
  variant = "legacy",
}: {
  activeView: PublicActionPlanView | "none";
  variant?: "legacy" | "sini";
}) {
  const isSini = variant === "sini";
  const items = isSini ? siniNavigationItems : navigationItems;

  return (
    <div
      className={`${isSini ? "grid w-full grid-cols-3 gap-1 rounded-full border border-[#d8e0e7] bg-sini-background p-1 shadow-[0_3px_12px_rgba(23,40,62,0.04)]" : `${containerClassName} xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none`}`}
      aria-label="Navigation principale"
    >
      {items.map(({ view, label, href, Icon }) => {
        const isActive = activeView === view;

        return (
          <Link
            key={view}
            href={href}
            aria-current={isActive ? "location" : undefined}
            className={`${isSini ? siniTabClassName : tabClassName} ${
              isActive
                ? isSini ? "bg-[#dce8f1]/30 text-[#244a68]" : "bg-dema-sage text-dema-forest xl:bg-transparent xl:font-semibold"
                : isSini ? "text-[#627181] hover:text-[#244a68]" : "text-dema-muted hover:text-brand-blue"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 transition ${isSini ? "hidden sm:block" : ""} ${
                isActive
                  ? "stroke-[2.3]"
                  : "stroke-[1.8] group-hover:stroke-2"
              }`}
              aria-hidden="true"
            />
            <span className="max-w-full truncate">{label}</span>
            {!isSini ? (
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-3 bottom-0 hidden h-0.5 origin-center rounded-full bg-dema-forest transition-[transform,opacity] duration-200 xl:block ${
                  isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                }`}
              />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
