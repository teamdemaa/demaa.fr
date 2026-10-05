import "server-only";
import { encodePublication, decodePublication } from "@/lib/publication-storage.server";
import { randomUUID } from "node:crypto";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { publicationEmail } from "@/lib/publication-email";
import { publicationRef, initialPublication, publicationVersion, PublicationConflict } from "@/lib/publications.server";
import { publicationSlot, type Newsletter } from "@/lib/publication-contract";
import { sendTransactionalEmail } from "@/lib/transactional-email.server";

async function resend<T>(path: string, body?: unknown, method?: "PATCH"): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Resend n’est pas configuré.");
  const response = await fetch(`https://api.resend.com${path}`, { method: method ?? (body === undefined ? "GET" : "POST"), headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Resend refuse cette opération (${response.status}). Vérifie le tableau de bord Resend.`);
  return response.json() as Promise<T>;
}
export function newsletterReady() { return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL && process.env.RESEND_NEWSLETTER_SEGMENT_ID); }

export async function runPublicationNewsletter(project: string, number: number, action: "test" | "prepare" | "send", actorEmail: string, confirmation?: string) {
  const slot = publicationSlot(project, number);
  const ref = publicationRef(slot.id);
  if (!newsletterReady()) throw new Error("Le segment Apprentissages doit être configuré dans Resend avant de continuer.");
  if (action === "test") {
    const snap = await ref.get();
    const record = snap.exists ? decodePublication(slot.id, snap.data()!) : initialPublication(project, number);
    if (!record.published) throw new PublicationConflict("Publie l’article avant de tester sa newsletter.");
    const version = publicationVersion(record.published);
    const message = publicationEmail(record.published, true);
    await sendTransactionalEmail({ ...message, subject: `[TEST] ${message.subject}`, to: actorEmail, replyTo: "team@demaa.fr", idempotencyKey: `publication-test-${slot.id}-${randomUUID()}` });
    await getAdminFirestore().runTransaction(async tx => {
      const current = await tx.get(ref);
      const latest = current.exists ? decodePublication(slot.id, current.data()!) : record;
      if (!latest.published || publicationVersion(latest.published) !== version) throw new PublicationConflict("Article modifié pendant le test. Refais un envoi test.");
      tx.set(ref, encodePublication({ ...latest, newsletter: { ...(latest.newsletter ?? { status: "prepared" }), version: latest.newsletter?.version ?? version, testedVersion: version, testedAt: new Date().toISOString() } }));
    });
    return `E-mail de test envoyé à ${actorEmail}.`;
  }
  if (action === "send" && confirmation !== slot.id) throw new PublicationConflict("Confirme l’envoi aux abonnés avant de continuer.");
  const record = await getAdminFirestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    const current = snap.exists ? decodePublication(slot.id, snap.data()!) : initialPublication(project, number);
    if (!current.published) throw new PublicationConflict("Cet article n’est pas publié.");
    const version = publicationVersion(current.published);
    const news = current.newsletter;
    if (news && ["preparing", "sending", "sent", "uncertain"].includes(news.status)) throw new PublicationConflict("Newsletter déjà envoyée ou opération en cours. Vérifie Resend avant toute nouvelle tentative.");
    if (action === "send" && (!news?.broadcastId || news.version !== version || news.testedVersion !== version)) throw new PublicationConflict("Prépare la newsletter et envoie un test de la version publiée avant l’envoi aux abonnés.");
    const newsletter: Newsletter = { ...news, version, status: action === "prepare" ? "preparing" : "sending" };
    tx.set(ref, encodePublication({ ...current, newsletter }));
    return { ...current, newsletter };
  });
  try {
    if (action === "prepare") {
      const message = publicationEmail(record.published!);
      if (record.newsletter.broadcastId) {
        const remote = await resend<{ status: string }>(`/broadcasts/${record.newsletter.broadcastId}`);
        if (remote.status !== "draft") throw new Error("Cette newsletter a déjà quitté le statut brouillon dans Resend.");
        await resend(`/broadcasts/${record.newsletter.broadcastId}`, { subject: message.subject, html: message.html, text: message.text }, "PATCH");
        await updateNewsletter(slot.id, { ...record.newsletter, status: "prepared" });
        return "Brouillon Resend actualisé. Aucun e-mail envoyé aux abonnés.";
      }
      const created = await resend<{ id: string }>("/broadcasts", { segment_id: process.env.RESEND_NEWSLETTER_SEGMENT_ID, from: process.env.RESEND_FROM_EMAIL, reply_to: "team@demaa.fr", subject: message.subject, html: message.html, text: message.text, name: `DEMAA ${slot.id} ${record.newsletter.version.slice(0, 12)}`, send: false });
      await updateNewsletter(slot.id, { ...record.newsletter, status: "prepared", broadcastId: created.id });
      return "Brouillon créé dans Resend. Aucun e-mail envoyé aux abonnés.";
    }
    const remote = await resend<{ status: string; subject: string; html: string; text?: string; segment_id?: string }>(`/broadcasts/${record.newsletter.broadcastId}`);
    const expected = publicationEmail(record.published!);
    if (remote.status !== "draft" || remote.subject !== expected.subject || remote.html !== expected.html || remote.segment_id !== process.env.RESEND_NEWSLETTER_SEGMENT_ID) throw new Error("Le brouillon Resend a changé ou a déjà été envoyé. Vérifie Resend.");
    await resend(`/broadcasts/${record.newsletter.broadcastId}/send`, {});
    await updateNewsletter(slot.id, { ...record.newsletter, status: "sent" });
    return "Envoi confié à Resend. La livraison se suit dans Resend.";
  } catch (error) {
    // A network timeout may occur after Resend accepted the request. Never retry automatically.
    await updateNewsletter(slot.id, { ...record.newsletter, status: "uncertain" }).catch(() => undefined);
    throw error;
  }
}

async function updateNewsletter(id: string, newsletter: Newsletter) {
  const ref = publicationRef(id);
  await getAdminFirestore().runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Publication missing.");
    const current = decodePublication(id, snap.data()!);
    tx.set(ref, encodePublication({ ...current, newsletter }));
  });
}
