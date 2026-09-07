import DemaaStudioLandingPage from "@/components/DemaaStudioLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Demaa Studio | Construisons le logiciel dont votre métier a besoin";
const description =
  "Demaa Studio s’associe à des dirigeants de TPE et PME pour construire avec le terrain des logiciels métier destinés à leur secteur.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/studio",
});

export default function StudioPage() {
  return <DemaaStudioLandingPage />;
}
