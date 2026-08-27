import DemaaStudioLandingPage from "@/components/DemaaStudioLandingPage";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Demaa Studio | Logiciels métier conçus sur le terrain";
const description =
  "Découvrez les logiciels spécialisés conçus par Demaa à partir de problèmes métier observés auprès de dirigeants et de leurs équipes.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/studio",
});

export default function StudioPage() {
  return <DemaaStudioLandingPage />;
}
