import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import GoogleProfileOptimizerClient from "./GoogleProfileOptimizerClient";

const seo = freeToolSeo["creation-de-fiche-google-optimisee"];

export const metadata = buildFreeToolMetadata(seo);

export default function GoogleProfileOptimizerPage() {
  return (
    <>
      <GoogleProfileOptimizerClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
