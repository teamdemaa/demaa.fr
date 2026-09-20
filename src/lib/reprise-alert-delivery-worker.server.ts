import "server-only";

import { getRepriseAlertMatches } from "@/lib/reprise-alerts";
import {
  sendInternalRepriseAlertCreated,
  sendRepriseAlertConfirmation,
  sendRepriseOpportunityMatch,
} from "@/lib/reprise-alert-emails.server";
import {
  claimRepriseAlertCreationDelivery,
  claimRepriseAlertDelivery,
  completeRepriseAlertDelivery,
  getRepriseAlertAccessToken,
  listActiveRepriseAlerts,
  type RepriseAlertRecord,
} from "@/lib/reprise-alert-storage.server";
import { repriseOpportunities } from "@/lib/reprise-opportunities";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { getCanonicalOrigin } from "@/lib/site-url";
import type { FormBrand } from "@/lib/form-brand.server";

type AlertNotificationInput = {
  accessToken: string;
  alertId: string;
  baseUrl: string;
  brand: FormBrand;
  criteria: RepriseAlertRecord["criteria"];
  currentMatches?: readonly (typeof repriseOpportunities)[number][];
  email: string;
};

export async function deliverRepriseAlertCreationNotifications(input: AlertNotificationInput) {
  const deliveries = [
    {
      channel: "subscriber_confirmation" as const,
      send: () => sendRepriseAlertConfirmation({
        accessToken: input.accessToken,
        alertId: input.alertId,
        baseUrl: input.baseUrl,
        brand: input.brand,
        criteria: input.criteria,
        currentMatches: input.currentMatches,
        email: input.email,
      }),
    },
    {
      channel: "internal_notification" as const,
      send: () => sendInternalRepriseAlertCreated({
        alertId: input.alertId,
        brand: input.brand,
        criteria: input.criteria,
        email: input.email,
      }),
    },
  ];
  const results: Array<{ alertId: string; channel: string; status: "failed" | "sent" }> = [];

  for (const delivery of deliveries) {
    const claim = await claimRepriseAlertCreationDelivery(input.alertId, delivery.channel);
    if (!claim) continue;
    try {
      await delivery.send();
      await completeRepriseAlertDelivery({ deliveryId: claim.deliveryId, success: true });
      results.push({ alertId: input.alertId, channel: delivery.channel, status: "sent" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "email_failed";
      await completeRepriseAlertDelivery({ deliveryId: claim.deliveryId, error: message, success: false });
      logOperationalError("reprise_alert.creation_email_failed", error, {
        alertId: input.alertId,
        channel: delivery.channel,
      });
      results.push({ alertId: input.alertId, channel: delivery.channel, status: "failed" });
    }
  }

  return results;
}

export async function deliverNewRepriseAlertMatches(limit = 500) {
  const alerts = await listActiveRepriseAlerts(limit);
  const results: Array<{
    alertId: string;
    channel?: string;
    opportunityId?: string;
    status: "failed" | "sent";
  }> = [];
  for (const alert of alerts) {
    const baseUrl = alert.brand === "sini" ? "https://gosini.fr" : getCanonicalOrigin();
    results.push(...await deliverRepriseAlertCreationNotifications({
      accessToken: getRepriseAlertAccessToken(alert.id),
      alertId: alert.id,
      baseUrl,
      brand: alert.brand,
      criteria: alert.criteria,
      currentMatches: getRepriseAlertMatches(repriseOpportunities, alert.criteria),
      email: alert.email,
    }));
    const createdAt = Date.parse(alert.createdAt);
    const matches = getRepriseAlertMatches(repriseOpportunities, alert.criteria)
      .filter((opportunity) => Date.parse(opportunity.publishedAt) > createdAt);

    for (const opportunity of matches) {
      const claim = await claimRepriseAlertDelivery(alert.id, opportunity.id);
      if (!claim) continue;
      try {
        await sendRepriseOpportunityMatch({
          accessToken: getRepriseAlertAccessToken(alert.id),
          alertId: alert.id,
          baseUrl,
          brand: alert.brand,
          email: alert.email,
          opportunity,
        });
        await completeRepriseAlertDelivery({ deliveryId: claim.deliveryId, success: true });
        results.push({ alertId: alert.id, opportunityId: opportunity.id, status: "sent" });
      } catch (error) {
        const message = error instanceof Error ? error.message : "email_failed";
        await completeRepriseAlertDelivery({ deliveryId: claim.deliveryId, error: message, success: false });
        logOperationalError("reprise_alert.delivery_failed", error, {
          alertId: alert.id,
          opportunityId: opportunity.id,
        });
        results.push({ alertId: alert.id, opportunityId: opportunity.id, status: "failed" });
      }
    }
  }

  logOperationalEvent("reprise_alert.worker_completed", {
    alerts: alerts.length,
    failed: results.filter((result) => result.status === "failed").length,
    sent: results.filter((result) => result.status === "sent").length,
  });
  return results;
}
