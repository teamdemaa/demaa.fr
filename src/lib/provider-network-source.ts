export type ProviderNetworkSource = "firebase" | "snapshot";

type ProviderNetworkEnvironment = Readonly<{
  DEMAA_FORCE_LOCAL_DATA?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
}>;

export function resolveProviderNetworkSource(
  environment: ProviderNetworkEnvironment,
  hasFirebaseConfiguration: boolean,
): ProviderNetworkSource {
  const isDeployed = environment.NODE_ENV === "production"
    || Boolean(environment.VERCEL_ENV);

  if (!isDeployed && environment.DEMAA_FORCE_LOCAL_DATA === "true") {
    return "snapshot";
  }
  if (hasFirebaseConfiguration) {
    return "firebase";
  }
  if (isDeployed) {
    throw new Error(
      "Firebase Admin doit être configuré pour charger le réseau de prestataires.",
    );
  }
  return "snapshot";
}
