import EnglishStudioLanding from "@/components/EnglishStudioLanding";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
export const metadata = buildPublicPageMetadata({ title: "Build with us | DEMAA", description: "Know the market and want to build a business? Explore the ideas we could develop together.", path: "/en/studio/build-with-us" });
export default function Page() { return <EnglishStudioLanding view="opportunites" />; }
