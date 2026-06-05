import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/social-studio", "/api/social-studio"],
      },
    ],
    sitemap: "https://demaa.fr/sitemap.xml",
    host: "https://demaa.fr",
  };
}
