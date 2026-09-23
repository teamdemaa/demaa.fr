import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CoachDirectoryClient from "@/components/CoachDirectoryClient";
import CoachContactForm from "@/components/CoachContactForm";
import { coachProfiles } from "@/lib/coach-directory";

describe("coach directory editorial preview", () => {
  it("shows sourced public profiles without implying partnership, reviews or a fixed Demaa price", () => {
    expect(coachProfiles).toHaveLength(3);
    expect(new Set(coachProfiles.map((coach) => coach.slug)).size).toBe(coachProfiles.length);
    expect(coachProfiles.every((coach) => coach.website.startsWith("https://"))).toBe(true);

    const markup = renderToStaticMarkup(createElement(CoachDirectoryClient, { coaches: coachProfiles }));
    expect(markup).toContain("Igor Baschet");
    expect(markup).toContain("Julian Perrier");
    expect(markup).toContain("Raïssa Bahsoun");
    expect(markup).toContain("Carte des coachs");
    expect(markup).toContain("Afficher les filtres par spécialité");
    expect(markup).toContain("Filtrer sur Paris, 2 coachs");
    expect(markup).toContain("La Réunion figure dans la liste");
    expect(markup).toContain("n’a pas encore vérifié leurs disponibilités");
    expect(markup).not.toContain("750 €");
    expect(markup).not.toContain("5/5");
    expect(markup).not.toContain("Partenaire DEMAA");
  });

  it("offers an honest contact form for a specific coach", () => {
    const markup = renderToStaticMarkup(createElement(CoachContactForm, { coach: coachProfiles[0] }));
    expect(markup).toContain("Demander un contact à Demaa");
    expect(markup).toContain("pas directement au coach");
    expect(markup).toContain("Votre besoin");
    expect(markup).toContain("Envoyer ma demande");
  });
});
