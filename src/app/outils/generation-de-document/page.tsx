import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import DocGeneratorClient from "./DocGeneratorClient";

const seo = freeToolSeo["generation-de-document"];

export const metadata: Metadata = {
  title: seo.metaTitle,
  description: seo.metaDescription,
  robots: {
    index: false,
    follow: false,
  },
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

export default function DocGeneratorPage() {
  notFound();

  return (
    <>
      <DocGeneratorClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
