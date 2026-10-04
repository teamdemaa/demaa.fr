import type { Metadata } from "next";
import { DEMAA_LEARNING_VISIBLE } from "@/lib/demaa-public-routes";

export const metadata: Metadata = DEMAA_LEARNING_VISIBLE ? {} : {
  robots: { index: false, follow: true },
};

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
