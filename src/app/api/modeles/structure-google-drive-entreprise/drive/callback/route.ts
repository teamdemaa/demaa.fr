import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-security";
import {
  buildCompanyDriveFolderTemplate,
  selectDriveFolderSections,
} from "@/lib/drive-folder-templates";
import {
  createGoogleDriveFolderStructure,
  exchangeGoogleDriveAuthorizationCode,
  getGoogleDriveOAuthConfig,
  getGoogleDriveTemplateCookieOptions,
  GOOGLE_DRIVE_TEMPLATE_COOKIE,
  matchesGoogleDriveTemplateNonce,
  readGoogleDriveTemplateState,
} from "@/lib/google-drive-template.server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function modelRedirect(request: Request, errorCode: string) {
  const url = new URL("/modeles/structure-google-drive-entreprise", request.url);
  url.searchParams.set("drive", errorCode);
  const response = NextResponse.redirect(url, 303);
  response.cookies.set(GOOGLE_DRIVE_TEMPLATE_COOKIE, "", {
    ...getGoogleDriveTemplateCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function GET(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "google-drive-template-callback",
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (limited) return limited;

  const config = getGoogleDriveOAuthConfig(request);
  if (!config) return modelRedirect(request, "configuration");

  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get("error")) {
    return modelRedirect(request, "access_denied");
  }

  const cookieValue = (await cookies()).get(GOOGLE_DRIVE_TEMPLATE_COOKIE)?.value;
  const stateRequest = readGoogleDriveTemplateState(cookieValue, config.stateSecret);
  const state = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code")?.trim() || "";
  if (
    !stateRequest
    || stateRequest.redirectUri !== config.redirectUri
    || !matchesGoogleDriveTemplateNonce(stateRequest.nonce, state)
    || code.length < 8
    || code.length > 4096
  ) {
    return modelRedirect(request, "expired");
  }

  try {
    const accessToken = await exchangeGoogleDriveAuthorizationCode(config, code);
    if (!accessToken) return modelRedirect(request, "access_denied");

    const template = buildCompanyDriveFolderTemplate(stateRequest.year);
    const sections = selectDriveFolderSections(template, stateRequest.sectionIds);
    if (sections.length === 0) return modelRedirect(request, "expired");

    const result = await createGoogleDriveFolderStructure({
      accessToken,
      rootName: stateRequest.rootName,
      sections,
    });
    logOperationalEvent("google_drive_template.created", {
      createdCount: result.createdCount,
      template: template.slug,
    });

    const response = NextResponse.redirect(result.webUrl, 303);
    response.cookies.set(GOOGLE_DRIVE_TEMPLATE_COOKIE, "", {
      ...getGoogleDriveTemplateCookieOptions(),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    logOperationalError("google_drive_template.creation_failed", error, {
      template: "structure-google-drive-entreprise",
    });
    return modelRedirect(request, "creation");
  }
}
