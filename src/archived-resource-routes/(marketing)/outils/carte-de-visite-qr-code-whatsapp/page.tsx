import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import WhatsAppQRCodeCardClient from "./WhatsAppQRCodeCardClient";

const seo = freeToolSeo["carte-de-visite-qr-code-whatsapp"];

export const metadata = buildFreeToolMetadata(seo);

export default function WhatsAppQRCodeCardPage() {
  return (
    <>
      <WhatsAppQRCodeCardClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
