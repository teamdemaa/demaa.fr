import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Demaa",
    short_name: "Demaa",
    description: "Gagnez du temps grâce à des systèmes simples et adaptés à votre entreprise.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#315f46",
    theme_color: "#315f46",
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
