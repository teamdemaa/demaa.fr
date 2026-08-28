export const STRUCTURE_NEWSLETTER_NAME = "Structurer.";

export const STRUCTURE_NEWSLETTER_PROMISE =
  "Tous les quinze jours, Demaa part d’une problématique réelle et partage les processus, les outils et les décisions utiles pour mieux structurer votre activité.";

export const STRUCTURE_WORK_SESSION_DURATION_MINUTES = 45;

export const STRUCTURE_PUBLICATION_CONSENT = {
  purpose: "structure_case_publication",
  text: "J’accepte qu’une synthèse anonymisée de mon cas, validée avec moi, soit publiée dans Structurer.",
  version: "structure-case-publication-v5",
} as const;

export const STRUCTURE_VOICE_SUBMISSION = {
  enabled: false,
  maximumDurationSeconds: 120,
  recordingRetentionDays: 30,
  transcriptRetention: "same-as-written-submission",
  disabledReason: "secure-storage-and-expiry-worker-not-configured",
} as const;

export const STRUCTURE_PROBLEM_REQUEST_TYPE =
  "structure_problem_submission";
