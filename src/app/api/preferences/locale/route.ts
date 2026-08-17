import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import {
  LOCALE_PREFERENCE_COOKIE,
  LOCALE_PREFERENCE_MAX_AGE_SECONDS,
  isInterfaceLocaleCode,
} from "@/lib/international-context";
import { saveMemberLocalePreference } from "@/lib/member-locale-preference.server";
import { getCurrentCustomerIdentityFromSession } from "@/lib/customer-space-session.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";

type LocalePreferenceBody = { localeCode?: unknown };

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;
  const limited = await enforceRateLimit(request, {
    keyPrefix: "member-locale-preference",
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data, response: invalidBodyResponse } =
    await readJsonBody<LocalePreferenceBody>(request, 2 * 1024);
  if (invalidBodyResponse) return invalidBodyResponse;
  if (!isInterfaceLocaleCode(data?.localeCode)) {
    return NextResponse.json(
      { error: "Langue non prise en charge." },
      { status: 400 },
    );
  }

  const identity = await getCurrentCustomerIdentityFromSession();
  if (identity) {
    try {
      await saveMemberLocalePreference({
        localeCode: data.localeCode,
        uid: identity.uid,
      });
    } catch (error) {
      console.error(
        "[locale-preference] Member preference persistence failed",
        error instanceof Error ? error.message : "Unknown error",
      );
      return NextResponse.json(
        { error: "La préférence de langue n’a pas pu être enregistrée." },
        { status: 503 },
      );
    }
  }

  const response = NextResponse.json({
    localeCode: data.localeCode,
    persistedForMember: Boolean(identity),
  });
  response.cookies.set(LOCALE_PREFERENCE_COOKIE, data.localeCode, {
    httpOnly: false,
    maxAge: LOCALE_PREFERENCE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production"
      || process.env.VERCEL_ENV === "preview"
      || process.env.VERCEL_ENV === "production",
  });
  return response;
}
