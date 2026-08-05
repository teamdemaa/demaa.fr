"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function ConditionalFooter({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (
    pathname === "/systeme-marketing" ||
    pathname === "/marketing-ethique"
  ) {
    return null;
  }

  return children;
}
