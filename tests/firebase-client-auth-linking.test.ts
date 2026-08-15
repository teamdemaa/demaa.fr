import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Firebase client provider linking", () => {
  it("links a pending Google credential after password authentication", async () => {
    const [authSource, googleButtonSource] = await Promise.all([
      readFile(new URL("../src/lib/firebase-client-auth.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/components/GoogleCustomerSignInButton.tsx", import.meta.url), "utf8"),
    ]);

    expect(authSource).toContain("GoogleAuthProvider.credentialFromError");
    expect(authSource).toContain('firebaseError.code === "auth/account-exists-with-different-credential"');
    expect(authSource).toContain("linkWithCredential(user, pendingLink.credential)");
    expect(authSource).toContain("pendingLink?.email === email.trim().toLowerCase()");
    expect(googleButtonSource).toContain("pour lier Google au même compte");
  });
});
