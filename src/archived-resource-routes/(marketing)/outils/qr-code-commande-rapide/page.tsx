import ToolSeoSection from "@/components/ToolSeoSection";
import { buildFreeToolMetadata, freeToolSeo } from "@/lib/free-tool-seo";
import FastFoodQRCodeClient from "./FastFoodQRCodeClient";

const seo = freeToolSeo["qr-code-commande-rapide"];

export const metadata = buildFreeToolMetadata(seo);

export default function FastFoodQRCodePage() {
  return (
    <>
      <FastFoodQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
