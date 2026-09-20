"use client";

import { useEffect } from "react";

export function SiniPreviewHtmlLang({ locale }: { locale: "fr" | "en" }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);

  return null;
}
