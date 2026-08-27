import type { Metadata } from "next";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

export const metadata: Metadata = buildPublicPageMetadata({
  title: "Politique de confidentialité - Demaa",
  description: "Politique de confidentialité du site demaa.co.",
  path: "/politique-de-confidentialite",
});

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
