import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function componentSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return componentSources(path);
    return entry.name.endsWith(".tsx") ? [readFileSync(path, "utf8")] : [];
  });
}

describe("application elevation", () => {
  it("defines restrained shared elevation levels", () => {
    const globals = readFileSync("src/app/globals.css", "utf8");

    expect(globals).toContain(".demaa-floating-shadow");
    expect(globals).toContain(".demaa-popover-shadow");
    expect(globals).toContain(".demaa-dialog-shadow");
    expect(globals).toContain("rgba(23,35,29,0.055)");
    expect(globals).toContain("rgba(23,35,29,0.07)");
    expect(globals).toContain("rgba(23,35,29,0.08)");
  });

  it("keeps strong generic and legacy dialog shadows out of application components", () => {
    const application = componentSources("src/components").join("\n");
    const googleCallback = readFileSync(
      "src/app/(auth)/auth/google/GoogleAuthCallbackClient.tsx",
      "utf8",
    );
    const source = `${application}\n${googleCallback}`;

    expect(source).not.toMatch(/shadow-(?:lg|xl|2xl)/);
    expect(source).not.toContain("0_24px_70px_rgba(23,35,29,0.2)");
    expect(source).not.toContain("0_24px_70px_rgba(23,35,29,0.22)");
    expect(source).not.toContain("0_24px_70px_rgba(23,35,29,0.16)");
    expect(source).not.toContain("0_24px_70px_rgba(23,35,29,0.14)");
    expect(source).not.toContain("0_18px_46px_rgba(23,35,29,0.14)");
    expect(source).not.toContain("0_18px_46px_rgba(23,35,29,0.12)");
  });
});
