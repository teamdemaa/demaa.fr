import type { Metadata } from "next";
import ToolSeoSection from "@/components/ToolSeoSection";
import { freeToolSeo } from "@/lib/free-tool-seo";
import FastFoodQRCodeClient from "./FastFoodQRCodeClient";

const seo = freeToolSeo["qr-code-commande-rapide"];

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

export default function FastFoodQRCodePage() {
  return (
    <>
      <FastFoodQRCodeClient />
      <ToolSeoSection tool={seo} />
    </>
  );
}
