import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Projets | Demaa",
  description: "Les projets et entreprises construits par le studio Demaa.",
  path: "/projets",
});

export default function ProjectsPage() {
  return <DemaaStudioLanding view="projets" />;
}
