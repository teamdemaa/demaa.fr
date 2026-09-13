import { BookOpen, Copy, Wrench } from "lucide-react";
import Link from "next/link";

export type ResourcesView = "models" | "tools" | "tutorials";

const resourceItems = [
  { view: "tools", label: "Outils", href: "/outils", Icon: Wrench },
  { view: "models", label: "Modèles", href: "/modeles", Icon: Copy },
  { view: "tutorials", label: "Tutoriels", href: "/tutoriels", Icon: BookOpen },
] as const;

export default function ResourcesNavigation({
  activeView,
}: {
  activeView: ResourcesView;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className="mx-auto grid w-full max-w-lg grid-cols-3 gap-1 rounded-full border border-dema-line/70 bg-dema-paper p-1 shadow-[0_3px_12px_rgba(23,35,29,0.035)]"
        aria-label="Ressources"
      >
        {resourceItems.map(({ view, label, href, Icon }) => {
          const isActive = activeView === view;

          return (
            <Link
              key={view}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 sm:text-sm ${
                isActive
                  ? "bg-dema-sage text-dema-forest"
                  : "text-dema-muted hover:text-brand-blue"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${isActive ? "stroke-[2.3]" : "stroke-[1.8]"}`}
                aria-hidden="true"
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
