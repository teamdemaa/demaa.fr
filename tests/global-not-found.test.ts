import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

describe("global not found route", () => {
  it("uses the router-level Next.js 404 convention", () => {
    const config = readFileSync(`${projectRoot}/next.config.ts`, "utf8");
    const page = readFileSync(
      `${projectRoot}/src/app/global-not-found.tsx`,
      "utf8",
    );

    expect(config).toContain("globalNotFound: true");
    expect(page).toContain("<html");
    expect(page).toContain("<body");
    expect(page).toContain("Page introuvable");
  });
});
