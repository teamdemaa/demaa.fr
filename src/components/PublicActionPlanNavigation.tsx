import Link from "next/link";
import { DEMAA_PUBLIC_NAVIGATION } from "@/lib/demaa-public-routes";

export type PublicActionPlanView = "studio" | "projets" | "opportunites" | "marketplace" | "resources" | "services" | "accompagnement" | "academy" | "solutions" | "specialists";

export default function PublicActionPlanNavigation({ activeView }: {
  activeView: PublicActionPlanView | "none";
  variant?: "legacy" | "demaa";
}) {
  const currentView = activeView;
  return (
    <div className="flex w-full items-center justify-center gap-8 sm:gap-10" aria-label="Navigation principale">
      {DEMAA_PUBLIC_NAVIGATION.map(({ view, label, href }) => (
        <Link key={view} href={href} aria-current={currentView === view ? "page" : undefined}
          className={`inline-flex min-h-11 items-center border-b px-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-dema-forest ${currentView === view ? "border-dema-forest text-brand-blue" : "border-transparent text-dema-muted hover:border-dema-line hover:text-dema-forest"}`}>
          {label}
        </Link>
      ))}
    </div>
  );
}
