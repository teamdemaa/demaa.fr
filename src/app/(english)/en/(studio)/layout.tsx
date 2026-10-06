import type { Metadata } from "next";
import EnglishStudioFooter from "@/components/EnglishStudioFooter";
export const metadata: Metadata = { robots: { index: true, follow: true } };
export default function EnglishStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<EnglishStudioFooter /></>;
}
