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
  routines: [
    {
      bullets: [
        "Mettre à jour les indicateurs",
        "Analyser les écarts",
      ],
      cadence: "Chaque semaine",
      routineId: "routine.cabinet-conseil.process-direction",
      support: null,
      title: "Piloter l’activité",
    },
    {
      bullets: [
        "Qualifier le besoin",
        "Confirmer la prochaine étape",
      ],
      cadence: "À chaque demande",
      routineId: "routine.cabinet-conseil.process-marketing",
      support: null,
      title: "Qualifier les prospects",
    },
  ],
};

describe("system process accordion", () => {
  it("renders derived routines with the first one open by default", () => {
    const html = renderToStaticMarkup(
      createElement(SystemeTabContent, {
        systemName: "Bâtiment",
        systeme,
      }),
    );

    expect(html.match(/aria-expanded="false"/g)).toHaveLength(1);
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html).toContain("Mettre à jour les indicateurs");
    expect(html).not.toContain("Qualifier le besoin");
    expect(html).not.toContain("Dans le système");
    expect(html).not.toContain("Routines essentielles");
    expect(html).not.toContain(
      "Les rendez-vous opérationnels à installer pour piloter l’activité",
    );
    expect(html).toContain('aria-label="Routines du système"');
    expect(html).toContain("font-medium");
    expect(html).not.toContain("font-semibold leading-snug");
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).toContain("Chaque semaine");
    expect(html).toContain("À chaque demande");
    expect(html.match(/data-process-cadence/g)).toHaveLength(2);
    expect(html).not.toContain("Une fois, puis à revoir si besoin");
    expect(html).not.toContain("01.01");
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
          cadence: "À chaque demande",
          routineId: "routine.batiment.devis",
          support: null,
          title: "Qualifier une demande et préparer le devis",
        },
        {
          bullets: [
            "Planifier les équipes",
            "Confirmer le matériel",
          ],
          cadence: "Chaque semaine",
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

    expect(html.match(/aria-expanded="false"/g)).toHaveLength(1);
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html).toContain(">01<");
    expect(html).toContain(">02<");
    expect(html).not.toContain("01.01");
    expect(html).toContain("Qualifier la demande");
    expect(html).not.toContain("Dans le système");
    expect(html).not.toContain("Planning chantier validé");
  });
});
