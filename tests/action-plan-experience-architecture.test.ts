import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("action plan experience architecture", () => {
  it("keeps the guest result in page memory until the user explicitly saves", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const saveControl = source("src/components/ActionPlanSaveControl.tsx");
    const shareControl = source("src/components/ActionPlanShareControl.tsx");
    const utilityActions = source("src/components/ActionPlanUtilityActions.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const commandBar = source("src/components/ActionPlanCommandBar.tsx");

    expect(experience).toContain("useState<EditableActionPlan | null>(null)");
    expect(experience).toContain("readGuestSelectedSystemId");
    expect(experience).toContain("writeGuestSelectedSystemId");
    expect(saveControl).not.toMatch(/localStorage|sessionStorage/);
    expect(saveControl).toContain('fetch("/api/action-plans"');
    expect(saveControl).toContain("router.push(`/plans/");
    expect(saveControl).toContain('"Enregistrer"');
    expect(saveControl).toContain("if (demoMode)");
    expect(saveControl).toContain("Enregistrer mon plan");
    expect(saveControl).not.toContain("actionPlanClaimSecret");
    expect(saveControl).not.toContain("Créer votre compte");
    expect(saveControl).toContain("réponses aux problématiques de dirigeants, actualités entrepreneuriales et tarifs négociés");
    expect(saveControl).toContain('fetch("/api/newsletter-subscribe"');
    expect(saveControl).toContain("checked={subscribeToStructure}");
    expect(saveControl).toContain('if (state === "saved")');
    expect(saveControl).toContain("return null");
    expect(saveControl).toContain("Aucun e-mail n’a été envoyé");
    expect(saveControl).not.toContain('if (demoMode) {\n      setState("saved")');
    expect(shareControl).toContain("navigator.share");
    expect(shareControl).toContain("navigator.clipboard.writeText");
    expect(shareControl).toContain('aria-label={copied ? "Plan copié" : "Partager le plan"}');
    expect(shareControl).toContain('variant === "menu" ? undefined : "sr-only"');
    expect(shareControl).toContain('variant === "icon" ? (');
    expect(shareControl).toContain('title={variant === "icon" ?');
    expect(shareControl).toContain("appearance-none whitespace-nowrap border-0 bg-transparent");
    expect(utilityActions).toContain("appearance-none whitespace-nowrap border-0 bg-transparent");
    expect(utilityActions).not.toContain('createPortal(');
    expect(utilityActions).toContain("<ActionPlanSaveControl");
    expect(utilityActions).toContain('<ActionPlanShareControl plan={plan} workspace={workspace} variant="menu" />');
    expect(utilityActions).not.toContain('plan.version !== "manual"');
    expect(utilityActions).toContain('<ActionPlanShareControl plan={plan} workspace={workspace} variant="menu" />');
    expect(utilityActions).toContain("Nouvelle situation");
    expect(utilityActions.match(/<ActionPlanSaveControl/g)).toHaveLength(1);
    expect(experience).toContain('demo !== "plan"');
    expect(experience).toContain("ACTION_PLAN_DEMO");
    expect(experience).toContain('demo === "blank"');
    expect(experience).toContain("Commencer avec un plan vierge");
    expect(experience).toContain("createManualActionPlan()");
    expect(experience).toContain("createManualActionPlanWorkspaceState()");
    expect(experience).toContain("onAddAction={handleAddAction}");
    expect(experience).toContain("headerActions={(");
    expect(result).toContain('type PlanSection = "tasks" | "strategy"');
    expect(result).toContain('type TaskView = "list" | "kanban"');
    expect(result).toContain("Notes personnelles");
    expect(result).not.toContain("demaa-accordion");
    expect(result).toContain("Ajouter une action");
    expect(result).toContain("Supprimer cette action ?");
    expect(result).toContain("Supprimer l’action");
    expect(result).toContain("function saveDraftsAndClose()");
    expect(result).toContain("onClick={saveDraftsAndClose}");
    expect(result).toContain("Supprimer la tâche");
    expect(result).toContain("workspace.deletedActionIds.includes(action.id)");
    expect(result).toContain("Générer un plan à partir de ma situation");
    expect(result).toContain("<ActionPlanCommandBar");
    expect(commandBar).toContain('fetch("/api/action-plan/command"');
    expect(commandBar).toContain("applyActionPlanCommandOperations");
    expect(commandBar).toContain("Commande IA désactivée dans la démo");
    expect(commandBar).toContain("Annuler");
  });

  it("keeps the latest authenticated edit when the user leaves quickly", () => {
    const savedPlan = source("src/components/SavedActionPlanDetail.tsx");

    expect(savedPlan).toContain("pendingSaveRef.current = {");
    expect(savedPlan).toContain("plan: currentPlan");
    expect(savedPlan).toContain("title: planTitle.trim() || confirmedTitleRef.current");
    expect(savedPlan).toContain('plan: isManualActionPlan(nextSave.plan) ? nextSave.plan : undefined');
    expect(savedPlan).toContain('window.addEventListener("pagehide", flushBeforeLeaving)');
    expect(savedPlan).toContain("keepalive: true");
    expect(savedPlan).toContain("flushBeforeLeaving();");
  });

  it("changes the selected system deterministically without another AI call", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");
    const systemSelector = source("src/components/ActionPlanSystemSelector.tsx");

    expect(experience).toContain('fetch("/api/action-plan/generate"');
    expect(systemPanel).toContain("/api/action-plan/system/");
    expect(systemPanel).toContain("systemPayloadCache");
    expect(systemPanel).toContain('demoMode ? "?demo=1" : ""');
    expect(systemPanel).not.toContain("/api/action-plan/generate");
    expect(systemPanel).toContain("if (!selectedSystemId)");
    expect(systemPanel).toContain("Choisissez votre système métier");
    expect(systemPanel).toContain("<ActionPlanSystemSelector");
    expect(systemPanel).toContain("onChange={selectSystem}");
    expect(systemSelector).toContain('role="listbox"');
    expect(systemSelector).toContain('role="combobox"');
    expect(systemPanel).toContain("<SystemDetailContent");
    expect(systemPanel).toContain("checkableProcess");
    expect(systemPanel).toContain("checkedProcessStepIdsBySystem");
    expect(systemPanel).toContain("selectedSolutionPlacementIdsBySystem");
    expect(systemPanel).not.toContain("Ouvrir la fiche complète");
    expect(experience).toContain("demoMode={isDemoMode}");
    const systemProcess = source("src/components/SystemeTabContent.tsx");
    expect(systemProcess).toContain('type="checkbox"');
    expect(systemProcess).not.toContain("line-through");
  });

  it("keeps the application navigation usable before generation", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const guestExperience = experience.slice(
      experience.indexOf("if (!plan)"),
      experience.indexOf("if (!workspace)"),
    );

    expect(guestExperience).toContain("<ActionPlanNavbar");
    expect(guestExperience).toContain('activeTab === "plan"');
    expect(guestExperience).toContain('activeTab === "system"');
    expect(guestExperience).toContain('activeTab === "academy"');
    expect(guestExperience).toContain('activeTab === "opportunities"');
    expect(guestExperience).toContain("workspace={prePlanWorkspace}");
    expect(guestExperience).toContain("onWorkspaceChange={setPrePlanWorkspace}");
    expect(guestExperience).not.toContain("<ActionPlanSaveControl");
  });

  it("embeds the Academy without nesting a second main landmark", () => {
    const academyPanel = source("src/components/ActionPlanAcademyPanel.tsx");
    const academyIndex = source("src/components/AcademyIndexClient.tsx");
    const coursePlayer = source("src/components/AcademyCoursePlayer.tsx");
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");

    expect(academyPanel).toContain("embedded");
    expect(experience).toContain("<ActionPlanUtilityActions");
    expect(academyIndex).toContain("embedded || isSearching || showAllFundamentals");
    expect(academyIndex).toContain("!embedded ? (");
    expect(academyIndex).toContain("<AppLibrarySearch");
    expect(systemPanel).toContain(
      'className="mx-auto mb-6 w-full max-w-xl xl:w-[min(40vw,36rem)]"',
    );
    expect(academyIndex).toContain('const ContentContainer = embedded ? "div" : "main"');
    expect(academyIndex).toContain("<ContentContainer");
    expect(academyPanel).toContain("onOpenContent={setSelectedContent}");
    expect(academyPanel).toContain("<AcademyCoursePlayer");
    expect(academyPanel).toContain("onBack={() => setSelectedContent(null)}");
    expect(academyIndex).toContain("onOpen?: (content: AcademyContentDefinition) => void");
    expect(coursePlayer).toContain('const CourseContainer = embedded ? "div" : "main"');
    expect(coursePlayer).toContain('if (activeScreen.type === "intro") return null');
    expect(coursePlayer).toContain("Quiz de connaissances");
    expect(coursePlayer).not.toContain("Cours fondamental");
    expect(coursePlayer).not.toContain("content.lessons.length} notions");
    expect(source("src/components/SystemDetailContent.tsx")).toContain(
      "!embedded ? <StructureNewsletterBlock /> : null",
    );
  });

  it("allows a saved plan return path without opening external redirects", () => {
    expect(getSafeCustomerReturnTo("/plans")).toBe("/plans");
    expect(getSafeCustomerReturnTo("/mon-espace/plans/abc_123")).toBe(
      "/plans/abc_123",
    );
    expect(getSafeCustomerReturnTo("//example.com/mon-espace")).toBe(
      "/",
    );
    expect(getSafeCustomerReturnTo("https://example.com/mon-espace")).toBe(
      "/",
    );
  });
});
