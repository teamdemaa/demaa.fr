import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import SignDocumentClient from "./SignDocumentClient";

const seo = freeToolSeo["signez-un-document-electroniquement"];

export const metadata = buildFreeToolMetadata(seo);

export default function SignDocumentPage() {
  return (
    <>
      <SignDocumentClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
