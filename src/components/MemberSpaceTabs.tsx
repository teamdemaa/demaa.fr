"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CircleDashed,
  LoaderCircle,
  MessageCircle,
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
  showPaymentSuccess?: boolean;
};

type MemberTab = "requests";

const tabs = [{ id: "requests", label: "Suivi des demandes" }] as const satisfies readonly {
  id: MemberTab;
  label: string;
}[];

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

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountTotal / 100);
}

function formatDateTime(value?: string | null) {
  if (!value) return "Date non renseignée";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date non renseignée";

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRequestStatus(input: {
  hasAssistantRequest: boolean;
  hasServiceBrief: boolean;
  hasTeamNotification: boolean;
  orderType?: string | null;
  paymentStatus?: string | null;
}) {
  if (input.hasAssistantRequest || input.hasServiceBrief) {
    return {
      label: input.hasTeamNotification
        ? "Prise de contact en cours"
        : input.hasServiceBrief
          ? "Brief reçu"
          : "Demande envoyée",
      className: "bg-dema-sage text-dema-forest",
      icon: BadgeCheck,
    };
  }

  if (input.paymentStatus === "paid") {
    return {
      label:
        input.orderType === "service_bundle" ? "Commande payée" : "Paiement confirmé",
      className: "bg-dema-sage text-dema-forest",
      icon: CircleDashed,
    };
  }

  return {
    label: "En attente",
    className: "bg-dema-sage text-brand-blue/65",
    icon: CircleDashed,
  };
}

export default function MemberSpaceTabs({
  clearPurchasedCart = false,
  requestCards,
  showPaymentSuccess = false,
}: MemberSpaceTabsProps) {
  const [activeTab, setActiveTab] = useState<MemberTab>("requests");
  const [cards, setCards] = useState<RequestCard[]>(requestCards);

  useEffect(() => {
    if (!clearPurchasedCart) return;

    writeServiceCartSlugs([]);
  }, [clearPurchasedCart]);

  return (
    <div className="mt-8">
      {showPaymentSuccess ? (
        <div className="mb-6 rounded-[1.15rem] border border-dema-forest/15 bg-dema-sage/75 px-5 py-4 text-sm text-dema-forest">
          Paiement confirmé. Votre commande est bien enregistrée dans votre espace membre.
        </div>
      ) : null}

      <div className="inline-flex rounded-full border border-dema-line/75 bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.04)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm transition md:px-6 ${
                isActive
                  ? "bg-dema-forest font-semibold text-white shadow-[0_6px_16px_rgba(49,95,70,0.14)]"
                  : "font-light text-brand-blue/56 hover:bg-dema-sage/70 hover:text-brand-blue/72"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "requests" ? (
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
      ) : null}

      <section className="mt-8 rounded-[1.15rem] border border-dema-line bg-dema-paper p-5">
        <SectionHeader
          title="Partenaires & fournisseurs"
          description="Banques, assurances, mutuelles, achats, équipements et partenaires métier sont regroupés dans un annuaire unique."
        />
        <Link
          href="/annuaire-fournisseurs"
          className="mt-4 inline-flex rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-brand-blue"
        >
          Ouvrir l&apos;annuaire partenaires & fournisseurs
        </Link>
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
  const serviceList = payment.serviceNames.filter(Boolean);
  const hasServiceBrief = Boolean(payment.serviceBrief);
  const hasTeamNotification = Boolean(payment.slackNotifiedAt);
  const timeline = buildRequestTimeline({
    createdAt: payment.createdAt,
    hasServiceBundle,
    hasServiceBrief,
    hasTeamNotification,
    request,
    serviceBriefSubmittedAt: payment.serviceBriefSubmittedAt,
    slackNotifiedAt: payment.slackNotifiedAt,
  });
  const status = getRequestStatus({
    hasAssistantRequest: Boolean(request),
    hasServiceBrief,
    hasTeamNotification,
    orderType: payment.orderType,
    paymentStatus: payment.paymentStatus,
  });
  const StatusIcon = status.icon;

  return (
    <article className="demaa-card rounded-[1.15rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {payment.cartSummary || payment.offerLabel}
          </h2>
          <p className="mt-1 text-sm text-dema-muted">
            {formatAmount(payment.amountTotal, payment.currency)} · payé le{" "}
            {formatDate(payment.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      {hasServiceBundle && serviceList.length > 0 ? (
        <div className="mt-4 rounded-[0.9rem] bg-dema-sage/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue/70">
            Services achetés
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceList.map((serviceName) => (
              <span
                key={serviceName}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-blue/80"
              >
                {serviceName}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {request?.tasks || payment.assistantTasks ? (
        <p className="mt-4 rounded-[0.9rem] bg-dema-sage/60 px-4 py-3 text-sm leading-relaxed text-brand-blue/75">
          {request?.tasks || payment.assistantTasks}
        </p>
      ) : hasServiceBrief ? (
        <div className="mt-4 rounded-[0.9rem] bg-dema-sage/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue/70">
            Brief transmis
          </p>
          <p className="mt-2 text-sm leading-relaxed text-brand-blue/75">
            {payment.serviceBrief}
          </p>
          {payment.serviceBriefSubmittedAt ? (
            <p className="mt-2 text-xs text-dema-muted">
              Envoyé le {formatDate(payment.serviceBriefSubmittedAt)}
            </p>
          ) : null}
        </div>
      ) : hasServiceBundle ? (
        <p className="mt-4 rounded-[0.9rem] border border-dashed border-dema-line bg-dema-paper px-4 py-3 text-sm leading-relaxed text-dema-muted">
          Votre commande est bien enregistrée. Ajoutez un brief simple pour que Demaa
          puisse cadrer la suite plus vite.
        </p>
      ) : (
        <p className="mt-4 rounded-[0.9rem] border border-dashed border-dema-line bg-dema-paper px-4 py-3 text-sm leading-relaxed text-dema-muted">
          Votre paiement est confirmé. Ajoutez les détails de votre demande pour que
          Demaa puisse cadrer la mission.
        </p>
      )}

      {request?.whatsappPhone ? (
        <div className="mt-4 text-sm text-dema-muted">
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-dema-forest" />
            WhatsApp : {request.whatsappPhone}
          </span>
        </div>
      ) : null}

      {timeline.length > 0 ? (
        <div className="mt-4 rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue/70">
            Historique
          </p>
          <div className="mt-3 space-y-3">
            {timeline.map((item) => (
              <div key={`${item.label}-${item.date}`} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-dema-forest" />
                <div>
                  <p className="text-sm font-medium text-brand-blue">{item.label}</p>
                  <p className="text-xs text-dema-muted">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
              : "Brief transmis. Demaa vous contacte pour cadrer la suite."}
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

function buildRequestTimeline(input: {
  createdAt: string | null;
  hasServiceBundle: boolean;
  hasServiceBrief: boolean;
  hasTeamNotification: boolean;
  request: MemberRequest;
  serviceBriefSubmittedAt: string | null;
  slackNotifiedAt: string | null;
}) {
  const items: Array<{ label: string; date: string }> = [];

  if (input.createdAt) {
    items.push({
      label: input.hasServiceBundle ? "Commande payée" : "Paiement confirmé",
      date: formatDateTime(input.createdAt),
    });
  }

  if (input.request?.tasks) {
    items.push({
      label: "Demande transmise",
      date: formatDateTime(input.request.whatsappPhone ? input.createdAt : input.createdAt),
    });
  }

  if (input.hasServiceBrief && input.serviceBriefSubmittedAt) {
    items.push({
      label: "Brief envoyé",
      date: formatDateTime(input.serviceBriefSubmittedAt),
    });
  }

  if (input.hasTeamNotification && input.slackNotifiedAt) {
    items.push({
      label: "Équipe Demaa notifiée",
      date: formatDateTime(input.slackNotifiedAt),
    });
  }

  return items;
}
