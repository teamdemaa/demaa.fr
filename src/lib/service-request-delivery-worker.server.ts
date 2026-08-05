import "server-only";

import { randomUUID } from "node:crypto";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import {
  deliverServiceRequestChannel,
  deliverSolutionReferralChannel,
  RequestDeliveryProviderError,
} from "@/lib/service-request-notifications.server";
import {
  claimServiceRequestDelivery,
  claimSolutionReferralDelivery,
  completeServiceRequestDelivery,
  completeSolutionReferralDelivery,
  getDueServiceRequests,
  getDueSolutionReferrals,
} from "@/lib/service-request-storage.server";

function errorCode(error: unknown) {
  return error instanceof RequestDeliveryProviderError ? error.code : "delivery_failed";
}

export async function retryDueServiceSolutionDeliveries(limit = 30, now = new Date()) {
  const [services, solutions] = await Promise.all([
    getDueServiceRequests(now, limit),
    getDueSolutionReferrals(now, limit),
  ]);
  const workerId = randomUUID();
  const results: Array<{ channel: string; requestType: string; status: "failed" | "sent" }> = [];

  for (const due of services) {
    const claim = await claimServiceRequestDelivery({ now, requestId: due.id, workerId });
    if (!claim) continue;
    try {
      await deliverServiceRequestChannel({
        channel: claim.channel,
        record: claim.record,
        requestId: claim.requestId,
      });
      await completeServiceRequestDelivery({
        channel: claim.channel,
        now,
        requestId: claim.requestId,
        success: true,
        workerId,
      });
      results.push({ channel: claim.channel, requestType: "service_request", status: "sent" });
    } catch (error) {
      const code = errorCode(error);
      await completeServiceRequestDelivery({
        channel: claim.channel,
        errorCode: code,
        now,
        requestId: claim.requestId,
        success: false,
        workerId,
      });
      logOperationalError("service_request.delivery_failed", new Error(code), {
        channel: claim.channel,
        requestId: claim.requestId,
      });
      results.push({ channel: claim.channel, requestType: "service_request", status: "failed" });
    }
  }

  for (const due of solutions) {
    const claim = await claimSolutionReferralDelivery({ now, requestId: due.id, workerId });
    if (!claim) continue;
    try {
      await deliverSolutionReferralChannel({
        channel: claim.channel,
        record: claim.record,
        requestId: claim.requestId,
      });
      await completeSolutionReferralDelivery({
        channel: claim.channel,
        now,
        requestId: claim.requestId,
        success: true,
        workerId,
      });
      results.push({ channel: claim.channel, requestType: "solution_referral", status: "sent" });
    } catch (error) {
      const code = errorCode(error);
      await completeSolutionReferralDelivery({
        channel: claim.channel,
        errorCode: code,
        now,
        requestId: claim.requestId,
        success: false,
        workerId,
      });
      logOperationalError("solution_referral.delivery_failed", new Error(code), {
        channel: claim.channel,
        requestId: claim.requestId,
      });
      results.push({ channel: claim.channel, requestType: "solution_referral", status: "failed" });
    }
  }

  logOperationalEvent("service_solution_delivery_worker.completed", {
    failed: results.filter((result) => result.status === "failed").length,
    sent: results.filter((result) => result.status === "sent").length,
  });
  return results;
}
