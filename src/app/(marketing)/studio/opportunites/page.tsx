import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({ title: "Construire avec nous | Studio Demaa", description: "Découvrez les pistes du Studio et échangeons sur le projet que vous souhaitez porter.", path: "/studio/opportunites" });

export default function StudioOpportunitiesPage() { return <DemaaStudioLanding view="opportunites" />; }
