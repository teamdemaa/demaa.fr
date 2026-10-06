"use client";
import { usePathname } from "next/navigation";
import { studioLanguagePaths } from "@/lib/studio-language-routes";
export default function StudioLanguageSwitch() {
  const path = usePathname();
  const routes = studioLanguagePaths(path);
  if (!routes) return null;
  const english = path.startsWith("/en/");
  return <a href={english ? routes.fr : routes.en} hrefLang={english ? "fr" : "en"} lang={english ? "fr" : "en"} aria-label={english ? "Lire cette page en français" : "Read this page in English"} className="inline-flex min-h-11 items-center px-2 text-xs text-dema-muted underline underline-offset-4 hover:text-dema-forest">{english ? "FR" : "EN"}</a>;
}
