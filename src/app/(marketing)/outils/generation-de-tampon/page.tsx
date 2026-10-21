import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import StampGeneratorClient from "./StampGeneratorClient";

const seo = freeToolSeo["generation-de-tampon"];

export const metadata = buildFreeToolMetadata(seo);

export default function StampGeneratorPage() {
  return (
    <>
      <StampGeneratorClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
