import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser public journey", () => {
  const landing = read("src/components/OrganiserLandingPage.tsx");
  const organiserPage = read("src/app/(marketing)/organiser/page.tsx");
  const processPage = read("src/app/(marketing)/organiser/processus/page.tsx");

  it("keeps the diagnostic as the landing CTA rather than a navbar action", () => {
    const navbar = read("src/components/Navbar.tsx");

    expect(landing).toContain('href="/diagnostic-organisation"');
    expect(landing).toContain("Diagnostic organisation");
    expect(navbar).not.toContain("Diagnostic organisation");
  });

  it("separates the commercial landing from the process library", () => {
    expect(organiserPage).toContain("<OrganiserLandingPage />");
    expect(processPage).toContain("<AcademyIndexClient");
    expect(processPage).toContain('canonical: "/organiser/processus"');
    expect(processPage).toContain("Des cas concrets pour organiser votre activité");
    expect(landing).toContain('href="/organiser/processus"');
  });

  it("publishes the agreed scope and distinct price bases", () => {
    expect(landing).toContain("À partir de 1 500 € HT");
    expect(landing).toContain("Base de calcul : 550 € HT / jour");
    expect(landing).toContain("4 500 € HT");
    expect(landing).toContain("700 € HT par jour");
    expect(landing).not.toContain("3 sessions");
  });

  it("keeps tools subordinate to the operating need", () => {
    expect(landing).toContain(
      "Nous choisissons les processus, les règles et les outils en fonction de votre fonctionnement.",
    );
    expect(landing).toContain("notamment Airtable, Fillout et Make");
  });

  it("provides a human next step and explains when an application métier is useful", () => {
    const discussion = read("src/components/OrganiserProjectDiscussionButton.tsx");

    expect(landing).toContain("Quand les outils existants ne suffisent plus");
    expect(landing).toContain("Nous pouvons aussi concevoir une application métier adaptée à votre fonctionnement");
    expect(landing).toContain('href="/application-metier"');
    expect(landing).toContain("<OrganiserProjectDiscussionButton");
    expect(discussion).toContain("Discuter de votre projet");
    expect(discussion).toContain("showCallbackAvailability");
    expect(discussion).toContain("requirePhone");
  });
});
