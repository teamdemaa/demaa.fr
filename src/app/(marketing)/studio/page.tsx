import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Studio | Demaa",
  description: "On crée des entreprises sur des marchés qu’on connaît de l’intérieur. Découvrez la méthode et les projets du Studio Demaa.",
  path: "/studio",
  keywords: ["studio d’entreprises", "venture studio", "opportunités", "projets", "Demaa"],
});

export default function StudioPage() {
  return <DemaaStudioLanding view="studio" />;
}
