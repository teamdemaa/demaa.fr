import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CustomerSessionExchangeError,
  exchangeFirebaseIdTokenForSession,
} from "@/lib/customer-auth-session.client";

describe("customer session exchange", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("preserves the HTTP status so account provisioning failures are recoverable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: "Votre espace n’a pas pu être préparé.",
    }), {
      headers: { "Content-Type": "application/json" },
      status: 503,
    })));

    const error = await exchangeFirebaseIdTokenForSession({
      idToken: "id-token",
      returnTo: "/plans/latest",
    }).catch((reason) => reason);

    expect(error).toBeInstanceOf(CustomerSessionExchangeError);
    expect(error).toMatchObject({ status: 503 });
  });
});
