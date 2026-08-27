import { BookOpen, Copy } from "lucide-react";
import Link from "next/link";

export type OrganiserSection = "models" | "processes";

const sections = [
  {
    id: "models",
    href: "/modeles",
    label: "Modèles à copier",
    Icon: Copy,
  },
  {
    id: "processes",
    href: "/organiser",
    label: "Processus & cas concrets",
    Icon: BookOpen,
  },
] as const;

export default function OrganiserSectionNavigation({ activeSection }: { activeSection: OrganiserSection }) {
  return (
    <div className="bg-background px-4 py-4 sm:px-6">
      <nav
        aria-label="Rubriques Organiser"
        className="demaa-search-shell mx-auto grid w-full max-w-xl grid-cols-2 gap-1 p-1.5"
      >
        {sections.map(({ id, href, label, Icon }) => {
          const isActive = activeSection === id;

          return (
            <Link
              key={id}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-full px-3 text-center text-xs font-medium transition sm:text-sm ${
                isActive
                  ? "bg-dema-sage text-dema-forest shadow-[0_2px_8px_rgba(23,35,29,0.04)]"
                  : "text-dema-muted hover:bg-dema-sage/35 hover:text-brand-blue"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
