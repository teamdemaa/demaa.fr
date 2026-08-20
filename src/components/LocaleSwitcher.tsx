"use client";

import { useState } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export function getLocaleSwitchHref(
  pathname: string,
  search: string,
  targetLocaleCode: InterfaceLocaleCode,
) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : "/";
  const pathWithoutEnglishPrefix = normalizedPathname === "/en"
    ? "/"
    : normalizedPathname.startsWith("/en/")
      ? normalizedPathname.slice(3)
      : normalizedPathname;
  const localizedPathname = targetLocaleCode === "en"
    ? pathWithoutEnglishPrefix === "/"
      ? "/en"
      : `/en${pathWithoutEnglishPrefix}`
    : pathWithoutEnglishPrefix;
  return `${localizedPathname}${search ? `?${search}` : ""}`;
}

export default function LocaleSwitcher({
  localeCode,
}: {
  localeCode: InterfaceLocaleCode;
}) {
  const [pending, setPending] = useState(false);
  const targetLocaleCode = localeCode === "en" ? "fr" : "en";
  const label = targetLocaleCode === "en" ? "English" : "Français";

  async function switchLocale() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/preferences/locale", {
        body: JSON.stringify({ localeCode: targetLocaleCode }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error("locale_preference_failed");
      window.location.assign(getLocaleSwitchHref(
        window.location.pathname,
        window.location.search.slice(1),
        targetLocaleCode,
      ));
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={localeCode === "en" ? "Afficher Demaa en français" : "View Demaa in English"}
      disabled={pending}
      onClick={switchLocale}
      className="inline-flex min-h-10 items-center px-1 text-xs font-medium text-dema-forest transition hover:text-brand-blue disabled:cursor-wait disabled:opacity-60 sm:min-h-11 sm:text-sm"
    >
      {pending ? "…" : label}
    </button>
  );
}
