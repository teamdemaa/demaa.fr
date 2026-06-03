import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import GoogleProfileOptimizerClient from "./GoogleProfileOptimizerClient";

const seo = freeToolSeo["creation-de-fiche-google-optimisee"];

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

export default function GoogleProfileOptimizerPage() {
  return (
    <>
      <GoogleProfileOptimizerClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
