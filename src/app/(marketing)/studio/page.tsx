import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Studio | Demaa",
  description: "DEMAA identifie des opportunités et construit des entreprises solides, avec méthode et attention au terrain.",
  path: "/studio",
  keywords: ["studio d’entreprises", "venture studio", "opportunités", "projets", "Demaa"],
});

export default function StudioPage() {
  return <DemaaStudioLanding />;
}
