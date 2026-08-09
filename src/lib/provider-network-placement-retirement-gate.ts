const PRODUCTION_PROJECT_ID = "demaa-dde32";

export type PlacementRetirementMode = "snapshot" | "remove" | "rollback";

function argument(arguments_: readonly string[], prefix: string) {
  return arguments_.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
}

export function resolvePlacementRetirementGate(input: {
  arguments_: readonly string[];
  environment: Readonly<Record<string, string | undefined>>;
  mode: PlacementRetirementMode;
}) {
  const target = argument(input.arguments_, "--target=") ?? "preview";
  if (target !== "preview" && target !== "production") {
    throw new Error("La cible doit être preview ou production.");
  }
  const isProduction = target === "production";
  const expectedProjectId = isProduction
    ? input.environment.FIREBASE_PROVIDER_NETWORK_PRODUCTION_PROJECT_ID
    : input.environment.FIREBASE_PROVIDER_NETWORK_PREVIEW_PROJECT_ID;
  const projectId = input.environment.FIREBASE_PROJECT_ID;
  const confirmedProjectId = argument(input.arguments_, "--confirm-project=");
  if (
    !expectedProjectId ||
    projectId !== expectedProjectId ||
    confirmedProjectId !== projectId
  ) {
    throw new Error("La cible Firebase doit être identifiée et confirmée explicitement.");
  }
  if (isProduction && projectId !== PRODUCTION_PROJECT_ID) {
    throw new Error("La cible Production n’est pas le projet Demaa canonique.");
  }
  if (!isProduction && (
    !/(preview|staging|test|e2e)/i.test(projectId) ||
    projectId === PRODUCTION_PROJECT_ID
  )) {
    throw new Error("La cible Preview n’est pas isolée de Production.");
  }

  const requiredGate = input.mode === "remove"
    ? isProduction
      ? "--apply-provider-placement-removal-production"
      : "--apply-provider-placement-removal-preview"
    : input.mode === "rollback"
      ? isProduction
        ? "--apply-provider-placement-rollback-production"
        : "--apply-provider-placement-rollback-preview"
      : null;
  if (requiredGate && !input.arguments_.includes(requiredGate)) {
    throw new Error(`Le gate explicite ${requiredGate} est obligatoire.`);
  }

  const accessToken = input.environment.FIREBASE_IMPORT_ACCESS_TOKEN?.trim()
    || (isProduction
      ? input.environment.FIREBASE_SOLUTION_REGISTRY_PRODUCTION_ACCESS_TOKEN?.trim()
      : input.environment.FIREBASE_SOLUTION_REGISTRY_PREVIEW_ACCESS_TOKEN?.trim());
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
    !impersonatedServiceAccount &&
    !usesApplicationDefault &&
    !usesWorkloadIdentity
  ) {
    throw new Error("Une identité Firebase éphémère ou ADC explicite est obligatoire.");
  }

  return {
    accessToken,
    impersonatedServiceAccount,
    isProduction,
    projectId,
    target,
    usesWorkloadIdentity,
  } as const;
}
