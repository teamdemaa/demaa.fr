import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import QRCodeGeneratorClient from "./QRCodeGeneratorClient";

const seo = freeToolSeo["generation-de-qr-code"];

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

export default function QRCodeGeneratorPage() {
  return (
    <>
      <QRCodeGeneratorClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
