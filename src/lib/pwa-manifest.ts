import type { MetadataRoute } from "next";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const PWA_ICONS: NonNullable<MetadataRoute.Manifest["icons"]> = [
  {
    src: "/pwa/demaa-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/pwa/demaa-512.png",
    sizes: "512x512",
    type: "image/png",
  },
  {
    src: "/pwa/demaa-maskable-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

const PWA_DESCRIPTIONS: Record<InterfaceLocaleCode, string> = {
  fr: "Structurez et pilotez votre entreprise avec un plan d’action concret.",
  en: "Clarify your priorities and run your business with a practical action plan.",
};

export function buildDemaaManifest(
  localeCode: InterfaceLocaleCode,
): MetadataRoute.Manifest {
  return {
    name: "Demaa",
    short_name: "Demaa",
    description: PWA_DESCRIPTIONS[localeCode],
    start_url: localeCode === "en" ? "/en" : "/",
    scope: "/",
    display: "standalone",
    background_color: "#315f46",
    theme_color: "#315f46",
    lang: localeCode,
    orientation: "portrait-primary",
    icons: PWA_ICONS,
  };
}
