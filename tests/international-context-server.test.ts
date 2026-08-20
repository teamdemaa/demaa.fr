import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  acceptLanguage: null as string | null,
  cookieLocale: undefined as string | undefined,
  headerLocale: null as string | null,
  identity: null as { uid: string } | null,
  memberLocale: null as string | null,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => mocks.cookieLocale ? { value: mocks.cookieLocale } : undefined,
  }),
  headers: async () => ({
    get: (name: string) => name === "accept-language"
      ? mocks.acceptLanguage
      : name === "x-demaa-locale" ? mocks.headerLocale : null,
  }),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  getCurrentCustomerIdentityFromSession: async () => mocks.identity,
}));
vi.mock("@/lib/member-locale-preference.server", () => ({
  readMemberLocalePreference: async () => mocks.memberLocale,
}));

import {
  resolveRequestInterfaceLocale,
  resolveRequestInternationalContext,
} from "@/lib/international-context.server";
import {
  FRANCE_COMMERCIAL_CONTEXT,
  GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
} from "@/lib/international-context";

describe("server international context resolution", () => {
  beforeEach(() => {
    mocks.acceptLanguage = null;
    mocks.cookieLocale = undefined;
    mocks.headerLocale = null;
    mocks.identity = null;
    mocks.memberLocale = null;
  });

  it("resolves interface locale without deriving the commercial market", async () => {
    await expect(resolveRequestInternationalContext({
      commercialContext: FRANCE_COMMERCIAL_CONTEXT,
      pathname: "/en/plans",
    })).resolves.toEqual({
      countryCode: null,
      currencyCode: "EUR",
      localeCode: "en",
      marketCode: "fr-fr",
    });
    await expect(resolveRequestInternationalContext({
      commercialContext: GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
      pathname: "/",
    })).resolves.toEqual({
      countryCode: null,
      currencyCode: "EUR",
      localeCode: "fr",
      marketCode: "global-en-beta",
    });
  });

  it("preserves the preference order when no route locale is explicit", async () => {
    mocks.identity = { uid: "member-uid" };
    mocks.memberLocale = "en";
    mocks.cookieLocale = "fr";
    mocks.acceptLanguage = "fr-FR";
    await expect(resolveRequestInterfaceLocale()).resolves.toBe("en");
    await expect(resolveRequestInterfaceLocale({ manualPreference: "fr" }))
      .resolves.toBe("fr");
  });
});
