import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import SignDocumentClient from "./SignDocumentClient";

const seo = freeToolSeo["signez-un-document-electroniquement"];

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

export default function SignDocumentPage() {
  return (
    <>
      <SignDocumentClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
