import { NextResponse } from "next/server";
import { getCurrentCustomerEmailFromSession } from "@/lib/customer-space-session.server";

export const runtime = "nodejs";

export async function GET() {
  const email = await getCurrentCustomerEmailFromSession();
  const response = NextResponse.json({
    authenticated: Boolean(email),
    email,
  });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Cookie");
  return response;
}
