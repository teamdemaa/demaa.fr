import type { MetadataRoute } from "next";
import { buildDemaaManifest } from "@/lib/pwa-manifest";

export default function manifest(): MetadataRoute.Manifest {
  return buildDemaaManifest("fr");
}
