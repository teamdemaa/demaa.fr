import { NextResponse } from "next/server";
import { retryDueServiceSolutionDeliveries } from "@/lib/service-request-delivery-worker.server";

export const runtime = "nodejs";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deliveries = await retryDueServiceSolutionDeliveries(30);
  return NextResponse.json({
    attempted: deliveries.length,
    failed: deliveries.filter((delivery) => delivery.status === "failed").length,
    ok: true,
    sent: deliveries.filter((delivery) => delivery.status === "sent").length,
  });
}
