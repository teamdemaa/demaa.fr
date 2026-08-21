import type { CanonicalServiceSlug } from "@/lib/canonical-service-catalog";

const ACCOUNTING_FIRM_SYSTEM_SLUGS = new Set([
  "cabinet-comptable",
  "expert-comptable",
]);

const FORMALITIES_PROFESSIONAL_SYSTEM_SLUGS = new Set([
  "cabinet-comptable",
  "expert-comptable",
  "cabinet-davocat",
  "notaire",
]);

const ADMIN_SUPPORT_PROFESSIONAL_SYSTEM_SLUGS = new Set([
  "assistant-administratif-externalise",
  "office-manager-externalise",
  "secretariat-externalise",
]);

export function isCanonicalServiceEligibleForSystem(
  serviceSlug: CanonicalServiceSlug | string,
  systemSlug: string,
) {
  if (serviceSlug === "expert-comptable") {
    return !ACCOUNTING_FIRM_SYSTEM_SLUGS.has(systemSlug);
  }
  if (serviceSlug === "formalites-entreprise") {
    return !FORMALITIES_PROFESSIONAL_SYSTEM_SLUGS.has(systemSlug);
  }
  if (serviceSlug === "assistance-administrative") {
    return !ADMIN_SUPPORT_PROFESSIONAL_SYSTEM_SLUGS.has(systemSlug);
  }
  return true;
}
