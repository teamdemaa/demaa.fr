import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("saved action plan controls", () => {
  it("loads every owned plan into one compact in-app selector", () => {
    const page = source("src/app/plans/[id]/page.tsx");
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");

    expect(page).toContain("getOwnedActionPlans");
    expect(page).toContain("availablePlans={availablePlans}");
    expect(page).toContain("initialTitle={stored.title}");
    expect(page).toContain("key={stored.id}");
    expect(detail).toContain("<SavedActionPlanSelector");
    expect(controls).toContain('aria-label="Changer de plan"');
    expect(controls).toContain("router.push(`/plans/");
    expect(controls).not.toContain("Mon espace");
    expect(controls).not.toContain("Mes plans");
  });

  it("edits the title inline through the existing optimistic revision queue", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");

    expect(controls).toContain('aria-label="Nom du plan"');
    expect(detail).toContain("expectedRevision: revisionRef.current");
    expect(detail).toContain("title: nextSave.title");
    expect(detail).toContain("revisionRef.current = body.revision");
    expect(detail).toContain("confirmedTitleRef.current = body.title || nextSave.title");
    expect(detail).toContain("savePromiseRef");
  });

  it("keeps plan lifecycle actions in a vertical three-point menu", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");

    expect(detail).toContain("headerActions={(");
    expect(controls).toContain("<MoreVertical");
    expect(controls).toContain("ActionPlanShareControl");
    expect(controls).toContain("Nouveau plan");
    expect(controls).toContain('router.push("/?new=1")');
    expect(controls).toContain("Renommer");
    expect(controls).toContain("Supprimer");
  });

  it("requires confirmation and delegates soft deletion to the canonical API", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const route = source("src/app/api/action-plans/[id]/route.ts");
    const storage = source("src/lib/action-plan-storage.server.ts");

    expect(detail).toContain("window.confirm");
    expect(detail).toContain('method: "DELETE"');
    expect(detail).toContain('router.replace("/plans")');
    expect(route).toContain("deleteActionPlanForAccess");
    expect(storage).toContain('status: "deleted"');
  });
});
