#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_DAILY_SENDS = 20;
const TIME_ZONE = "Europe/Paris";
const SEGMENT = "cabinet-expertise-comptable-pennylane";
const PENNYLANE_EVIDENCE_TYPES = new Set([
  "official_pennylane_story",
  "official_firm_explicit_mention",
  "official_firm_app_link",
]);
const GENERIC_LOCAL_PARTS = new Set([
  "bonjour",
  "cabinet",
  "contact",
  "hello",
  "info",
  "office",
  "secretariat",
]);

function fail(message, code = 1) {
  const error = new Error(message);
  error.exitCode = code;
  throw error;
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) fail(`Argument inattendu : ${token}`);
    const key = token.slice(2);
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) fail(`Valeur manquante pour --${key}`);
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

function required(options, key) {
  if (!options[key]) fail(`Option --${key} requise`);
  return options[key];
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLocaleLowerCase("fr");
}

function normalizeDomain(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

function normalizeSiren(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ""));
}

function validateHttpsUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${label} n'est pas une URL valide`);
  }
  if (url.protocol !== "https:") fail(`${label} doit utiliser HTTPS`);
}

function validateSource(source, label) {
  if (!source || typeof source !== "object") fail(`${label} est absent`);
  validateHttpsUrl(source.url, `${label}.url`);
  if (!String(source.publisher ?? "").trim()) fail(`${label}.publisher est absent`);
  if (!isIsoDate(source.checkedAt)) fail(`${label}.checkedAt doit être YYYY-MM-DD`);
  const words = String(source.excerpt ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 25) {
    fail(`${label}.excerpt doit contenir de 1 à 25 mots`);
  }
}

function validateCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") fail("Dossier candidat invalide");
  if (!/^[a-z0-9][a-z0-9-]+$/.test(candidate.id ?? "")) fail("id invalide");

  const company = candidate.company ?? {};
  const siren = normalizeSiren(company.siren);
  const siret = String(company.siret ?? "").replace(/\D/g, "");
  const domain = normalizeDomain(company.domain || company.website);
  if (!String(company.name ?? "").trim()) fail("company.name absent");
  if (!/^\d{9}$/.test(siren)) fail("company.siren doit contenir 9 chiffres");
  if (siret && !/^\d{14}$/.test(siret)) fail("company.siret doit contenir 14 chiffres");
  if (company.activityCode !== "69.20Z") fail("Le cabinet doit avoir le code NAF 69.20Z");
  if (company.status !== "active") fail("Le cabinet doit être actif");
  validateHttpsUrl(company.website, "company.website");
  if (!domain) fail("company.domain absent");
  if (!String(company.address ?? "").trim()) fail("company.address absente");

  const fit = candidate.fit ?? {};
  if (fit.segment !== SEGMENT) fail(`fit.segment doit être ${SEGMENT}`);
  if (!Array.isArray(fit.pennylaneEvidence) || fit.pennylaneEvidence.length === 0) {
    fail("Une preuve Pennylane directe est obligatoire");
  }
  fit.pennylaneEvidence.forEach((evidence, index) => {
    if (!PENNYLANE_EVIDENCE_TYPES.has(evidence.type)) {
      fail(`Type de preuve Pennylane refusé à l'index ${index}`);
    }
    validateSource(evidence, `fit.pennylaneEvidence[${index}]`);
  });
  if (!Array.isArray(fit.signals)) fail("fit.signals doit être une liste");
  fit.signals.forEach((signal, index) => {
    if (!new Set(["fact", "inference"]).has(signal.kind)) fail(`Signal ${index} mal typé`);
    if (!String(signal.claim ?? "").trim()) fail(`Signal ${index} sans claim`);
    if (!Array.isArray(signal.sourceUrls) || signal.sourceUrls.length === 0) {
      fail(`Signal ${index} sans source`);
    }
    signal.sourceUrls.forEach((url) => validateHttpsUrl(url, `fit.signals[${index}].sourceUrl`));
  });

  const contact = candidate.contact ?? {};
  const email = normalizeEmail(contact.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("contact.email invalide");
  validateHttpsUrl(contact.sourceUrl, "contact.sourceUrl");
  if (!isIsoDate(contact.checkedAt)) fail("contact.checkedAt doit être YYYY-MM-DD");
  if (!new Set(["generic", "named_professional"]).has(contact.type)) fail("contact.type invalide");
  const [localPart, emailDomain] = email.split("@");
  if (contact.type === "generic" && !GENERIC_LOCAL_PARTS.has(localPart)) {
    fail("L'adresse générique utilise un préfixe non reconnu ; la classer et la vérifier manuellement");
  }
  if (contact.type === "named_professional" && (!contact.role || !contact.roleRelevance)) {
    fail("Une adresse nominative exige role et roleRelevance");
  }
  if (normalizeDomain(emailDomain) !== domain) fail("Le domaine de l'e-mail ne correspond pas au domaine vérifié");

  if (!Array.isArray(candidate.sources) || candidate.sources.length === 0) fail("sources absentes");
  candidate.sources.forEach((source, index) => validateSource(source, `sources[${index}]`));

  return {
    ...candidate,
    company: { ...company, siren, siret, domain },
    contact: { ...contact, email },
  };
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function workspacePaths(workspace) {
  const root = path.resolve(workspace);
  return {
    root,
    prospects: path.join(root, "prospects.json"),
    oppositions: path.join(root, "oppositions.json"),
    ledger: path.join(root, "daily-ledger.json"),
  };
}

async function loadWorkspace(options) {
  const files = workspacePaths(required(options, "workspace"));
  const prospects = await readJson(files.prospects, { version: 1, prospects: [] });
  const oppositions = await readJson(files.oppositions, { version: 1, entries: [] });
  const ledger = await readJson(files.ledger, { version: 1, timeZone: TIME_ZONE, days: {} });
  return { files, prospects, oppositions, ledger };
}

function oppositionHashes(candidate) {
  return new Set([
    `email:${sha256(normalizeEmail(candidate.contact.email))}`,
    `domain:${sha256(normalizeDomain(candidate.company.domain))}`,
  ]);
}

function findOpposition(candidate, oppositions) {
  const keys = oppositionHashes(candidate);
  return oppositions.entries.find((entry) => keys.has(`${entry.kind}:${entry.sha256}`));
}

function duplicateReason(candidate, prospects) {
  for (const current of prospects.prospects) {
    if (current.id === candidate.id) return { kind: "id", current };
    if (normalizeSiren(current.company?.siren) === candidate.company.siren) return { kind: "siren", current };
    if (normalizeDomain(current.company?.domain) === candidate.company.domain) return { kind: "domain", current };
    if (normalizeEmail(current.contact?.email) === candidate.contact.email) return { kind: "email", current };
  }
  return null;
}

function localDateParts(isoTimestamp) {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) fail("Horodatage ISO invalide");
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
  });
  return { date: dateFormatter.format(date), weekday: weekdayFormatter.format(date) };
}

function validateApproval(approval, prospect, draftHash) {
  if (approval.prospectId !== prospect.id) fail("La validation ne correspond pas au prospect");
  if (!String(approval.approvedBy ?? "").trim()) fail("approvedBy absent");
  if (!approval.approvedAt || Number.isNaN(Date.parse(approval.approvedAt))) fail("approvedAt invalide");
  if (approval.draftSha256 !== draftHash) fail("Le brouillon diffère du texte validé");
}

async function prepare(options) {
  const candidatePath = path.resolve(required(options, "candidate"));
  const draftPath = path.resolve(required(options, "draft"));
  const candidate = validateCandidate(JSON.parse(await fs.readFile(candidatePath, "utf8")));
  const draft = await fs.readFile(draftPath, "utf8");
  if (!draft.trim()) fail("Le brouillon est vide");
  const state = await loadWorkspace(options);
  const opposition = findOpposition(candidate, state.oppositions);
  if (opposition) fail(`Prospect bloqué par une opposition ${opposition.kind}`);

  const now = new Date().toISOString();
  const candidateHash = sha256(JSON.stringify(candidate));
  const draftHash = sha256(draft);
  const duplicate = duplicateReason(candidate, state.prospects);
  if (duplicate) {
    const sameRecord = duplicate.current.id === candidate.id;
    const sameCandidate = duplicate.current.candidateSha256 === candidateHash;
    const sameDraft = duplicate.current.draft?.sha256 === draftHash;
    if (sameRecord && sameCandidate && sameDraft) {
      console.log(JSON.stringify({ result: "idempotent", id: candidate.id, status: duplicate.current.status }, null, 2));
      return;
    }
    fail(`Doublon détecté par ${duplicate.kind} avec ${duplicate.current.id}`);
  }

  const subjectLine = draft.split(/\r?\n/).find((line) => line.toLocaleLowerCase("fr").startsWith("objet :"));
  const record = {
    ...candidate,
    candidateSha256: candidateHash,
    draft: {
      path: path.relative(state.files.root, draftPath),
      sha256: draftHash,
      subject: subjectLine?.replace(/^objet\s*:\s*/i, "") ?? "",
    },
    status: "draft_prepared_pending_validation",
    createdAt: now,
    updatedAt: now,
  };
  state.prospects.prospects.push(record);
  await writeJson(state.files.prospects, state.prospects);
  await writeJson(state.files.oppositions, state.oppositions);
  await writeJson(state.files.ledger, state.ledger);
  console.log(JSON.stringify({ result: "prepared", id: record.id, status: record.status, draftSha256: draftHash }, null, 2));
}

async function reviseDraft(options) {
  const id = required(options, "id");
  const draftPath = path.resolve(required(options, "draft"));
  const state = await loadWorkspace(options);
  const prospect = state.prospects.prospects.find((entry) => entry.id === id);
  if (!prospect) fail(`Prospect introuvable : ${id}`);
  if (prospect.status === "sent") fail("Impossible de réviser un message déjà marqué envoyé");
  if (prospect.status === "opposed" || findOpposition(prospect, state.oppositions)) {
    fail("Impossible de réviser le brouillon d'un prospect opposé");
  }
  const draft = await fs.readFile(draftPath, "utf8");
  if (!draft.trim()) fail("Le brouillon est vide");
  const draftHash = sha256(draft);
  const subjectLine = draft.split(/\r?\n/).find((line) => line.toLocaleLowerCase("fr").startsWith("objet :"));
  prospect.draft = {
    path: path.relative(state.files.root, draftPath),
    sha256: draftHash,
    subject: subjectLine?.replace(/^objet\s*:\s*/i, "") ?? "",
  };
  prospect.status = "draft_prepared_pending_validation";
  delete prospect.approval;
  prospect.updatedAt = new Date().toISOString();
  await writeJson(state.files.prospects, state.prospects);
  console.log(JSON.stringify({ result: "draft_revised", id, status: prospect.status, draftSha256: draftHash }, null, 2));
}

async function recordOpposition(options) {
  const email = options.email ? normalizeEmail(options.email) : "";
  const domain = options.domain ? normalizeDomain(options.domain) : "";
  if ((email ? 1 : 0) + (domain ? 1 : 0) !== 1) fail("Fournir exactement --email ou --domain");
  const kind = email ? "email" : "domain";
  const normalized = email || domain;
  if (kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) fail("E-mail invalide");
  if (kind === "domain" && !normalized.includes(".")) fail("Domaine invalide");
  const source = required(options, "source");
  const state = await loadWorkspace(options);
  const hash = sha256(normalized);
  const existing = state.oppositions.entries.find((entry) => entry.kind === kind && entry.sha256 === hash);
  if (!existing) {
    const recordedAt = new Date().toISOString();
    const reviewAfterDate = new Date(recordedAt);
    reviewAfterDate.setUTCFullYear(reviewAfterDate.getUTCFullYear() + 3);
    state.oppositions.entries.push({ kind, sha256: hash, recordedAt, source, reviewAfter: reviewAfterDate.toISOString() });
  }
  for (const prospect of state.prospects.prospects) {
    const value = kind === "email" ? normalizeEmail(prospect.contact?.email) : normalizeDomain(prospect.company?.domain);
    if (sha256(value) === hash) {
      prospect.status = "opposed";
      delete prospect.approval;
      prospect.updatedAt = new Date().toISOString();
    }
  }
  await writeJson(state.files.oppositions, state.oppositions);
  await writeJson(state.files.prospects, state.prospects);
  console.log(JSON.stringify({ result: existing ? "already_recorded" : "recorded", kind, sha256: hash }, null, 2));
}

async function preflightState(options) {
  const id = required(options, "id");
  const draftPath = path.resolve(required(options, "draft"));
  const approvalPath = path.resolve(required(options, "approval"));
  const state = await loadWorkspace(options);
  const prospect = state.prospects.prospects.find((entry) => entry.id === id);
  if (!prospect) fail(`Prospect introuvable : ${id}`);
  if (prospect.status === "opposed" || findOpposition(prospect, state.oppositions)) fail("Prospect opposé");
  if (prospect.status === "sent") fail("Prospect déjà marqué envoyé");
  const draftHash = sha256(await fs.readFile(draftPath, "utf8"));
  if (prospect.draft?.sha256 !== draftHash) fail("Le brouillon ne correspond pas au registre");
  let approval;
  try {
    approval = JSON.parse(await fs.readFile(approvalPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") fail("Validation humaine absente : préflight refusé");
    fail(`Fichier de validation illisible : ${error.message}`);
  }
  validateApproval(approval, prospect, draftHash);
  const targetTimestamp = options["sent-at"] ?? new Date().toISOString();
  const local = localDateParts(targetTimestamp);
  if (new Set(["Sat", "Sun"]).has(local.weekday)) fail("Aucun envoi le week-end");
  const dayEntries = state.ledger.days[local.date] ?? [];
  if (dayEntries.length >= MAX_DAILY_SENDS) fail(`Limite de ${MAX_DAILY_SENDS} e-mails atteinte pour ${local.date}`);
  return { state, prospect, approval, draftHash, targetTimestamp, local, dayEntries };
}

async function preflight(options) {
  const result = await preflightState(options);
  console.log(JSON.stringify({
    result: "preflight_ok_no_send_performed",
    id: result.prospect.id,
    localDate: result.local.date,
    sentCount: result.dayEntries.length,
    remainingCapacity: MAX_DAILY_SENDS - result.dayEntries.length,
  }, null, 2));
}

async function markSent(options) {
  required(options, "sent-at");
  const result = await preflightState(options);
  result.state.ledger.days[result.local.date] = [
    ...result.dayEntries,
    {
      prospectId: result.prospect.id,
      sentAt: result.targetTimestamp,
      draftSha256: result.draftHash,
      approvedBy: result.approval.approvedBy,
    },
  ];
  result.prospect.approval = result.approval;
  result.prospect.sentAt = result.targetTimestamp;
  result.prospect.status = "sent";
  result.prospect.updatedAt = new Date().toISOString();
  await writeJson(result.state.files.ledger, result.state.ledger);
  await writeJson(result.state.files.prospects, result.state.prospects);
  console.log(JSON.stringify({ result: "external_send_recorded", id: result.prospect.id, localDate: result.local.date }, null, 2));
}

async function audit(options) {
  const state = await loadWorkspace(options);
  const errors = [];
  const seen = { siren: new Set(), domain: new Set(), email: new Set() };
  for (const prospect of state.prospects.prospects) {
    try {
      validateCandidate(prospect);
    } catch (error) {
      errors.push(`${prospect.id}: ${error.message}`);
    }
    for (const [kind, value] of [
      ["siren", normalizeSiren(prospect.company?.siren)],
      ["domain", normalizeDomain(prospect.company?.domain)],
      ["email", normalizeEmail(prospect.contact?.email)],
    ]) {
      if (seen[kind].has(value)) errors.push(`${prospect.id}: doublon ${kind}`);
      seen[kind].add(value);
    }
    if (findOpposition(prospect, state.oppositions) && prospect.status !== "opposed") {
      errors.push(`${prospect.id}: opposition non répercutée`);
    }
  }
  for (const [date, entries] of Object.entries(state.ledger.days)) {
    if (entries.length > MAX_DAILY_SENDS) errors.push(`${date}: ${entries.length} envois`);
    const local = localDateParts(`${date}T12:00:00+02:00`);
    if (new Set(["Sat", "Sun"]).has(local.weekday) && entries.length > 0) errors.push(`${date}: envoi le week-end`);
  }
  const today = localDateParts(new Date().toISOString()).date;
  const sentToday = (state.ledger.days[today] ?? []).length;
  const summary = {
    result: errors.length ? "audit_failed" : "audit_ok",
    prospects: state.prospects.prospects.length,
    pendingValidation: state.prospects.prospects.filter((entry) => entry.status === "draft_prepared_pending_validation").length,
    oppositions: state.oppositions.entries.length,
    sentToday,
    remainingCapacityToday: Math.max(0, MAX_DAILY_SENDS - sentToday),
    errors,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (errors.length) process.exitCode = 2;
}

try {
  const { command, options } = parseArgs(process.argv.slice(2));
  switch (command) {
    case "prepare":
      await prepare(options);
      break;
    case "record-opposition":
      await recordOpposition(options);
      break;
    case "revise-draft":
      await reviseDraft(options);
      break;
    case "preflight":
      await preflight(options);
      break;
    case "mark-sent":
      await markSent(options);
      break;
    case "audit":
      await audit(options);
      break;
    default:
      fail("Commande attendue : prepare, revise-draft, record-opposition, preflight, mark-sent ou audit");
  }
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = error.exitCode ?? 1;
}
