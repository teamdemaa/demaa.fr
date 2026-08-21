import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAuthUiCopy } from "@/lib/auth-ui-copy";

const AUTH_COMPONENTS = [
  "CustomerSpaceAccessForm.tsx",
  "GoogleCustomerSignInButton.tsx",
  "GoogleAuthCallbackClient.tsx",
  "CustomerConnexionPage.tsx",
  "CustomerSpaceLoginDialog.tsx",
  "CustomerLogoutButton.tsx",
] as const;

function readComponent(fileName: string) {
  return fs.readFileSync(
    path.join(process.cwd(), "src", "components", fileName),
    "utf8",
  );
}

describe("auth UI copy", () => {
  it("keeps the progressive sign-in flow complete in both locales", () => {
    const fr = getAuthUiCopy("fr");
    const en = getAuthUiCopy("en");

    expect(fr.access).toEqual(expect.objectContaining({
      continueWithEmail: "Continuer avec mon e-mail",
      createAccess: "Créer mon accès",
      signIn: "Se connecter",
    }));
    expect(en.access).toEqual(expect.objectContaining({
      continueWithEmail: "Continue with my email",
      createAccess: "Create my access",
      signIn: "Sign in",
    }));
    expect(Object.keys(fr.access)).toEqual(Object.keys(en.access));
    expect(Object.keys(fr.errors)).toEqual(Object.keys(en.errors));
    expect(Object.keys(fr.google)).toEqual(Object.keys(en.google));
    expect(Object.keys(fr.page)).toEqual(Object.keys(en.page));
  });

  it("prevents visible bilingual string ternaries from returning to auth components", () => {
    for (const fileName of AUTH_COMPONENTS) {
      const source = readComponent(fileName);
      expect(source, fileName).toContain("getAuthUiCopy");
      const sourceWithoutLocalizedHomePath = source.replace(
        'localeCode === "en" ? "/en" : "/"',
        "",
      );
      expect(sourceWithoutLocalizedHomePath, fileName).not.toMatch(
        /localeCode\s*===\s*["']en["']\s*\?\s*["']/,
      );
    }
  });
});
