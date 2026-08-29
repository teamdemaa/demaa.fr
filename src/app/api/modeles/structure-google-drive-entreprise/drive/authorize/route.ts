import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import {
  buildCompanyDriveFolderTemplate,
  selectDriveFolderSections,
} from "@/lib/drive-folder-templates";
import {
  buildGoogleDriveAuthorizationUrl,
  createGoogleDriveTemplateState,
  getGoogleDriveOAuthConfig,
  getGoogleDriveTemplateCookieOptions,
  GOOGLE_DRIVE_TEMPLATE_COOKIE,
  sanitizeDriveFolderName,
} from "@/lib/google-drive-template.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "google-drive-template-authorize",
    limit: 12,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const config = getGoogleDriveOAuthConfig(request);
  if (!config) {
    return NextResponse.json(
      { error: "La connexion Google Drive n’est pas configurée." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const year = Number(formData.get("year"));
  const rootName = sanitizeDriveFolderName(String(formData.get("rootName") || ""));
  const requestedSectionIds = formData.getAll("sectionIds").map(String);
  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    return NextResponse.json({ error: "L’année est invalide." }, { status: 400 });
  }

  const template = buildCompanyDriveFolderTemplate(year);
  const selectedSections = selectDriveFolderSections(template, requestedSectionIds);
  if (selectedSections.length === 0) {
    return NextResponse.json(
      { error: "Sélectionnez au moins un domaine à créer." },
      { status: 400 },
    );
  }

  const { cookieValue, request: stateRequest } = createGoogleDriveTemplateState({
    redirectUri: config.redirectUri,
    rootName,
    sectionIds: selectedSections.map((section) => section.id),
    year,
  }, config.stateSecret);
  const authorizationUrl = buildGoogleDriveAuthorizationUrl(config, stateRequest.nonce);
  const response = NextResponse.redirect(authorizationUrl, 303);
  response.cookies.set(
    GOOGLE_DRIVE_TEMPLATE_COOKIE,
    cookieValue,
    getGoogleDriveTemplateCookieOptions(),
  );
  return response;
}
