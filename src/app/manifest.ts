import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DEMAA",
    short_name: "DEMAA",
    description: "Un studio d’entreprises, des projets et des ressources pour construire avec méthode.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F1EA",
    theme_color: "#F5F1EA",
    lang: "fr",
    orientation: "portrait-primary",
    icons: [
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
    ],
  };
}
