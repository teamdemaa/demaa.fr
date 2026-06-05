import { NextResponse } from "next/server";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
  hashToken,
} from "@/lib/customer-space-auth";
import { consumeCustomerMagicLink } from "@/lib/generations-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const email = token ? await consumeCustomerMagicLink(hashToken(token)) : null;

  if (!email) {
    return NextResponse.redirect(new URL("/mon-espace?error=lien-expire", request.url));
  }

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.redirect(new URL("/mon-espace", request.url));

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
