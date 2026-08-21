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

export function getLocaleSwitchCopy(localeCode: InterfaceLocaleCode) {
  return localeCode === "en"
    ? { ariaLabel: "Afficher Demaa en français", label: "FR" }
    : { ariaLabel: "View Demaa in English", label: "EN" };
}

export default function LocaleSwitcher({
  localeCode,
}: {
  localeCode: InterfaceLocaleCode;
}) {
  const [pending, setPending] = useState(false);
  const targetLocaleCode = localeCode === "en" ? "fr" : "en";
  const switchCopy = getLocaleSwitchCopy(localeCode);

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
      aria-label={switchCopy.ariaLabel}
      disabled={pending}
      onClick={switchLocale}
      className="inline-flex size-10 items-center justify-center rounded-full text-[11px] font-medium tracking-[0.08em] text-dema-muted transition hover:bg-dema-sage/35 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/45 disabled:cursor-wait disabled:opacity-60 sm:size-11"
    >
      {pending ? "…" : switchCopy.label}
    </button>
  );
}
