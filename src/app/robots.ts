import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: [
      "https://demaa.fr/sitemap.xml",
      "https://demaa.fr/academie/video-sitemap.xml",
    ],
    host: "https://demaa.fr",
  };
}
