import { Copy, LayoutGrid, Workflow } from "lucide-react";
import Link from "next/link";

export type PublicActionPlanView = "solutions" | "academy" | "services";

const navigationItems = [
  { view: "solutions", label: "Solutions", href: "/solutions", Icon: LayoutGrid },
  { view: "academy", label: "Modèles", href: "/modeles", Icon: Copy },
  { view: "services", label: "Automatisation", href: "/automatisation", Icon: Workflow },
] as const;

const tabClassName =
  "group relative inline-flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-medium leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 xl:min-h-11 xl:flex-row xl:gap-2 xl:rounded-none xl:px-3 xl:text-sm";

export default function PublicActionPlanNavigation({
  activeView,
}: {
  activeView: PublicActionPlanView | "none";
}) {
  return (
    <div
      className="grid w-full grid-cols-3 gap-1"
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
