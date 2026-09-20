"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SiniFooter from "@/components/SiniFooter";

const siniPaths = [
  "/a-reprendre",
  "/transmettre",
  "/conseil",
  "/accompagnement",
  "/alertes-reprise",
  "/mentions-legales",
  "/politique-de-confidentialite",
];

export default function MarketingFooter({ legacyFooter }: { legacyFooter: ReactNode }) {
  const pathname = usePathname();
  const isSiniPage = siniPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return isSiniPage ? <SiniFooter /> : legacyFooter;
}
