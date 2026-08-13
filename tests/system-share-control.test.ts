import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("system sharing", () => {
  it("shares the public application context instead of the current plan URL", async () => {
    const [control, panel] = await Promise.all([
      readFile(
        new URL("../src/components/SystemShareControl.tsx", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL("../src/components/ActionPlanSystemPanel.tsx", import.meta.url),
        "utf8",
      ),
    ]);

    expect(control).toContain("buildPublicSystemAppHref");
    expect(control).toContain("window.location.origin");
    expect(control).not.toContain("window.location.href");
    expect(panel).toContain("systemSlug={currentPayload.system.slug}");
    expect(panel).not.toContain("systemTab=");
    expect(panel).toContain("<SystemSolutionsTab");
    expect(panel).not.toContain("<SystemDetailContent");
  });
});
