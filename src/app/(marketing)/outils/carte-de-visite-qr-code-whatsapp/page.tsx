import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import WhatsAppQRCodeCardClient from "./WhatsAppQRCodeCardClient";

const seo = freeToolSeo["carte-de-visite-qr-code-whatsapp"];

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

export default function WhatsAppQRCodeCardPage() {
  return (
    <>
      <WhatsAppQRCodeCardClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
