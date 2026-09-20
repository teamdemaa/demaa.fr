import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "sini",
    short_name: "sini",
    description: "Reprendre, vendre et préparer la suite d’une entreprise.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfcfe",
    theme_color: "#244a68",
    lang: "fr",
    orientation: "portrait-primary",
  };
}
