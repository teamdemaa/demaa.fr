import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SystemeTabContent from "@/components/SystemeTabContent";
import type { SystemeDetail } from "@/lib/systeme-catalog";

const systeme: SystemeDetail = {
  cards: [
    {
      pillar: "Direction",
      items: [
        {
          document: "Tableau de pilotage",
          documentId: "doc-direction",
          process: "Piloter l’activité",
          processId: "process-direction",
          steps: [],
        },
      ],
    },
    {
      pillar: "Marketing et Vente",
      items: [
        {
          document: "Plan commercial",
          documentId: "doc-marketing",
          process: "Qualifier les prospects",
          processId: "process-marketing",
          steps: [],
        },
      ],
    },
  ],
};

describe("system process accordion", () => {
  it("renders every process family collapsed by default", () => {
    const html = renderToStaticMarkup(
      createElement(SystemeTabContent, {
        systemName: "Bâtiment",
        systeme,
      }),
    );

    expect(html.match(/aria-expanded="false"/g)).toHaveLength(
      systeme.cards.length,
    );
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).not.toContain("Tableau de pilotage");
    expect(html).not.toContain("Plan commercial");
  });
});
