import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import CustomerReviewQRCodeClient from "./CustomerReviewQRCodeClient";

const seo = freeToolSeo["qr-code-pour-avis-client"];

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

export default function CustomerReviewQRCodePage() {
  return (
    <>
      <CustomerReviewQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
