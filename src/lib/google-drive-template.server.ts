import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import type { DriveFolderNode } from "@/lib/drive-folder-templates";
import { getTrustedRequestOrigin } from "@/lib/site-url";

export const GOOGLE_DRIVE_TEMPLATE_COOKIE = "demaa_drive_template_oauth";
export const GOOGLE_DRIVE_TEMPLATE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const OAUTH_TTL_MS = 10 * 60 * 1000;
const DRIVE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";

export type GoogleDriveTemplateRequest = Readonly<{
  issuedAt: number;
  nonce: string;
  redirectUri: string;
  rootName: string;
  sectionIds: readonly string[];
  year: number;
}>;

type GoogleDriveOAuthConfig = Readonly<{
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  stateSecret: string;
}>;

type CreatedDriveFolder = Readonly<{
  id: string;
  name: string;
}>;

function readConfiguredValue(name: string) {
  return process.env[name]?.trim() || null;
}

export function isGoogleDriveTemplateConfigured() {
  const stateSecret = readConfiguredValue("GOOGLE_DRIVE_OAUTH_STATE_SECRET");
  return Boolean(
    readConfiguredValue("GOOGLE_DRIVE_CLIENT_ID")
    && readConfiguredValue("GOOGLE_DRIVE_CLIENT_SECRET")
    && stateSecret
    && stateSecret.length >= 32,
  );
}

export function getGoogleDriveOAuthConfig(request: Request): GoogleDriveOAuthConfig | null {
  const clientId = readConfiguredValue("GOOGLE_DRIVE_CLIENT_ID");
  const clientSecret = readConfiguredValue("GOOGLE_DRIVE_CLIENT_SECRET");
  const stateSecret = readConfiguredValue("GOOGLE_DRIVE_OAUTH_STATE_SECRET");
  if (!clientId || !clientSecret || !stateSecret || stateSecret.length < 32) return null;

  const configuredRedirectUri = readConfiguredValue("GOOGLE_DRIVE_REDIRECT_URI");
  const redirectUri = configuredRedirectUri || new URL(
    "/api/modeles/structure-google-drive-entreprise/drive/callback",
    getTrustedRequestOrigin(request),
  ).toString();

  return { clientId, clientSecret, redirectUri, stateSecret };
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createGoogleDriveTemplateState(
  input: Omit<GoogleDriveTemplateRequest, "issuedAt" | "nonce">,
  stateSecret: string,
) {
  const request: GoogleDriveTemplateRequest = {
    ...input,
    issuedAt: Date.now(),
    nonce: randomBytes(24).toString("base64url"),
  };
  const payload = Buffer.from(JSON.stringify(request), "utf8").toString("base64url");
  return {
    cookieValue: `${payload}.${signPayload(payload, stateSecret)}`,
    request,
  };
}

export function readGoogleDriveTemplateState(
  cookieValue: string | null | undefined,
  stateSecret: string,
  now = Date.now(),
) {
  if (!cookieValue) return null;
  const [payload, signature, extra] = cookieValue.split(".");
  if (!payload || !signature || extra) return null;

  const expectedSignature = signPayload(payload, stateSecret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    actualBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(actualBuffer, expectedBuffer)
  ) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<GoogleDriveTemplateRequest>;
    if (
      typeof value.issuedAt !== "number"
      || now - value.issuedAt < 0
      || now - value.issuedAt > OAUTH_TTL_MS
      || typeof value.nonce !== "string"
      || !/^[A-Za-z0-9_-]{20,80}$/.test(value.nonce)
      || typeof value.redirectUri !== "string"
      || typeof value.rootName !== "string"
      || !Array.isArray(value.sectionIds)
      || !value.sectionIds.every((id) => typeof id === "string")
      || typeof value.year !== "number"
    ) return null;

    return value as GoogleDriveTemplateRequest;
  } catch {
    return null;
  }
}

export function matchesGoogleDriveTemplateNonce(expected: string, actual: string | null) {
  if (!actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length
    && timingSafeEqual(expectedBuffer, actualBuffer);
}

function createOAuthClient(config: GoogleDriveOAuthConfig) {
  return new OAuth2Client({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });
}

export function buildGoogleDriveAuthorizationUrl(
  config: GoogleDriveOAuthConfig,
  state: string,
) {
  return createOAuthClient(config).generateAuthUrl({
    access_type: "online",
    include_granted_scopes: true,
    prompt: "consent",
    scope: [GOOGLE_DRIVE_TEMPLATE_SCOPE],
    state,
  });
}

export async function exchangeGoogleDriveAuthorizationCode(
  config: GoogleDriveOAuthConfig,
  code: string,
) {
  const { tokens } = await createOAuthClient(config).getToken(code);
  return tokens.access_token || null;
}

export function sanitizeDriveFolderName(value: string, fallback = "Mon entreprise") {
  const normalized = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return normalized || fallback;
}

async function createDriveFolder(
  accessToken: string,
  name: string,
  parentId: string,
): Promise<CreatedDriveFolder> {
  const url = new URL(DRIVE_API_URL);
  url.searchParams.set("fields", "id,name");
  url.searchParams.set("supportsAllDrives", "true");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      mimeType: DRIVE_FOLDER_MIME_TYPE,
      name: sanitizeDriveFolderName(name),
      parents: [parentId],
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Google Drive folder creation failed with status ${response.status}`);
  }

  const payload = await response.json() as Partial<CreatedDriveFolder>;
  if (!payload.id || !payload.name) {
    throw new Error("Google Drive returned an invalid folder response");
  }
  return { id: payload.id, name: payload.name };
}

async function mapWithConcurrency<T, R>(
  values: readonly T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let cursor = 0;

  async function runWorker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(values[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => runWorker()),
  );
  return results;
}

async function deleteCreatedRoot(accessToken: string, rootId: string) {
  const url = new URL(`${DRIVE_API_URL}/${encodeURIComponent(rootId)}`);
  url.searchParams.set("supportsAllDrives", "true");
  await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => null);
}

export async function createGoogleDriveFolderStructure(input: {
  accessToken: string;
  rootName: string;
  sections: readonly DriveFolderNode[];
}) {
  const root = await createDriveFolder(
    input.accessToken,
    sanitizeDriveFolderName(input.rootName),
    "root",
  );

  type PendingFolder = Readonly<{ node: DriveFolderNode; parentId: string }>;
  let pending: readonly PendingFolder[] = input.sections.map((node) => ({
    node,
    parentId: root.id,
  }));
  let createdCount = 1;

  try {
    while (pending.length > 0) {
      const created = await mapWithConcurrency(pending, 5, async ({ node, parentId }) => ({
        folder: await createDriveFolder(input.accessToken, node.name, parentId),
        node,
      }));
      createdCount += created.length;
      pending = created.flatMap(({ folder: createdFolder, node }) => (
        node.children?.map((child) => ({ node: child, parentId: createdFolder.id })) ?? []
      ));
    }
  } catch (error) {
    await deleteCreatedRoot(input.accessToken, root.id);
    throw error;
  }

  return {
    createdCount,
    rootId: root.id,
    webUrl: `https://drive.google.com/drive/folders/${encodeURIComponent(root.id)}`,
  };
}

export function getGoogleDriveTemplateCookieOptions() {
  return {
    httpOnly: true,
    maxAge: OAUTH_TTL_MS / 1000,
    path: "/api/modeles/structure-google-drive-entreprise/drive",
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production"
      || process.env.VERCEL_ENV === "preview"
      || process.env.VERCEL_ENV === "production",
  };
}
