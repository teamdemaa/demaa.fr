import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("action plan experience architecture", () => {
  it("authenticates before generation and opens only the persisted result", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const accessForm = source("src/components/CustomerSpaceAccessForm.tsx");
    const shareControl = source("src/components/ActionPlanShareControl.tsx");
    const utilityActions = source("src/components/ActionPlanUtilityActions.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const generationBar = source("src/components/ActionPlanGenerationBar.tsx");
    const generationScreen = source("src/components/ActionPlanGenerationScreen.tsx");
    const heroTitle = source("src/components/ActionPlanHeroTitle.tsx");
    const plansIndex = source("src/components/ActionPlansIndexView.tsx");
    const uiCopy = source("src/lib/action-plan-ui-copy.ts");

    expect(experience).toContain("useState<EditableActionPlan | null>(null)");
    expect(experience).toContain("readGuestSelectedSystemId");
    expect(experience).toContain("writeGuestSelectedSystemId");
    expect(experience).toContain('fetch("/api/action-plans"');
    expect(experience).toContain("createActionPlanGenerationDraft");
    expect(experience).toContain("writeActionPlanGenerationDraft(draft)");
    expect(experience).toContain('window.location.assign(`${newPlanPath}?resume=generation`)');
    expect(experience).toContain("runAuthenticatedActionPlanGeneration");
    expect(experience).toContain("setQueuedGenerationDraft(draft)");
    expect(experience).toContain("getLocalizedActionPlanPath(");
    expect(experience).toContain("choiceTitle={uiCopy.savePlan}");
    expect(experience).not.toContain("Votre plan sera généré et enregistré dans votre espace.");
    expect(experience).not.toContain("type PendingGeneratedPlan");
    expect(experience).not.toContain("setPendingGeneratedPlan({");
    expect(experience).not.toContain("Votre plan d’action est prêt");
    expect(experience).not.toContain("Créez votre accès pour le découvrir");
    const generationBranch = experience.slice(
      experience.lastIndexOf("if (isGenerating)"),
      experience.lastIndexOf("if (!plan)"),
    );
    expect(generationBranch).toContain("<ActionPlanGenerationScreen localeCode={contentLocaleCode} />");
    expect(generationScreen).toContain("Génération de votre plan d’action");
    expect(generationScreen).not.toContain("CustomerSpaceAccessForm");
    expect(experience).toContain("draft={accessDraft}");
    expect(experience).toContain("onDraftChange={setAccessDraft}");
    expect(experience).toContain("onRetrySave={requestAutoSaveRetry}");
    expect(experience).toContain("response.status === 401");
    expect(experience).toContain("autoSaveRunningRef.current");
    expect(experience).toContain("Sauvegarde de votre plan…");
    expect(experience).not.toContain("return () => controller.abort();\n  }, [autoSaveRevision");
    expect(accessForm).toContain("const activeDraft = draft ?? internalDraft");
    expect(accessForm).toContain("onDraftChange?.(nextDraft)");
    expect(experience).not.toContain("Continuer sans compte");
    expect(experience).not.toContain("Connectez-vous pour rattacher cette sélection");
    expect(experience).not.toContain("Créez votre accès pour conserver ce plan");
    expect(experience).not.toContain("Continuer avec un plan temporaire");
    expect(experience).not.toContain("Enregistrez votre sélection");
    expect(experience).toContain("onToggleSolutionSelection={handleSolutionSelection}");
    expect(experience).toContain("setPendingSolutionSelection(pending)");
    expect(experience).toContain("toPersistedAiGenerationMetadata");
    expect(experience).toContain("isBlankManualActionPlan(plan, workspace)");
    expect(experience).toContain("manualAccessPromptHandledRef.current = true");
    expect(experience).toContain("isActionEditorOpen");
    expect(experience).toContain("onActionEditorOpenChange={setIsActionEditorOpen}");
    expect(experience).toContain("useAccessibleDialog({");
    expect(experience).toContain("data-dialog-initial-focus");
    expect(accessForm).toContain("createPasswordAccountAndGetIdToken");
    expect(accessForm).toContain("signInWithPasswordAndGetIdToken");
    expect(accessForm).toContain("onAuthenticated={onAuthenticated");
    expect(accessForm).toContain("Créer mon accès");
    expect(shareControl).toContain("navigator.share");
    expect(shareControl).toContain("navigator.clipboard.writeText");
    expect(shareControl).toContain("aria-label={copied");
    expect(shareControl).toContain('"Plan copié"');
    expect(shareControl).toContain('"Partager le plan"');
    expect(shareControl).toContain('variant === "menu" ? undefined : "sr-only"');
    expect(shareControl).toContain('variant === "icon" ? (');
    expect(shareControl).toContain('title={variant === "icon"');
    expect(shareControl).toContain("appearance-none whitespace-nowrap border-0 bg-transparent");
    expect(utilityActions).toContain("appearance-none whitespace-nowrap border-0 bg-transparent");
    expect(utilityActions).not.toContain('createPortal(');
    expect(utilityActions).not.toContain("ActionPlanSaveControl");
    expect(utilityActions).not.toContain("Enregistrer");
    expect(utilityActions).not.toContain("onOpenAccess");
    expect(utilityActions).toContain("onClick={onRetrySave}");
    expect(utilityActions).toContain("Réessayer");
    expect(utilityActions).toContain("<ActionPlanShareControl");
    expect(utilityActions).toContain('variant="menu"');
    expect(utilityActions).not.toContain('plan.version !== "manual"');
    expect(utilityActions).toContain("localeCode={localeCode}");
    expect(utilityActions).toContain("Nouveau plan");
    expect(experience).toContain('demo !== "plan"');
    expect(experience).toContain("ACTION_PLAN_DEMO");
    expect(experience).toContain('demo === "blank"');
    expect(uiCopy).toContain("Commencer avec un plan vierge");
    expect(uiCopy).toContain(
      "On vous aide à clarifier les priorités, à structurer une activité plus rentable et moins dépendante de vous.",
    );
    expect(experience).toContain("max-w-[760px]");
    expect(experience).toContain("<ActionPlanHeroTitle");
    expect(heroTitle).toContain('["entreprise", "agence", "startup", "cabinet"]');
    expect(heroTitle).toContain('prefers-reduced-motion: reduce');
    expect(heroTitle).toContain('aria-label={accessibleTitle}');
    expect(heroTitle).toContain('`${subject}\\u00a0?`');
    expect(heroTitle).toContain('phase === "typing"');
    expect(heroTitle).toContain('phase === "deleting"');
    expect(heroTitle).toContain("animatedPhrase.slice(0, typedLength)");
    expect(heroTitle).not.toContain("transition-opacity");
    expect(plansIndex).not.toContain("plan.contentLocaleCode");
    expect(experience).toContain("createManualActionPlan()");
    expect(experience).toContain("createManualActionPlanWorkspaceState()");
    expect(experience).toContain("onAddAction={handleAddAction}");
    expect(generationScreen).toContain("Si je m’absente un mois, mon entreprise continue-t-elle de fonctionner ?");
    expect(generationScreen).toContain("Quelles décisions dépendent encore systématiquement de moi ?");
    expect(generationScreen).toContain("Mon équipe sait-elle quoi faire sans attendre mes instructions ?");
    expect(generationScreen).toContain("Que pourrais-je supprimer, simplifier, déléguer ou automatiser ?");
    expect(generationScreen).toContain("Est-ce que la qualité reste constante lorsque je ne supervise pas directement ?");
    expect(experience).toContain("headerActions={(");
    expect(result).not.toContain('type PlanSection = "tasks" | "strategy"');
    expect(result).not.toContain('>Stratégie</button>');
    expect(result).not.toContain("<StrategyPanel");
    expect(result).toContain('type TaskView = "list" | "kanban"');
    expect(result).toContain("Notes personnelles");
    expect(result).not.toContain("demaa-accordion");
    expect(result).toContain("Ajouter une action");
    expect(result).toContain("Ajouter un support personnel");
    expect(result).toContain("onActionEditorOpenChange?.(true)");
    expect(result).toContain("onActionEditorOpenChange?.(false)");
    expect(result).not.toContain("Aucune action pour le moment");
    expect(result).toContain('allActions.length < (manualMode ? 7 : 50)');
    expect(result).toContain('h-[52px]');
    expect(result).not.toContain('aria-label="Ajouter une action"\n            />');
    expect(result).not.toContain("Générer un plan à partir de ma situation");
    expect(generationBar).toContain(
      '"Qu’est-ce qui freine votre entreprise ?"',
    );
    expect(generationBar).not.toContain('"Que voulez-vous modifier ?"');
    expect(result).toContain("isBlankManualPlan && onGeneratePlan");
    expect(experience).toContain("createGeneratedActionPlanWorkspaceState");
    expect(experience).toContain("generatePlanFromSituation");
    expect(result).toContain("Supprimer cette action ?");
    expect(result).toContain("Supprimer l’action");
    expect(result).toContain("function saveDraftsAndClose()");
    expect(result).toContain("onClick={saveDraftsAndClose}");
    expect(result).toContain("Supprimer la tâche");
    expect(result).toContain("workspace.deletedActionIds.includes(action.id)");
    expect(result).not.toContain("Générer un plan à partir de ma situation");
    expect(result).toContain("<ActionPlanGenerationBar");
    expect(generationBar).not.toContain('fetch("/api/action-plan/command"');
    expect(generationBar).not.toContain("applyActionPlanCommandOperations");
    expect(generationBar).not.toContain("summarizeActionPlanCommandOperations");
    expect(generationBar).not.toContain("Plan mis à jour :");
    expect(result).toContain("closeAction();\n            onOpenSolution?.(input);");
    expect(result).toContain("closeAction();\n            onOpenService?.(serviceSlug);");
    expect(generationBar).toContain("useSpeechDictation");
    expect(generationBar).toContain("Dicter ma demande");
    expect(generationBar).not.toContain("Commande IA désactivée dans la démo");
    expect(generationBar).not.toContain("undoSnapshot");
    expect(existsSync("src/app/api/action-plan/command/route.ts")).toBe(false);
    expect(existsSync("src/lib/action-plan-command.server.ts")).toBe(false);
    expect(existsSync("src/lib/action-plan-command-contract.ts")).toBe(false);
  });

  it("keeps the latest authenticated edit when the user leaves quickly", () => {
    const savedPlan = source("src/components/SavedActionPlanDetail.tsx");

    expect(savedPlan).toContain("saveQueueRef.current.enqueue({");
    expect(savedPlan).toContain("plan: currentPlan");
    expect(savedPlan).toContain("title: planTitle.trim() || confirmedTitleRef.current");
    expect(savedPlan).toContain('plan: isManualActionPlan(nextSave.plan) ? nextSave.plan : undefined');
    expect(savedPlan).toContain('window.addEventListener("pagehide", flushBeforeLeaving)');
    expect(savedPlan).toContain("keepalive: true");
    expect(savedPlan).toContain("flushBeforeLeaving();");
    expect(savedPlan).toContain("saveQueueRef.current.drain");
    expect(savedPlan).toContain("response.status === 401");
    expect(savedPlan).toContain("writeActionPlanSaveRecovery");
    expect(savedPlan).toContain("<CustomerSpaceLoginDialog");
    expect(savedPlan).toContain("onAuthenticated={resumeSaveAfterAuthentication}");
  });

  it("waits for the first manual action editor to close before persisting", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const autoSaveEffect = experience.slice(
      experience.indexOf("if (\n      !isAuthenticated\n      || !plan"),
      experience.indexOf("useEffect(() => {\n    if (process.env.NODE_ENV !== \"development\")"),
    );

    expect(autoSaveEffect).toContain("|| isActionEditorOpen");
    expect(autoSaveEffect).toContain("isActionEditorOpen,");
    expect(autoSaveEffect).toContain('fetch("/api/action-plans"');
  });

  it("changes the selected system deterministically without another AI call", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const generationClient = source("src/lib/action-plan-generation.client.ts");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");
    const systemPayload = source(
      "src/lib/action-plan-system-payload.client.ts",
    );
    const systemSelector = source("src/components/ActionPlanSystemSelector.tsx");

    expect(experience).not.toContain('fetch("/api/action-plan/generate"');
    expect(generationClient).toContain('fetch("/api/action-plans/generate"');
    expect(systemPayload).toContain("/api/action-plan/system/");
    expect(systemPayload).toContain("payloadCache");
    expect(systemPayload).toContain("const query = new URLSearchParams()");
    expect(systemPayload).toContain('query.set("demo", "1")');
    expect(systemPayload).toContain('query.set("locale", input.localeCode)');
    expect(systemPayload).toContain('query.set("market", input.marketCode)');
    expect(systemPanel).toContain("loadActionPlanSystemPayload");
    expect(systemPanel).not.toContain("/api/action-plan/generate");
    expect(systemPanel).toContain("if (!selectedSystemId)");
    expect(systemPanel).toContain("Choisissez votre activité");
    expect(systemPanel).toContain("<ActionPlanSystemSelector");
    expect(systemPanel).toContain("onChange={selectSystem}");
    expect(systemSelector).toContain('role="listbox"');
    expect(systemSelector).toContain('role="combobox"');
    expect(systemPanel).toContain("<SystemSolutionsTab");
    expect(systemPanel).toContain('<h1 className="sr-only">');
    expect(systemPanel).toContain("Solutions pour votre activité");
    expect(systemPanel).toContain("<SystemResourcesTab");
    expect(systemPanel).toContain("initialResourceSlug={initialResourceSlug}");
    expect(systemPanel).toContain("onResourceSlugChange={onResourceSlugChange}");
    expect(systemPanel).not.toContain("<SystemDetailContent");
    expect(systemPanel).not.toContain("checkableProcess");
    expect(systemPanel).not.toContain("checkedProcessStepIdsBySystem");
    expect(systemPanel).toContain("selectedSolutionPlacementIdsBySystem");
    expect(systemPanel).not.toContain("Ouvrir la fiche complète");
    expect(experience).toContain("demoMode={isDemoMode}");
    expect(systemPanel).not.toContain("Organisation");
  });

  it("keeps embedded Solutions and Academy landmarks explicit and closes a detail before navigating", () => {
    const solutions = source("src/components/SystemSolutionsTab.tsx");
    const academy = source("src/components/AcademyIndexClient.tsx");
    const actionStart = solutions.indexOf("<SolutionAction");
    const actionEnd = solutions.indexOf("/>\n      ) : null}", actionStart);
    const actionSource = solutions.slice(actionStart, actionEnd);

    expect(academy).toContain('<h1 className="sr-only">');
    expect(academy).toContain('localeCode === "en" ? "Academy" : "Académie"');
    expect(actionSource).toContain("onClose();");
    expect(actionSource.indexOf("onClose();")).toBeLessThan(
      actionSource.indexOf('trackSystemSolutionEvent("system_solution_resource_cta_clicked"'),
    );
  });

  it("keeps the application navigation usable before generation", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const guestExperience = experience.slice(
      experience.indexOf("if (!plan)"),
      experience.indexOf("if (!workspace)"),
    );

    expect(guestExperience).toContain("<ActionPlanNavbar");
    expect(guestExperience).toContain('activeTab === "plan"');
    expect(guestExperience).not.toContain("<ActionPlanWorkspaceTabs");
    expect(guestExperience).not.toContain("activePlanTab");
    expect(guestExperience).toContain("<ActionPlanSystemPanel");
    expect(guestExperience).toContain('appContext.planSection === "solutions"');
    expect(guestExperience).toContain('activeTab === "services"');
    expect(guestExperience).toContain('activeTab === "academy"');
    expect(guestExperience).toContain('activeTab === "opportunities"');
    expect(guestExperience).toContain("<OpportunitiesPanel");
    expect(guestExperience).toContain("demoMode={isDemoMode}");
    expect(guestExperience).toContain("workspace={prePlanWorkspace}");
    expect(guestExperience).toContain("onWorkspaceChange={setPrePlanWorkspace}");
    expect(guestExperience).not.toContain("<ActionPlanSaveControl");
  });

  it("keeps a deep-linked system when a saved plan returns to Solutions", () => {
    const savedPlan = source("src/components/SavedActionPlanDetail.tsx");

    expect(savedPlan).toContain(
      "appContext.systemId || workspace.selectedSystemId || currentPlan.systemId || \"\"",
    );
    expect(savedPlan).toContain("sourceText={initialSourceText}");
    expect(savedPlan).toContain("solutionResourceSlug: resourceSlug");
  });

  it("embeds the Academy without nesting a second main landmark", () => {
    const academyPanel = source("src/components/ActionPlanAcademyPanel.tsx");
    const academyIndex = source("src/components/AcademyIndexClient.tsx");
    const coursePlayer = source("src/components/AcademyCoursePlayer.tsx");
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");

    expect(academyPanel).toContain("embedded");
    expect(experience).toContain("<ActionPlanUtilityActions");
    expect(experience).not.toContain("onOpenAccess={() => setAccessPromptOpen(true)}");
    expect(academyIndex).toContain("embedded || isSearching || showAllFundamentals");
    expect(academyIndex).toContain("!embedded ? (");
    expect(academyIndex).toContain("<AppLibrarySearch");
    expect(systemPanel).toContain(
      'className="mx-auto mb-6 w-full max-w-xl xl:w-[min(40vw,36rem)]"',
    );
    expect(academyIndex).toContain('const ContentContainer = embedded ? "div" : "main"');
    expect(academyIndex).toContain("<ContentContainer");
    expect(academyPanel).toContain("onContentChange?.(content.identity.slug)");
    expect(academyPanel).toContain("onContentChange?.(undefined)");
    expect(academyPanel).toContain("<AcademyCoursePlayer");
    expect(academyPanel).toContain(
      'import AcademyIndexClient from "@/components/AcademyIndexClient"',
    );
    expect(academyPanel).toContain("loadActionPlanAcademyPayload");
    expect(academyPanel).toContain("invalidateActionPlanAcademyPayload");
    expect(academyPanel).not.toContain('cache: "no-store"');
    expect(academyPanel).not.toContain(
      'dynamic(\n  () => import("@/components/AcademyIndexClient")',
    );
    expect(experience).toContain("scheduleActionPlanAcademyPayloadPreload");
    expect(source("src/components/SavedActionPlanDetail.tsx")).toContain(
      "scheduleActionPlanAcademyPayloadPreload",
    );
    expect(academyPanel).toContain("onBack={() => {");
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
