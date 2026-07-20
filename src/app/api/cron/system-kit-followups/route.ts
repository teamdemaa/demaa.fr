import { NextResponse } from "next/server";
import {
  advanceSystemKitSequenceSubscriber,
  getDueSystemKitSequenceSubscribers,
} from "@/lib/generations-db";
import { sendSystemKitFollowupEmail } from "@/lib/system-kit-email";
import { retryFailedLeadDeliveries } from "@/lib/lead-notifications";
import { cleanupExpiredOperationalData } from "@/lib/operational-maintenance";
import {
  logOperationalError,
  logOperationalEvent,
} from "@/lib/operational-log";

export const runtime = "nodejs";

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization") || "";
  return authorization === `Bearer ${secret}`;
}

async function handleGet(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notificationRetries = await retryFailedLeadDeliveries(30);
  const cleanup = await cleanupExpiredOperationalData(50);
  const dueSubscribers = await getDueSystemKitSequenceSubscribers(50);
  const results: Array<{ email: string; kind: string; sent: boolean }> = [];

  for (const subscriber of dueSubscribers) {
    if (subscriber.sequenceStep > 2) {
      await advanceSystemKitSequenceSubscriber({
        collection: subscriber.collection,
        subscriberId: subscriber.id,
        nextStep: subscriber.sequenceStep,
        completed: true,
      });
      continue;
    }

    const kind = subscriber.sequenceStep === 1 ? "usage" : "diagnostic";
    const emailResult = await sendSystemKitFollowupEmail({
      email: subscriber.email,
      firstName: subscriber.firstName,
      systemName: subscriber.systemName,
      systemSlug: subscriber.systemSlug,
      kind,
    });

    results.push({
      email: subscriber.email,
      kind,
      sent: emailResult.sent,
    });

    if (!emailResult.sent) {
      console.error("[system-kit-sequence] followup send failed", {
        email: subscriber.email,
        kind,
        reason: emailResult.reason,
      });
      continue;
    }

    await advanceSystemKitSequenceSubscriber({
      collection: subscriber.collection,
      subscriberId: subscriber.id,
      nextStep: subscriber.sequenceStep + 1,
      completed: subscriber.sequenceStep >= 2,
    });
  }

  const summary = {
    ok: true,
    processed: dueSubscribers.length,
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => !result.sent).length,
    notificationRetries: {
      attempted: notificationRetries.length,
      sent: notificationRetries.filter((result) => result.status === "sent").length,
      failed: notificationRetries.filter((result) => result.status === "failed").length,
    },
    cleanup,
    results,
  };

  logOperationalEvent("cron.system_kit.completed", {
    cleanupDeleted: cleanup.deleted,
    followupsFailed: summary.failed,
    followupsSent: summary.sent,
    retriesAttempted: notificationRetries.length,
  });

  return NextResponse.json(summary);
}

export async function GET(request: Request) {
  try {
    return await handleGet(request);
  } catch (error) {
    logOperationalError("cron.system_kit.failed", error);
    return NextResponse.json(
      { error: "Cron execution failed." },
      { status: 500 },
    );
  }
}
