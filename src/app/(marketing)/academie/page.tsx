import OrganiserHub from "@/components/OrganiserHub";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata = buildPublicPageMetadata({
  title: "Academy | Demaa",
  description: "Des méthodes et cas concrets pour mieux organiser et piloter son entreprise.",
  path: "/academie",
});

export default function AcademyPage() {
  return <OrganiserHub />;
}
