import EnglishStudioLanding from "@/components/EnglishStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
export const metadata = buildPublicPageMetadata({ title: "Our ventures | DEMAA", description: "Explore Jago, Tiimora, Dumaan and the other businesses we’re building at DEMAA.", path: "/en/ventures" });
export default function Page() { return <EnglishStudioLanding view="projets" />; }
