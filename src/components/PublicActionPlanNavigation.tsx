import { Building2, LibraryBig, Workflow } from "lucide-react";
import Link from "next/link";

export type PublicActionPlanView = "marketplace" | "resources" | "services";

const navigationItems = [
  { view: "marketplace", label: "À reprendre", href: "/a-reprendre", Icon: Building2 },
  { view: "services", label: "Accompagnement", href: "/accompagnement", Icon: Workflow },
  { view: "resources", label: "Ressources", href: "/outils", Icon: LibraryBig },
] as const;

const tabClassName =
  "group relative inline-flex min-h-11 min-w-0 items-center justify-center gap-1 px-1 text-xs font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:gap-2 xl:px-3 xl:text-sm";

export default function PublicActionPlanNavigation({
  activeView,
}: {
  activeView: PublicActionPlanView | "none";
}) {
  return (
    <div
      className="grid w-full grid-cols-3 gap-1 border-b border-dema-line/70"
      aria-label="Navigation principale"
    >
      {navigationItems.map(({ view, label, href, Icon }) => {
        const isActive = activeView === view;

        return (
          <Link
            key={view}
            href={href}
            aria-current={isActive ? "location" : undefined}
            className={`${tabClassName} ${
              isActive
                ? "font-semibold text-dema-forest"
                : "text-dema-muted hover:text-brand-blue"
            }`}
          >
            <Icon
              className={`hidden h-4 w-4 shrink-0 transition sm:block ${
                isActive
                  ? "stroke-[2.3]"
                  : "stroke-[1.8] group-hover:stroke-2"
              }`}
              aria-hidden="true"
            />
            <span className="max-w-full truncate">{label}</span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-3 bottom-0 block h-0.5 origin-center rounded-full bg-dema-forest transition-[transform,opacity] duration-200 ${
                isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
