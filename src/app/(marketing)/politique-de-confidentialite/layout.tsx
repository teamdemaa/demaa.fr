import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Politique de confidentialité - sini",
  description: "Comment sini traite les données de contact et de reprise.",
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
