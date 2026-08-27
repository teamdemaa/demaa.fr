import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import QRCodeGeneratorClient from "./QRCodeGeneratorClient";

const seo = freeToolSeo["generation-de-qr-code"];

export const metadata = buildFreeToolMetadata(seo);

export default function QRCodeGeneratorPage() {
  return (
    <>
      <QRCodeGeneratorClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
