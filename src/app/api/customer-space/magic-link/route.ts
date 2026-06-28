import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  getMagicLinkErrorMessage,
  sendCustomerMagicLinkEmail,
} from "@/lib/customer-space-email";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

type MagicLinkRequestBody = {
  email?: unknown;
};

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const { data: body, response } =
    await readJsonBody<MagicLinkRequestBody>(request, 4 * 1024);
  if (response) return response;

  const email = normalizeEmail(normalizeText(body?.email, 160));

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Merci d'indiquer une adresse email valide." },
      { status: 400 }
    );
  }

  const limited = enforceRateLimit(
    request,
    {
      keyPrefix: "customer-magic-link",
      limit: 3,
      windowMs: 15 * 60 * 1000,
    },
    email
  );
  if (limited) return limited;

  const emailResult = await sendCustomerMagicLinkEmail({ email, request });

  if (!emailResult.sent) {
    return NextResponse.json(
      {
        error: getMagicLinkErrorMessage(emailResult.reason),
        sent: false,
        devLink: process.env.NODE_ENV === "production" ? null : emailResult.magicLink,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    sent: emailResult.sent,
    devLink: process.env.NODE_ENV === "production" ? null : emailResult.magicLink,
  });
}
