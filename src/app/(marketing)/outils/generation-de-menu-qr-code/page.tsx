import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import MenuQRCodeClient from "./MenuQRCodeClient";

const seo = freeToolSeo["generation-de-menu-qr-code"];

export const metadata = buildFreeToolMetadata(seo);

export default function MenuQRCodePage() {
  return (
    <>
      <MenuQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
