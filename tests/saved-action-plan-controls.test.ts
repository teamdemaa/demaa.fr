import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("saved action plan controls", () => {
  it("loads every owned plan into the compact three-point menu", () => {
    const page = source("src/app/(french)/(application)/plans/[id]/page.tsx");
    const sharedPage = source("src/components/SavedActionPlanPageView.tsx");
    const sharedLoader = source("src/lib/action-plan-pages.server.ts");
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");
    const copy = source("src/lib/action-plan-ui-copy.ts");

    expect(page).toContain("loadSavedActionPlanPage");
    expect(sharedLoader).toContain("getActionPlanWorkspacePageForIdentity");
    expect(sharedPage).toContain("availablePlans={availablePlans}");
    expect(sharedPage).toContain("initialTitle={stored.title}");
    expect(sharedPage).toContain("key={stored.id}");
    expect(detail).toContain("<SavedActionPlanSelector");
    expect(controls).toContain("getActionPlanUiCopy");
    expect(copy).toContain("Changer de plan");
    expect(copy).toContain("Modifié le");
    expect(controls).toContain("availablePlan.id === planId");
    expect(controls).toContain("onNavigate(getLocalizedActionPlanPath(");
    expect(controls).toContain("`/plans/${encodeURIComponent(availablePlan.id)}`");
    expect(copy).toContain("Génération en cours");
    expect(copy).toContain("À reprendre");
    expect(controls).not.toContain("Mon espace");
    expect(controls).not.toContain("<select");
  });

  it("edits the title inline through the existing optimistic revision queue", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");
    const copy = source("src/lib/action-plan-ui-copy.ts");

    expect(controls).toContain("copy.planName");
    expect(copy).toContain('planName: "Nom du plan"');
    expect(detail).toContain("expectedRevision: revisionRef.current");
    expect(detail).toContain("title: nextSave.title");
    expect(detail).toContain("revisionRef.current = body.revision");
    expect(detail).toContain("confirmedTitleRef.current = body.title || nextSave.title");
    expect(detail).toContain("saveQueueRef.current.drain");
    expect(detail).toContain("saveQueueRef.current.enqueue");
    expect(detail).toContain("mountedRef.current = true");
  });

  it("keeps plan lifecycle actions in a vertical three-point menu", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const controls = source("src/components/SavedActionPlanControls.tsx");
    const copy = source("src/lib/action-plan-ui-copy.ts");

    expect(detail).toContain('className="mb-3 flex min-w-0 max-w-[40rem] items-center gap-2"');
    expect(detail).toContain("<SavedActionPlanSelector");
    expect(detail).toContain("<SavedActionPlanMenu");
    expect(detail).not.toContain("headerActions={(\n                <SavedActionPlanMenu");
    expect(controls).toContain("<MoreVertical");
    expect(controls).toContain('className="inline-flex h-11 w-11');
    expect(controls).toContain("focus-visible:ring-2");
    expect(controls).toContain('className="flex h-11 min-w-0 flex-1');
    expect(controls).toContain("ActionPlanShareControl");
    expect(copy).toContain("Nouveau plan");
    expect(controls).toContain('getLocalizedActionPlanPath(localeCode, "/plans/new")');
    expect(copy).toContain("Renommer");
    expect(copy).toContain("Supprimer");
    expect(controls.indexOf("{copy.newPlan}")).toBeLessThan(
      controls.indexOf("ActionPlanShareControl", controls.indexOf("return (")),
    );
  });

  it("requires confirmation and delegates soft deletion to the canonical API", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const route = source("src/app/api/action-plans/[id]/route.ts");
    const storage = source("src/lib/action-plan-storage.server.ts");

    expect(detail).toContain("window.confirm");
    expect(detail).toContain('method: "DELETE"');
    expect(detail).toContain('router.replace(getLocalizedActionPlanPath(interfaceLocaleCode, "/plans"))');
    expect(route).toContain("deleteActionPlanForAccess");
    expect(storage).toContain('status: "deleted"');
  });

  it("waits for the save queue and exposes explicit retry or conflict choices", () => {
    const detail = source("src/components/SavedActionPlanDetail.tsx");
    const route = source("src/app/api/action-plans/[id]/route.ts");
    const copy = source("src/lib/action-plan-ui-copy.ts");

    expect(detail).toContain("const saved = await flushWorkspaceSave()");
    expect(detail).toContain("navigationTargetRef.current");
    expect(detail).toContain("if (saveConflictRef.current) return false");
    expect(detail).toContain("if (saveConflictRef.current) return;");
    expect(detail).toContain("getActionPlanUiCopy");
    expect(copy).toContain("Garder mes modifications");
    expect(copy).toContain("Utiliser la version récente");
    expect(copy).toContain("Réessayer");
    expect(route).toContain("export async function GET");
    expect(route).toContain("revision: plan.revision");
  });

  it("keeps one creation CTA and a conditional return path", () => {
    const plans = source("src/components/ActionPlansIndexView.tsx");
    const newPlan = source("src/components/NewActionPlanView.tsx");
    const copy = source("src/lib/action-plan-page-config.ts");
    const error = source("src/app/(french)/(application)/plans/[id]/error.tsx");
    const loading = source("src/app/(french)/(application)/plans/[id]/loading.tsx");

    expect(plans).toContain("{plans.length ? (");
    expect(plans).toContain("copy.createFirstPlan");
    expect(newPlan).toContain("config.copy.backToPlans");
    expect(newPlan).toContain("{hasPlans ? (");
    expect(copy).toContain('createFirstPlan: "Créer mon premier plan"');
    expect(copy).toContain('backToPlans: "← Retour à mes plans"');
    expect(error).toContain("Impossible d’ouvrir ce plan");
    expect(error).toContain("unstable_retry()");
    expect(loading).toContain("Ouverture du plan…");
  });
});
