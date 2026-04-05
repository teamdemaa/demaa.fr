import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

interface LeadRow {
  id: number;
}

interface CacheRow {
  result_json: string;
}

interface CountRow {
  count: number;
}

interface RunResult {
  lastInsertRowid?: number | bigint;
}

interface Statement {
  run: (...params: Array<string | null>) => RunResult;
  get: (...params: Array<string | null>) => LeadRow | CacheRow | CountRow | undefined;
}

interface DatabaseLike {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
}

interface GenerationInput {
  email: string;
  prompt: string;
  result: unknown;
  sector?: string;
}

let databasePromise: Promise<DatabaseLike> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = import("node:sqlite").then(({ DatabaseSync }) => {
      const dataDir = path.join(process.cwd(), "data");
      fs.mkdirSync(dataDir, { recursive: true });

      const database = new DatabaseSync(path.join(dataDir, "demaa.sqlite")) as DatabaseLike;

      database.exec(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL
        );
      `);

      database.exec(`
        CREATE TABLE IF NOT EXISTS generations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          prompt TEXT NOT NULL,
          sector TEXT,
          result_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (lead_id) REFERENCES leads(id)
        );
      `);

      database.exec(`
        CREATE TABLE IF NOT EXISTS assistant_plan_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prompt_key TEXT NOT NULL UNIQUE,
          prompt_text TEXT NOT NULL,
          result_json TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      return database;
    });
  }

  return databasePromise;
}

async function getOrCreateLeadId(email: string) {
  const database = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const existingLead = database
    .prepare("SELECT id FROM leads WHERE email = ?")
    .get(normalizedEmail);

  if (existingLead?.id) {
    return existingLead.id;
  }

  const insertResult = database
    .prepare("INSERT INTO leads (email, created_at) VALUES (?, ?)")
    .run(normalizedEmail, new Date().toISOString());

  return Number(insertResult.lastInsertRowid);
}

export async function saveGeneration(input: GenerationInput) {
  const database = await getDatabase();
  const leadId = await getOrCreateLeadId(input.email);

  database
    .prepare(
      `
        INSERT INTO generations (lead_id, prompt, sector, result_json, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(
      String(leadId),
      input.prompt,
      input.sector?.trim() || null,
      JSON.stringify(input.result),
      new Date().toISOString()
    );
}

export async function getGenerationCountByEmail(email: string) {
  const database = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();
  const countRow = database
    .prepare(
      `
        SELECT COUNT(g.id) AS count
        FROM generations g
        INNER JOIN leads l ON l.id = g.lead_id
        WHERE l.email = ?
      `
    )
    .get(normalizedEmail) as CountRow | undefined;

  return Number(countRow?.count ?? 0);
}

function getPromptKey(prompt: string) {
  return createHash("sha256").update(prompt.trim().toLowerCase()).digest("hex");
}

export async function getCachedAssistantPlan(prompt: string) {
  const database = await getDatabase();
  const cacheRow = database
    .prepare("SELECT result_json FROM assistant_plan_cache WHERE prompt_key = ?")
    .get(getPromptKey(prompt)) as CacheRow | undefined;

  if (!cacheRow?.result_json) {
    return null;
  }

  try {
    return JSON.parse(cacheRow.result_json);
  } catch {
    return null;
  }
}

export async function saveAssistantPlanCache(prompt: string, result: unknown) {
  const database = await getDatabase();
  const now = new Date().toISOString();

  database
    .prepare(
      `
        INSERT INTO assistant_plan_cache (prompt_key, prompt_text, result_json, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(prompt_key) DO UPDATE SET
          prompt_text = excluded.prompt_text,
          result_json = excluded.result_json,
          created_at = excluded.created_at
      `
    )
    .run(getPromptKey(prompt), prompt, JSON.stringify(result), now);
}
