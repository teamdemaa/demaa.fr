"use client";
import Link from "next/link";
import { useState } from "react";
import { PROJECTS, EPISODE_TITLES, articleParagraphs, type PublicationRecord, type ArticleDraft } from "@/lib/publication-contract";

export default function PublicationAdminClient({ initial, newsletterConfigured }: { initial: PublicationRecord[]; newsletterConfigured: boolean }) {
  const [records, setRecords] = useState(initial);
  const [selected, setSelected] = useState("jago-0");
  const record = records.find(r => r.id === selected)!;
  const [draft, setDraft] = useState<ArticleDraft>(record.draft);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [configured, setConfigured] = useState(newsletterConfigured);
  const dirty = JSON.stringify(draft) !== JSON.stringify(record.draft);
  const news = record.newsletter;

  function select(id: string) {
    if (dirty && !window.confirm("Quitter cet épisode sans enregistrer les modifications ?")) return;
    setSelected(id); setDraft(records.find(r => r.id === id)!.draft); setError(""); setMessage(""); setConfirmSend(false); setConfirmation(""); setPreview(false);
  }
  async function request(action: string, current = record) {
    const response = await fetch("/api/admin/publications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ project: current.project, number: current.number, revision: current.revision, action, ...(action === "save" ? { draft } : {}), ...(action === "send" ? { confirmation } : {}) }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Opération indisponible.");
    setRecords(payload.publications); setConfigured(payload.newsletterReady); setMessage(payload.message);
    return (payload.publications as PublicationRecord[]).find(r => r.id === selected)!;
  }
  async function act(action: string) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      let current = record;
      if (action === "publish" && dirty) current = await request("save");
      const updated = await request(action, current);
      setDraft(updated.draft); setConfirmSend(false); setConfirmation("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Opération indisponible."); }
    finally { setBusy(false); }
  }
  const input = "mt-2 w-full rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-base text-brand-blue";
  const button = "min-h-11 rounded-full border border-dema-line px-5 py-2 text-sm disabled:opacity-40";
  return <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
    <nav aria-label="Épisodes à éditer" className="space-y-6">{PROJECTS.map(project => <div key={project}><h2 className="mb-2 text-lg capitalize">{project}</h2><ul className="space-y-1">{records.filter(r => r.project === project).map(r => <li key={r.id}><button disabled={busy} onClick={() => select(r.id)} aria-current={selected === r.id ? "page" : undefined} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selected === r.id ? "bg-dema-sage font-medium" : "hover:bg-dema-sage/40"}`}>EP{String(r.number).padStart(2, "0")} · {EPISODE_TITLES[r.number]}<span className="block text-xs text-dema-muted">{r.published ? "Publié" : "Brouillon"}</span></button></li>)}</ul></div>)}</nav>
    <section className="min-w-0" aria-label="Éditeur de publication" aria-busy={busy}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl capitalize">{record.project} · EP{String(record.number).padStart(2, "0")}</h2><button className={button} onClick={() => setPreview(!preview)}>{preview ? "Modifier" : "Aperçu"}</button></div>
      <p className="mt-2 text-sm text-dema-muted">{record.published ? "Une version est en ligne. Les modifications restent en brouillon jusqu’à publication." : "Cet épisode n’est pas encore publié."}</p>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg bg-dema-sage p-3 text-sm">{message}</p>}
      {preview ? <article className="my-8 rounded-2xl bg-dema-paper p-6 sm:p-8"><p className="text-xs uppercase tracking-widest text-dema-muted">{record.project} · EP{String(record.number).padStart(2, "0")}</p><h1 className="demaa-section-title mt-5 text-4xl leading-tight">{draft.title}</h1><div className="mt-8 space-y-6 text-base leading-8">{articleParagraphs(draft.text).map((p, i) => <p key={i}>{p}</p>)}</div></article> : <fieldset disabled={busy} className="mt-6 space-y-5"><label className="block text-sm">Titre<input className={input} maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label><label className="block text-sm">Résumé pour Google et les partages<textarea className={input} rows={2} maxLength={320} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label><label className="block text-sm">Texte<textarea className={`${input} min-h-[380px] leading-7`} rows={16} maxLength={50000} value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} /><span className="mt-2 block text-xs text-dema-muted">Une ligne vide entre les paragraphes. Le texte est affiché tel quel.</span></label></fieldset>}
      <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={busy || !dirty} onClick={() => act("save")}>Enregistrer le brouillon</button><button className={`${button} bg-brand-blue text-dema-paper`} disabled={busy} onClick={() => act("publish")}>{record.published ? "Mettre à jour sur le site" : "Publier sur le site"}</button>{record.published && <><Link className={button} href={`/tutoriels/${record.project}/${record.published.slug}`} target="_blank">Voir l’article ↗</Link><button className={button} disabled={busy} onClick={() => { if (window.confirm("Retirer l’article du site ? Son contenu reste conservé.")) act("unpublish"); }}>Retirer du site</button></>}</div>
      <section className="mt-10 border-t border-dema-line pt-6" aria-label="Newsletter"><h3 className="text-xl">Newsletter</h3><p className="mt-2 text-sm text-dema-muted">L’e-mail reprend la version publiée. Publier sur le site n’envoie aucun e-mail.</p>{!configured && <p className="mt-3 text-sm">La connexion au segment Apprentissages est à configurer.</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button className={button} disabled={busy || !configured || !record.published} onClick={() => act("test")}>M’envoyer un test</button><button className={button} disabled={busy || !configured || !record.published || ["preparing", "sending", "sent", "uncertain"].includes(news?.status ?? "")} onClick={() => act("prepare")}>{news?.broadcastId ? "Actualiser le brouillon Resend" : "Préparer dans Resend"}</button><a className={button} href="https://resend.com/broadcasts" target="_blank" rel="noopener noreferrer">Ouvrir Resend ↗</a><button className={`${button} bg-brand-blue text-dema-paper`} disabled={busy || !configured || !news?.broadcastId || news.status !== "prepared" || !news.testedAt || dirty || !record.published} onClick={() => setConfirmSend(true)}>Envoyer aux abonnés</button></div>
        {news?.broadcastId && <p className="mt-3 text-xs text-dema-muted">Brouillon Resend : {news.broadcastId}</p>}
        {news?.testedAt && <p className="mt-2 text-xs text-dema-muted">Dernier test : {new Date(news.testedAt).toLocaleString("fr-FR")}</p>}
        {news?.status === "sent" && <p className="mt-3 text-sm">Envoi confié à Resend. Un second envoi de cet épisode est bloqué.</p>}
        {news && ["preparing", "sending", "uncertain"].includes(news.status) && <p className="mt-3 text-sm">Opération en cours ou résultat à vérifier dans Resend. Aucun nouvel envoi automatique.</p>}
        {confirmSend && <div className="mt-5 rounded-xl border border-dema-line bg-dema-paper p-5"><p className="text-sm">Cet e-mail sera envoyé aux abonnés du segment Apprentissages. Vérifie ton e-mail test, puis saisis <strong>{record.id}</strong> pour confirmer.</p><label className="mt-3 block text-sm">Confirmation<input className={input} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label><div className="mt-4 flex gap-3"><button className={`${button} bg-brand-blue text-dema-paper`} disabled={busy || confirmation !== record.id} onClick={() => act("send")}>Confirmer l’envoi</button><button className={button} onClick={() => setConfirmSend(false)}>Annuler</button></div></div>}
      </section>
    </section>
  </div>;
}
