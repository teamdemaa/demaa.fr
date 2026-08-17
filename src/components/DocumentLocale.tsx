"use client";

import { useLayoutEffect } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export default function DocumentLocale({
  localeCode,
}: {
  localeCode: InterfaceLocaleCode;
}) {
  useLayoutEffect(() => {
    const previousLocale = document.documentElement.lang;
    document.documentElement.lang = localeCode;
    return () => {
      document.documentElement.lang = previousLocale || "fr";
    };
  }, [localeCode]);

  return null;
}
