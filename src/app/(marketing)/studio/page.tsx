import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Studio | DEMAA",
  description: "On crée des entreprises sur des marchés qu’on connaît de l’intérieur. Découvrez la méthode et les projets du Studio DEMAA.",
  path: "/studio",
  keywords: ["studio d’entreprises", "venture studio", "opportunités", "projets", "DEMAA"],
});

export default function StudioPage() {
  return <DemaaStudioLanding view="studio" />;
}
