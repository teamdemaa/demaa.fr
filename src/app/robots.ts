import type { MetadataRoute } from "next";
import { getCanonicalOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getCanonicalOrigin();
  const siniHost = process.env.SINI_CANONICAL_HOST?.trim().toLowerCase();
  const canonicalHost = new URL(origin).host.toLowerCase();

  // Do not expose inherited DEMAA canonicals while SINI has no final domain.
  if (!siniHost || canonicalHost !== siniHost) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
