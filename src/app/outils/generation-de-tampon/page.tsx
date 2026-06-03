import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import StampGeneratorClient from "./StampGeneratorClient";

const seo = freeToolSeo["generation-de-tampon"];

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

export default function StampGeneratorPage() {
  return (
    <>
      <StampGeneratorClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
