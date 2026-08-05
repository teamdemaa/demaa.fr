const PRODUCTION_PROJECT_ID = "demaa-dde32";

type ImportEnvironment = Readonly<Record<string, string | undefined>>;

function commandArgument(arguments_: readonly string[], prefix: string) {
  return arguments_.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

export function resolveFirebaseSolutionRegistryImportTarget({
  arguments_,
  environment,
}: {
  arguments_: readonly string[];
  environment: ImportEnvironment;
}) {
  const target = commandArgument(arguments_, "--target=") ?? "preview";
  const isProduction = target === "production";
  if (target !== "preview" && !isProduction) {
    throw new Error("Remote import target must be preview or production.");
  }

  const projectId = isProduction
    ? environment.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_PROJECT_ID
    : environment.FIREBASE_SOLUTION_REGISTRY_PREVIEW_PROJECT_ID;
  const confirmedProjectId = commandArgument(arguments_, "--confirm-project=");
  const hasApplyGate = isProduction
    ? arguments_.includes("--apply-production-active-revision")
    : arguments_.includes("--apply-active-revision");
  if (
    !hasApplyGate ||
    !projectId ||
    environment.FIREBASE_PROJECT_ID !== projectId ||
    confirmedProjectId !== projectId
  ) {
    throw new Error("The Firebase project identity and apply gate are not explicitly confirmed.");
  }
  if (isProduction && projectId !== PRODUCTION_PROJECT_ID) {
    throw new Error("The Firebase Production project is not the canonical Demaa project.");
  }
  if (
    !isProduction &&
    (!/(?:preview|staging|test|e2e)/i.test(projectId) ||
      projectId === PRODUCTION_PROJECT_ID)
  ) {
    throw new Error("The Firebase Preview project is not safely isolated from Production.");
  }

  const accessToken = isProduction
    ? environment.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN
    : environment.FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN;
  if (!accessToken) {
    const label = isProduction ? "Production" : "Preview";
    throw new Error(`Remote ${label} import requires an explicit ephemeral access token.`);
  }

  return {
    accessToken,
    isProduction,
    projectId,
    target,
    targetLabel: isProduction ? "Production" : "Preview",
  } as const;
}
