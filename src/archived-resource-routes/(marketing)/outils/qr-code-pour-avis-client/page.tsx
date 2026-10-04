import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import CustomerReviewQRCodeClient from "./CustomerReviewQRCodeClient";

const seo = freeToolSeo["qr-code-pour-avis-client"];

export const metadata = buildFreeToolMetadata(seo);

export default function CustomerReviewQRCodePage() {
  return (
    <>
      <CustomerReviewQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
