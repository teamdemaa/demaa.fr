import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  acceptLanguage: null as string | null,
  cookieLocale: undefined as string | undefined,
  headerLocale: null as string | null,
  identity: null as { uid: string } | null,
  memberLocale: null as string | null,
  companyContext: {
    companyId: "cmp_member",
    membershipId: "cpm_member",
    countryCode: "FR",
    currencyCode: "EUR",
    marketCode: "fr-fr",
  } as {
    companyId: string;
    membershipId: string;
    countryCode: string | null;
    currencyCode: string;
    marketCode: "fr-fr" | "global-en-beta";
  } | null,
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
vi.mock("@/lib/company-membership.server", () => ({
  getActiveCompanyContextForIdentity: async () => mocks.companyContext,
}));

import {
  resolveAuthenticatedInternationalContext,
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
    mocks.companyContext = {
      companyId: "cmp_member",
      membershipId: "cpm_member",
      countryCode: "FR",
      currencyCode: "EUR",
      marketCode: "fr-fr",
    };
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

  it("uses the authenticated company as the only commercial authority", async () => {
    await expect(resolveAuthenticatedInternationalContext({
      identity: { uid: "member-uid" },
      localeCode: "en",
      // Deliberately injected at runtime: the resolver does not consume
      // browser-provided commercial fields.
      marketCode: "global-en-beta",
      currencyCode: "USD",
    } as Parameters<typeof resolveAuthenticatedInternationalContext>[0]))
      .resolves.toEqual({
        companyContext: mocks.companyContext,
        internationalContext: {
          countryCode: "FR",
          currencyCode: "EUR",
          localeCode: "en",
          marketCode: "fr-fr",
        },
      });
  });

  it("fails closed when no active company context can be resolved", async () => {
    mocks.companyContext = null;

    await expect(resolveAuthenticatedInternationalContext({
      identity: { uid: "member-uid" },
      localeCode: "fr",
    })).rejects.toThrow("active company context is unavailable");
  });
});
