import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import SignatureProClient from "./SignatureProClient";

const seo = freeToolSeo["signature-pro"];

export const metadata = buildFreeToolMetadata(seo);

export default function SignatureProPage() {
  return (
    <>
      <SignatureProClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
