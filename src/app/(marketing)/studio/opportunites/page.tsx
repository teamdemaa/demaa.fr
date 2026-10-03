import DemaaStudioLanding from "@/components/DemaaStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({ title: "Opportunités | Studio Demaa", description: "Contribuer à un projet, partager une expertise ou créer un partenariat avec le Studio Demaa.", path: "/studio/opportunites" });

export default function StudioOpportunitiesPage() { return <DemaaStudioLanding view="opportunites" />; }
