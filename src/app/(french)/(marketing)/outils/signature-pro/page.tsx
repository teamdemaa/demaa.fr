import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import SignatureProClient from "./SignatureProClient";

const seo = freeToolSeo["signature-pro"];

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

export default function SignatureProPage() {
  return (
    <>
      <SignatureProClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
