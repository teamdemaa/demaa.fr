import { NextResponse } from "next/server";
import {
  advanceSystemKitSequenceSubscriber,
  getDueSystemKitSequenceSubscribers,
} from "@/lib/generations-db";
import { retryFailedLeadDeliveries } from "@/lib/lead-notifications";
import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";
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

  const notificationRetries = await retryFailedLeadDeliveries(
    30,
    sendOperationalSystemDeliveryEmail,
  );
  const cleanup = await cleanupExpiredOperationalData(50);
  const dueSubscribers = await getDueSystemKitSequenceSubscribers(50);
  let retiredSequences = 0;

  for (const subscriber of dueSubscribers) {
    await advanceSystemKitSequenceSubscriber({
      collection: subscriber.collection,
      subscriberId: subscriber.id,
      nextStep: subscriber.sequenceStep,
      completed: true,
    });
    retiredSequences += 1;
  }

  const summary = {
    ok: true,
    processed: dueSubscribers.length,
    retiredSequences,
    notificationRetries: {
      attempted: notificationRetries.length,
      sent: notificationRetries.filter((result) => result.status === "sent").length,
      failed: notificationRetries.filter((result) => result.status === "failed").length,
    },
    cleanup,
  };

  logOperationalEvent("cron.system_kit.completed", {
    cleanupDeleted: cleanup.deleted,
    followupsRetired: retiredSequences,
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
