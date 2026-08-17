import "server-only";

export function isEnglishBetaEnabled() {
  return process.env.DEMAA_ENGLISH_BETA_ENABLED === "true";
}
