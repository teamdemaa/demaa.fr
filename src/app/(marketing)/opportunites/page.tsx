import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Opportunités | Demaa",
  description: "Les opportunités que le studio Demaa choisit d’explorer, de construire ou d’accompagner.",
  path: "/opportunites",
});

export default function OpportunitiesPage() {
  return <DemaaStudioLanding view="opportunites" />;
}
