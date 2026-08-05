import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/system-setup-request/route";

describe("retired system setup request route", () => {
  it("returns 410 without inventing a replacement destination", async () => {
    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body).toEqual({
      error:
        "Ce formulaire a été remplacé par la prise de rendez-vous Fillout pour la session stratégique.",
    });
    expect(body).not.toHaveProperty("redirectTo");
  });
});
