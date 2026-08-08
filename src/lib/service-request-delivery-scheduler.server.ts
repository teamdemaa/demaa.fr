import "server-only";

import { after } from "next/server";
import { retryDueServiceSolutionDeliveries } from "@/lib/service-request-delivery-worker.server";
import { logOperationalError } from "@/lib/operational-log";

export function scheduleServiceSolutionDeliveries() {
  after(async () => {
    try {
      await retryDueServiceSolutionDeliveries(30);
    } catch {
      logOperationalError(
        "service_solution_delivery_worker.schedule_failed",
        new Error("service_solution_delivery_worker_schedule_failed"),
      );
    }
  });
}
