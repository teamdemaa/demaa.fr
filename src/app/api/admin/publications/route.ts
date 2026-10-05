import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAdminIdentity } from "@/lib/admin-auth.server";
import { enforceSameOrigin, enforceAllowedHost } from "@/lib/request-guard";
import { readJsonBody, enforceRateLimit } from "@/lib/api-security";
import { changePublication, listPublications, PublicationConflict } from "@/lib/publications.server";
import { newsletterReady, runPublicationNewsletter } from "@/lib/publication-newsletter.server";
import { PROJECTS, publicationSlot } from "@/lib/publication-contract";
import { logOperationalError } from "@/lib/operational-log";

export const runtime = "nodejs";
export const maxDuration = 60;
function json(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } }); }
export async function GET() {
  if (!await getCurrentAdminIdentity()) return json({ error: "Connexion administrateur requise." }, 401);
  try { return json({ publications: await listPublications(), newsletterReady: newsletterReady() }); }
  catch (error) { logOperationalError("publications.list.failed", error); return json({ error: "Lecture des publications indisponible." }, 503); }
}
export async function POST(request: Request) {
  const admin = await getCurrentAdminIdentity();
  if (!admin) return json({ error: "Connexion administrateur requise." }, 401);
  const blocked = enforceAllowedHost(request) ?? enforceSameOrigin(request);
  if (blocked) return blocked;
  const limited = await enforceRateLimit(request, { keyPrefix: "admin-publications", limit: 40, windowMs: 60000 }, admin.uid);
  if (limited) return limited;
  const { data, response } = await readJsonBody<Record<string, unknown>>(request, 220000);
  if (response) return response;
  try {
    const body = z.object({ project: z.enum(PROJECTS), number: z.number().int().min(0).max(5), revision: z.number().int().nonnegative(), action: z.enum(["save", "publish", "unpublish", "test", "prepare", "send"]), draft: z.unknown().optional(), confirmation: z.string().optional() }).parse(data);
    publicationSlot(body.project, body.number);
    let message = "Brouillon enregistré.";
    if (["test", "prepare", "send"].includes(body.action)) message = await runPublicationNewsletter(body.project, body.number, body.action as "test" | "prepare" | "send", admin.email, body.confirmation);
    else {
      await changePublication({ ...body, action: body.action as "save" | "publish" | "unpublish" }, admin.uid);
      message = body.action === "publish" ? "Article publié sur le site. Aucun e-mail envoyé." : body.action === "unpublish" ? "Article retiré du site. Son contenu est conservé." : message;
      revalidatePath(`/tutoriels/${body.project}`);
      revalidatePath(`/tutoriels/${body.project}`, "layout");
      revalidatePath("/sitemap.xml");
    }
    return json({ message, publications: await listPublications(), newsletterReady: newsletterReady() });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "Renseigne un titre, un résumé et un texte valides." }, 400);
    if (error instanceof PublicationConflict) return json({ error: error.message }, 409);
    logOperationalError("publications.change.failed", error);
    return json({ error: "Opération non confirmée. Recharge la page ; pour un envoi, vérifie d’abord Resend avant de réessayer." }, 503);
  }
}
