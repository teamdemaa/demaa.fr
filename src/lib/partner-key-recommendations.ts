import { getDemaaPartnerKeys, type DemaaPartnerKey } from "@/lib/partner-key-catalog";

export function getRecommendedPartnerKeysForSystem(systemSlug: string): DemaaPartnerKey[] {
  void systemSlug;
  return getDemaaPartnerKeys();
}
