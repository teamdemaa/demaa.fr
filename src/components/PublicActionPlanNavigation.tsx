import { BookOpen, Building2, Handshake, LibraryBig, Workflow } from "lucide-react";
import Link from "next/link";

export type PublicActionPlanView = "marketplace" | "resources" | "services" | "academy" | "solutions" | "specialists";

const navigationItems = [
  { view: "marketplace", label: "Reprendre", href: "/a-reprendre", Icon: Building2 },
  { view: "services", label: "Vendre", href: "/transmettre", Icon: Workflow },
  { view: "resources", label: "Ressources", href: "/tutoriels", Icon: LibraryBig },
] as const;

// The Specialists directory remains available by direct link but is not part
// of the public DEMAA navigation while it is being curated.
const demaaNavigationItems = [
  { view: "services", label: "Accompagnement", href: "/accompagnement", Icon: Handshake },
  { view: "solutions", label: "Solutions", href: "/solutions", Icon: Workflow },
  { view: "academy", label: "Tutoriels", href: "/academie", Icon: BookOpen },
] as const;

const tabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-full px-1 text-xs font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";

export default function PublicActionPlanNavigation({
  activeView,
  variant = "legacy",
}: {
  activeView: PublicActionPlanView | "none";
  variant?: "legacy" | "demaa";
}) {
  const items = variant === "demaa" ? demaaNavigationItems : navigationItems;
  return (
    <div
      className={`grid w-full grid-cols-3 gap-1 rounded-full border border-dema-line/70 bg-dema-paper p-1 shadow-[0_3px_12px_rgba(23,35,29,0.035)] ${variant === "legacy" ? "xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none" : ""}`}
      aria-label="Navigation principale"
    >
      {items.map(({ view, label, href, Icon }) => {
        const isActive = activeView === view;

        return (
          <Link
            key={view}
            href={href}
            aria-current={isActive ? "location" : undefined}
            className={`${tabClassName} ${variant === "demaa" ? "xl:rounded-full" : ""} ${
              isActive
                ? variant === "demaa" ? "bg-dema-sage text-dema-forest font-semibold" : "bg-dema-sage text-dema-forest xl:bg-transparent xl:font-semibold"
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
            {variant === "legacy" ? (
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
