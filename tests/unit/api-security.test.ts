import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import {
  escapeSlackMrkdwn,
  isValidStripeSessionId,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";

describe("api-security", () => {
  it("normalizes single-line text and collapses whitespace", () => {
    expect(normalizeText("  Bonjour   le   monde  ", 50)).toBe("Bonjour le monde");
  });

  it("preserves line breaks in multiline mode", () => {
    expect(normalizeText("  Ligne 1\r\nLigne 2  ", 50, { multiline: true })).toBe("Ligne 1\nLigne 2");
  });

  it("validates Stripe checkout session identifiers", () => {
    expect(isValidStripeSessionId("cs_test_123abc_DEF")).toBe(true);
    expect(isValidStripeSessionId("cs_live_123abc_DEF")).toBe(true);
    expect(isValidStripeSessionId("pi_123")).toBe(false);
  });

  it("escapes Slack markdown control characters", () => {
    expect(escapeSlackMrkdwn("A & B < C > D")).toBe("A &amp; B &lt; C &gt; D");
  });

  it("rejects oversized request bodies", async () => {
    const request = new Request("https://demaa.fr/api/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "9999",
      },
      body: JSON.stringify({ foo: "bar" }),
    });

    const result = await readJsonBody<{ foo: string }>(request, 10);

    expect(result.data).toBeNull();
    expect(result.response).toBeInstanceOf(NextResponse);
    expect(result.response?.status).toBe(413);
  });

  it("rejects invalid JSON payloads", async () => {
    const request = new Request("https://demaa.fr/api/test", {
      method: "POST",
      body: "{invalid",
    });

    const result = await readJsonBody(request);

    expect(result.data).toBeNull();
    expect(result.response?.status).toBe(400);
  });
});
