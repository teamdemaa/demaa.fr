const PRODUCTION_PROJECT_ID = "demaa-dde32";

function argument(arguments_: readonly string[], prefix: string) {
  return arguments_.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

export function resolveFirebaseSolutionDraftImportTarget(input: {
  arguments_: readonly string[];
  environment: Readonly<Record<string, string | undefined>>;
}) {
  const target = argument(input.arguments_, "--target=") ?? "preview";
  if (target !== "preview" && target !== "production") {
    throw new Error("Remote draft import target must be preview or production.");
  }
  const isProduction = target === "production";
  const projectId = isProduction
    ? input.environment.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID
    : input.environment.FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID;
  const confirmedProjectId = argument(input.arguments_, "--confirm-project=");
  const requiredGate = isProduction
    ? "--apply-production-draft-revision"
    : "--apply-preview-draft-revision";
  if (
    !input.arguments_.includes(requiredGate) ||
    !projectId ||
    input.environment.FIREBASE_PROJECT_ID !== projectId ||
    confirmedProjectId !== projectId
  ) {
    throw new Error(
      `The Firebase project identity and dedicated ${requiredGate} gate must be confirmed.`,
    );
  }
  if (isProduction && projectId !== PRODUCTION_PROJECT_ID) {
    throw new Error("The Firebase Production project is not the canonical Demaa project.");
  }
  if (!isProduction && (
    !/(preview|staging|test|e2e)/i.test(projectId) ||
    projectId === PRODUCTION_PROJECT_ID
  )) {
    throw new Error("The Firebase Preview project is not safely isolated from Production.");
  }
  const accessToken = isProduction
    ? input.environment.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN?.trim()
    : input.environment.FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN?.trim();
  const fallbackAccessToken = input.environment.FIREBASE_IMPORT_ACCESS_TOKEN?.trim();
  const impersonatedServiceAccount =
    input.environment.FIREBASE_IMPORT_IMPERSONATE_SERVICE_ACCOUNT?.trim();
  const usesApplicationDefault =
    input.environment.FIREBASE_USE_APPLICATION_DEFAULT === "true";
  const usesWorkloadIdentity = Boolean(
    input.environment.FIREBASE_WORKLOAD_IDENTITY_PROVIDER &&
    input.environment.FIREBASE_WORKLOAD_IDENTITY_SERVICE_ACCOUNT,
  );
  if (
    !accessToken &&
    !fallbackAccessToken &&
    !impersonatedServiceAccount &&
    !usesApplicationDefault &&
    !usesWorkloadIdentity
  ) {
    throw new Error("Remote draft import requires an ephemeral identity or explicit ADC.");
  }
  return {
    accessToken: accessToken || fallbackAccessToken,
    impersonatedServiceAccount,
    isProduction,
    projectId,
    target,
    targetLabel: isProduction ? "Production" : "Preview",
    usesWorkloadIdentity,
  } as const;
}
