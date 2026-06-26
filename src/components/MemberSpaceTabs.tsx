"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LoaderCircle,
  Send,
  X,
} from "lucide-react";
import { writeServiceCartSlugs } from "@/lib/service-cart";

type MemberRequestPayment = {
  amountTotal: number | null;
  assistantTasks: string | null;
  cartSummary: string | null;
  createdAt: string | null;
  currency: string;
  itemCount: number | null;
  offerLabel: string;
  orderType: string | null;
  paymentStatus: string | null;
  slackNotifiedAt: string | null;
  serviceBrief: string | null;
  serviceBriefSubmittedAt: string | null;
  serviceNames: string[];
  serviceSlugs: string[];
  stripeSessionId: string;
};

type MemberRequest = {
  tasks: string | null;
  whatsappPhone: string | null;
} | null;

type RequestCard = {
  payment: MemberRequestPayment;
  request: MemberRequest;
};

type SavedBriefPayload = {
  brief: string;
  serviceBriefSubmittedAt: string | null;
  slackNotifiedAt: string | null;
};

type MemberSpaceTabsProps = {
  clearPurchasedCart?: boolean;
  requestCards: RequestCard[];
};

function formatDate(value?: string | null) {
  if (!value) return "Date non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date non renseignée";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(amountTotal?: number | null, currency = "eur") {
  if (typeof amountTotal !== "number") return "Montant non renseigné";

  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountTotal / 100);

  return `${formattedAmount} HT`;
}

export default function MemberSpaceTabs({
  clearPurchasedCart = false,
  requestCards,
}: MemberSpaceTabsProps) {
  const [cards, setCards] = useState<RequestCard[]>(requestCards);

  useEffect(() => {
    if (!clearPurchasedCart) return;

    writeServiceCartSlugs([]);
  }, [clearPurchasedCart]);

  return (
    <div className="mt-8">
      <section className="mt-8">
        <SectionHeader
          title="Suivi des demandes"
          description="Le récapitulatif de vos paiements et demandes envoyées à Demaa."
        />
        {cards.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <RequestCardArticle
                key={card.payment.stripeSessionId}
                card={card}
                onBriefSaved={({
                  brief,
                  serviceBriefSubmittedAt,
                  slackNotifiedAt,
                }) => {
                  setCards((current) =>
                    current.map((entry) =>
                      entry.payment.stripeSessionId === card.payment.stripeSessionId
                        ? {
                            ...entry,
                            payment: {
                              ...entry.payment,
                              slackNotifiedAt,
                              serviceBrief: brief,
                              serviceBriefSubmittedAt,
                            },
                          }
                        : entry
                    )
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper p-6 text-sm leading-relaxed text-dema-muted">
            Aucune demande trouvée pour cet email pour le moment.
          </div>
        )}
      </section>
    </div>
  );
}

function RequestCardArticle({
  card,
  onBriefSaved,
}: {
  card: RequestCard;
  onBriefSaved: (payload: SavedBriefPayload) => void;
}) {
  const { payment, request } = card;
  const hasServiceBundle = payment.orderType === "service_bundle";
  const hasServiceBrief = Boolean(payment.serviceBrief);
  const hasTeamNotification = Boolean(payment.slackNotifiedAt);

  return (
    <article className="demaa-card rounded-[1.15rem] p-5">
      <div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {payment.cartSummary || payment.offerLabel}
          </h2>
          <p className="mt-1 text-sm text-dema-muted">
            {formatAmount(payment.amountTotal, payment.currency)} · payé le{" "}
            {formatDate(payment.createdAt)}
          </p>
        </div>
      </div>

      {!request && !hasServiceBundle ? (
        <Link
          href={`/assistant/success?session_id=${encodeURIComponent(payment.stripeSessionId)}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
        >
          Compléter ma demande
        </Link>
      ) : hasServiceBundle && !hasServiceBrief ? (
        <ServiceBriefModalTrigger
          onSaved={onBriefSaved}
          payment={payment}
        />
      ) : hasServiceBundle ? (
        <div className="mt-5 space-y-2">
          <p className="rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
            {hasTeamNotification
              ? "L’équipe Demaa a bien reçu votre brief et revient vers vous."
              : "Brief transmis. Demaa vous tient informé de la suite sur WhatsApp."}
          </p>
          <ServiceBriefModalTrigger
            buttonLabel="Mettre à jour mon brief"
            onSaved={onBriefSaved}
            payment={payment}
          />
        </div>
      ) : (
        <p className="mt-5 rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
          Demaa vous contacte sur WhatsApp sous 24h.
        </p>
      )}
    </article>
  );
}

function ServiceBriefModalTrigger({
  payment,
  onSaved,
  buttonLabel = "Préciser ma demande",
}: {
  payment: MemberRequestPayment;
  onSaved: (payload: SavedBriefPayload) => void;
  buttonLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
      >
        {buttonLabel}
      </button>
      {isOpen ? (
        <ServiceBriefModal
          payment={payment}
          onClose={() => setIsOpen(false)}
          onSaved={(payload) => {
            onSaved(payload);
            setIsOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function ServiceBriefModal({
  payment,
  onClose,
  onSaved,
}: {
  payment: MemberRequestPayment;
  onClose: () => void;
  onSaved: (payload: SavedBriefPayload) => void;
}) {
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceNames = useMemo(
    () => payment.serviceNames.filter(Boolean).join(", "),
    [payment.serviceNames]
  );

  useEffect(() => {
    if (payment.serviceBrief) {
      setBrief(payment.serviceBrief);
    }
  }, [payment.serviceBrief]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!brief.trim()) {
      setError("Merci de préciser votre besoin, vos délais ou les éléments utiles.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/customer-space/service-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: payment.stripeSessionId,
          brief: brief.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            brief?: string;
            error?: string;
            serviceBriefSubmittedAt?: string | null;
            slackNotifiedAt?: string | null;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.error || "Impossible d'enregistrer votre brief pour le moment."
        );
      }

      onSaved({
        brief: payload?.brief || brief.trim(),
        serviceBriefSubmittedAt:
          typeof payload?.serviceBriefSubmittedAt === "string"
            ? payload.serviceBriefSubmittedAt
            : null,
        slackNotifiedAt:
          typeof payload?.slackNotifiedAt === "string" ? payload.slackNotifiedAt : null,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer votre brief pour le moment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-brand-blue/45 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Préciser ma demande"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 shadow-[0_24px_70px_rgba(23,35,29,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Commande Demaa
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
              Préciser votre besoin
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              {serviceNames || payment.cartSummary || payment.offerLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Expliquez le contexte, vos priorités, les documents utiles, l'échéance ou les accès à prévoir..."
            rows={6}
            className="demaa-textarea"
            disabled={isSubmitting}
          />

          {error ? <p className="text-sm text-dema-forest">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                Envoyer le brief
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="demaa-section-title text-3xl tracking-tight text-brand-blue/85">
        {title}
      </h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-dema-muted">
        {description}
      </p>
    </div>
  );
}
