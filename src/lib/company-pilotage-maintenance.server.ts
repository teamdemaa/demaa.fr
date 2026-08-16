import "server-only";

import { deleteCompanyMetrics } from "@/lib/company-metrics.server";
import { deleteCompanyStrategy } from "@/lib/company-strategy.server";

/** Must be called by the effective company-deletion workflow, never for a member departure. */
export async function deleteCompanyPilotageData(companyId: string) {
  const [metricsDeleted] = await Promise.all([
    deleteCompanyMetrics(companyId),
    deleteCompanyStrategy(companyId),
  ]);
  return { metricsDeleted, strategyDeleted: true };
}
