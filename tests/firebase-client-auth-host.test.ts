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
    "demaa.co",
    "localhost",
    "127.0.0.1",
    "demaa-fr-git-codex-integration-ready-hiteamdemaa-2292s-projects.vercel.app",
  ])("allows %s", (hostname) => {
    useHostname(hostname);
    expect(isFirebaseGoogleAuthAllowedOnCurrentHost()).toBe(true);
  });

  it.each([
    "demaa.fr",
    "vercel.app.example.com",
    "example.com",
  ])("rejects %s", (hostname) => {
    useHostname(hostname);
    expect(isFirebaseGoogleAuthAllowedOnCurrentHost()).toBe(false);
  });
});
