import { describe, expect, it } from "vitest";
import {
  getLocaleSwitchCopy,
  getLocaleSwitchHref,
} from "@/components/LocaleSwitcher";

describe("locale switcher", () => {
  it("preserves the complete plan context when switching to English", () => {
    expect(getLocaleSwitchHref(
      "/plans/plan-1",
      "view=solutions&system=cabinet-comptable&resource=pennylane",
      "en",
    )).toBe(
      "/en/plans/plan-1?view=solutions&system=cabinet-comptable&resource=pennylane",
    );
  });

  it("removes only the English prefix when switching back to French", () => {
    expect(getLocaleSwitchHref(
      "/en/plans/plan-1",
      "view=academy&academy=piloter-sa-tresorerie",
      "fr",
    )).toBe(
      "/plans/plan-1?view=academy&academy=piloter-sa-tresorerie",
    );
  });

  it("maps the two canonical roots without duplicating the prefix", () => {
    expect(getLocaleSwitchHref("/", "", "en")).toBe("/en");
    expect(getLocaleSwitchHref("/en", "", "fr")).toBe("/");
  });

  it("uses discreet locale codes while keeping explicit accessible labels", () => {
    expect(getLocaleSwitchCopy("fr")).toEqual({
      ariaLabel: "View Demaa in English",
      label: "EN",
    });
    expect(getLocaleSwitchCopy("en")).toEqual({
      ariaLabel: "Afficher Demaa en français",
      label: "FR",
    });
  });
});
