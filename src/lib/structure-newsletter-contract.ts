export const STRUCTURE_NEWSLETTER_NAME = "Structurer.";

export const STRUCTURE_NEWSLETTER_PROMISE =
  "Tous les quinze jours, l’équipe Demaa étudie une problématique réelle d’entreprise et construit une réponse concrète, utile à tous.";

export const STRUCTURE_PUBLICATION_CONSENT = {
  purpose: "structure_case_publication",
  text: "J’accepte que mon entreprise, mon site et ma problématique soient présentés dans Organiser si ma proposition est sélectionnée.",
  version: "structure-case-publication-v2",
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
