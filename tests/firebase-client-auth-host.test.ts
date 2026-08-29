import { afterEach, describe, expect, it, vi } from "vitest";
import { isFirebaseGoogleAuthAllowedOnCurrentHost } from "@/lib/firebase-client-auth";

afterEach(() => {
  vi.unstubAllGlobals();
});

function useHostname(hostname: string) {
  vi.stubGlobal("window", { location: { hostname } });
}

describe("Firebase Google auth hosts", () => {
  it.each([
    "demaa.fr",
    "localhost",
    "127.0.0.1",
  ])("allows %s", (hostname) => {
    useHostname(hostname);
    expect(isFirebaseGoogleAuthAllowedOnCurrentHost()).toBe(true);
  });

  it.each([
    "demaa.co",
    "demaa-fr-git-unknown-preview.vercel.app",
    "vercel.app.example.com",
    "example.com",
  ])("rejects %s", (hostname) => {
    useHostname(hostname);
    expect(isFirebaseGoogleAuthAllowedOnCurrentHost()).toBe(false);
  });

  it("allows only explicitly configured preview domains", () => {
    const preview = "demaa-fr-git-auth-preview.vercel.app";
    vi.stubEnv("NEXT_PUBLIC_FIREBASE_AUTHORIZED_DOMAINS", preview);
    useHostname(preview);
    expect(isFirebaseGoogleAuthAllowedOnCurrentHost()).toBe(true);
  });
});
