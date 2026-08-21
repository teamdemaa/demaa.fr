import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Firebase client provider separation", () => {
  it("does not persist OAuth credentials or silently link providers", async () => {
    const [authSource, googleButtonSource, authCopySource] = await Promise.all([
      readFile(new URL("../src/lib/firebase-client-auth.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/components/GoogleCustomerSignInButton.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/lib/auth-ui-copy.ts", import.meta.url), "utf8"),
    ]);

    expect(authSource).not.toContain("credentialFromError");
    expect(authSource).not.toContain("linkWithCredential");
    expect(authSource).not.toContain("OAuthCredential");
    expect(authSource).not.toContain("accessToken");
    expect(googleButtonSource).toContain("copy.errors.googleAccountUsesPassword");
    expect(authCopySource).toContain("Connectez-vous avec votre e-mail");
  });
});
