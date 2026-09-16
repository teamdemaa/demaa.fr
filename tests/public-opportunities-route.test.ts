import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/opportunities/route";

describe("legacy public opportunities route", () => {
  it("does not expose opportunities through a public API", async () => {
    const response = await GET();
    expect(response.status).toBe(404);
  });
});
