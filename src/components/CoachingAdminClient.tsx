"use client";

import { LoaderCircle, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import type {
  CoachingConversationSummary,
  CoachingMessage,
} from "@/lib/coaching-conversation";

type Conversation = Readonly<{
  customerEmail: string;
  id: string;
  messages: readonly CoachingMessage[];
}>;

const coachingAdminDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function CoachingAdminClient() {
  const [secret, setSecret] = useState("");
  const [conversations, setConversations] = useState<CoachingConversationSummary[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function request(path: string, init: RequestInit = {}) {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-demaa-admin-secret": secret,
        ...init.headers,
      },
    });
    const payload = await response.json().catch(() => null) as {
      conversation?: Conversation;
      conversations?: CoachingConversationSummary[];
      error?: string;
      message?: CoachingMessage;
    } | null;
    if (!response.ok) throw new Error(payload?.error ?? "Une erreur est survenue.");
    return payload;
  }

  async function loadConversations() {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching");
      setConversations(payload?.conversations ?? []);
      setIsUnlocked(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Accès refusé.");
    } finally {
      setIsLoading(false);
    }
  }

  async function selectConversation(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request(`/api/admin/coaching?conversationId=${encodeURIComponent(id)}`);
      setSelected(payload?.conversation ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || reply.trim().length < 2) return;
    setIsLoading(true);
    setError(null);
    try {
      const payload = await request("/api/admin/coaching", {
        method: "POST",
        body: JSON.stringify({ conversationId: selected.id, message: reply }),
      });
      if (payload?.message) {
        setSelected((current) => current
          ? { ...current, messages: [...current.messages, payload.message as CoachingMessage] }
          : current);
      }
      setReply("");
      await loadConversations();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Envoi impossible.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isUnlocked) {
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-[1.2rem] border border-dema-line bg-white p-6">
        <label className="block space-y-2 text-sm text-brand-blue">
          <span>Clé d’administration</span>
          <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className="w-full rounded-xl border border-dema-line px-4 py-3 outline-none focus:border-dema-forest" />
        </label>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        <button type="button" onClick={loadConversations} disabled={isLoading || !secret} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white disabled:opacity-60">
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Ouvrir
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid min-h-[36rem] overflow-hidden rounded-[1.3rem] border border-dema-line bg-white lg:grid-cols-[20rem_1fr]">
      <aside className="border-b border-dema-line lg:border-b-0 lg:border-r">
        <div className="border-b border-dema-line px-5 py-4">
          <h2 className="font-medium text-brand-blue">Conversations</h2>
        </div>
        <div className="max-h-[34rem] overflow-y-auto p-2">
          {conversations.length === 0 ? <p className="px-3 py-6 text-sm text-dema-muted">Aucune conversation.</p> : null}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => selectConversation(conversation.id)}
              className={`w-full rounded-xl px-3 py-3 text-left transition hover:bg-dema-sage/35 ${selected?.id === conversation.id ? "bg-dema-sage/55" : ""}`}
            >
              <span className="block truncate text-sm font-medium text-brand-blue">{conversation.customerEmail}</span>
              <span className="mt-1 block truncate text-xs text-dema-muted">{conversation.lastMessage}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[32rem] flex-col">
        {selected ? (
          <>
            <header className="border-b border-dema-line px-5 py-4">
              <h2 className="font-medium text-brand-blue">{selected.customerEmail}</h2>
            </header>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-dema-sage/15 p-5">
              {selected.messages.map((message) => (
                <article key={message.id} className={`max-w-[82%] rounded-[1rem] px-4 py-3 text-sm leading-relaxed ${message.author === "specialist" ? "ml-auto bg-dema-forest text-white" : "mr-auto border border-dema-line bg-white text-brand-blue"}`}>
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={`mt-1 text-[0.68rem] ${message.author === "specialist" ? "text-white/70" : "text-dema-muted"}`}>
                    {message.author === "specialist" ? "Spécialiste" : "Client"} · {coachingAdminDateFormatter.format(new Date(message.createdAt))}
                  </p>
                </article>
              ))}
            </div>
            <form onSubmit={submitReply} className="border-t border-dema-line p-4">
              <div className="flex items-end gap-2 rounded-xl border border-dema-line p-2 focus-within:border-dema-forest">
                <textarea aria-label="Réponse" value={reply} onChange={(event) => setReply(event.target.value)} rows={2} placeholder="Répondre…" className="min-h-11 flex-1 resize-none px-2 py-2 text-sm outline-none" />
                <button disabled={isLoading || reply.trim().length < 2} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-forest text-white disabled:opacity-40" aria-label="Envoyer la réponse">
                  {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
            </form>
          </>
        ) : (
          <p className="m-auto text-sm text-dema-muted">Sélectionnez une conversation.</p>
        )}
      </section>
    </div>
  );
}
