import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import MenuQRCodeClient from "./MenuQRCodeClient";

const seo = freeToolSeo["generation-de-menu-qr-code"];

export const metadata: Metadata = {
  title: seo.metaTitle,
  description: seo.metaDescription,
  alternates: {
    canonical: seo.path,
  },
  openGraph: {
    title: seo.metaTitle,
    description: seo.metaDescription,
    url: seo.path,
    type: "website",
  },
};

export default function MenuQRCodePage() {
  return (
    <>
      <MenuQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
