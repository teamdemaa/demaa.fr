import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("proxy canonical redirects", () => {
  it("redirects the www domain to the canonical host", () => {
    const request = new NextRequest("https://www.demaa.fr/mon-espace?paid=1", {
      headers: {
        host: "www.demaa.fr",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://demaa.fr/mon-espace?paid=1");
  });

  it("redirects vercel preview domains to the canonical host", () => {
    const request = new NextRequest("https://demaa-preview.vercel.app/services/test", {
      headers: {
        host: "demaa-preview.vercel.app",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://demaa.fr/services/test");
  });

  it("lets the canonical domain pass through", () => {
    const request = new NextRequest("https://demaa.fr/annuaire-services", {
      headers: {
        host: "demaa.fr",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
