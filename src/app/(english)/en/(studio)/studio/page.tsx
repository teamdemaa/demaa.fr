import EnglishStudioLanding from "@/components/EnglishStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
export const metadata = buildPublicPageMetadata({ title: "Studio | DEMAA", description: "We build businesses in markets we know first-hand. Discover the approach and ventures behind DEMAA.", path: "/en/studio" });
export default function Page() { return <EnglishStudioLanding view="studio" />; }
