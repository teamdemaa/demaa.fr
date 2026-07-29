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
          steps: [
            {
              defaultOwner: "Direction",
              order: 1,
              recurrence: "Hebdomadaire",
              step: "Mettre à jour les indicateurs",
              stepId: "step-direction",
            },
          ],
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
      systeme.cards.length +
        systeme.cards.reduce((total, card) => total + card.items.length, 0),
    );
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).not.toContain("Tableau de pilotage");
    expect(html).not.toContain("Plan commercial");
    expect(html).not.toContain("Mettre à jour les indicateurs");
    expect(html).not.toContain("Dans le système");
    expect(html).toContain(">01<");
    expect(html).toContain(">01.01<");
  });

  it("renders pilot routines as simple numbered accordions without unsupported assets", () => {
    const pilotSysteme: SystemeDetail = {
      cards: systeme.cards,
      routines: [
        {
          bullets: [
            "Qualifier la demande",
            "Préparer le devis détaillé",
            "Confirmer le calendrier",
          ],
          frequency: "À chaque demande",
          routineId: "routine.batiment.devis",
          support: null,
          title: "Qualifier une demande et préparer le devis",
        },
        {
          bullets: [
            "Planifier les équipes",
            "Confirmer le matériel",
          ],
          frequency: "Chaque semaine",
          routineId: "routine.batiment.planning",
          support: {
            assetRevision: "support-test",
            name: "Planning chantier validé",
          },
          title: "Planifier les équipes et les interventions",
        },
      ],
    };
    const html = renderToStaticMarkup(
      createElement(SystemeTabContent, {
        systemName: "Bâtiment",
        systeme: pilotSysteme,
      }),
    );

    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(html).not.toContain('aria-expanded="true"');
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).not.toContain("01.01");
    expect(html).not.toContain("Qualifier la demande</li>");
    expect(html).not.toContain("Dans le système");
    expect(html).not.toContain("Planning chantier validé");
  });
});
