import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("client-only", () => ({}));
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

import ToolOutboundLink from "@/components/ToolOutboundLink";

describe("ToolOutboundLink", () => {
  it("renders one safe attributed external link", () => {
    const markup = renderToStaticMarkup(createElement(
      ToolOutboundLink,
      {
        href: "https://example.com/product?plan=team#pricing",
        surface: "tool_detail",
        toolSlug: "example-tool",
      },
      "Voir l’outil",
    ));

    expect(markup).toContain("target=\"_blank\"");
    expect(markup).toContain("rel=\"noopener noreferrer\"");
    expect(markup).toContain("plan=team");
    expect(markup).toContain("utm_source=demaa");
    expect(markup).toContain("utm_medium=referral");
    expect(markup).toContain("utm_campaign=solutions");
    expect(markup).toContain("#pricing");
  });

  it("fails closed for an unsafe destination", () => {
    expect(renderToStaticMarkup(createElement(
      ToolOutboundLink,
      {
        href: "javascript:alert(1)",
        surface: "tool_detail",
        toolSlug: "example-tool",
      },
      "Voir l’outil",
    ))).toBe("");
  });
});
