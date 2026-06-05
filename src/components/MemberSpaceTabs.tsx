"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CircleDashed,
  Gift,
  MessageCircle,
} from "lucide-react";

type MemberRequestPayment = {
  amountTotal: number | null;
  assistantTasks: string | null;
  createdAt: string | null;
  currency: string;
  offerLabel: string;
  paymentStatus: string | null;
  stripeSessionId: string;
};

type MemberRequest = {
  tasks: string | null;
  whatsappPhone: string | null;
} | null;

type MemberDeal = {
  category: string;
  description: string;
  href: string;
  name: string;
  offer: string;
};

type MemberSpaceTabsProps = {
  deals: readonly MemberDeal[];
  requestCards: Array<{
    payment: MemberRequestPayment;
    request: MemberRequest;
  }>;
};

type MemberTab = "requests" | "deals";

const tabs = [
  { id: "deals", label: "Tarifs négociés" },
  { id: "requests", label: "Suivi des demandes" },
] as const satisfies readonly { id: MemberTab; label: string }[];

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

function getRequestStatus(input: {
  hasRequest: boolean;
  paymentStatus?: string | null;
}) {
  if (input.hasRequest) {
    return {
      label: "Demande envoyée",
      className: "bg-dema-sage text-dema-forest",
      icon: BadgeCheck,
    };
  }

  if (input.paymentStatus === "paid") {
    return {
      label: "Paiement confirmé",
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
  deals,
  requestCards,
}: MemberSpaceTabsProps) {
  const [activeTab, setActiveTab] = useState<MemberTab>("deals");

  return (
    <div className="mt-8">
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
          {requestCards.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {requestCards.map(({ payment, request }) => {
                const status = getRequestStatus({
                  hasRequest: Boolean(request),
                  paymentStatus: payment.paymentStatus,
                });
                const StatusIcon = status.icon;

                return (
                  <article
                    key={payment.stripeSessionId}
                    className="demaa-card rounded-[1.15rem] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight">
                          {payment.offerLabel}
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

                    {request?.tasks || payment.assistantTasks ? (
                      <p className="mt-4 rounded-[0.9rem] bg-dema-sage/60 px-4 py-3 text-sm leading-relaxed text-brand-blue/75">
                        {request?.tasks || payment.assistantTasks}
                      </p>
                    ) : (
                      <p className="mt-4 rounded-[0.9rem] border border-dashed border-dema-line bg-dema-paper px-4 py-3 text-sm leading-relaxed text-dema-muted">
                        Votre paiement est confirmé. Ajoutez les détails de votre demande pour
                        que Demaa puisse cadrer la mission.
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

                    {!request ? (
                      <Link
                        href={`/assistant/success?session_id=${encodeURIComponent(
                          payment.stripeSessionId
                        )}`}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
                      >
                        Compléter ma demande
                      </Link>
                    ) : (
                      <p className="mt-5 rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
                        Demaa vous contacte sur WhatsApp sous 24h.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper p-6 text-sm leading-relaxed text-dema-muted">
              Aucune demande trouvée pour cet email pour le moment.
            </div>
          )}
        </section>
      ) : null}

      {activeTab === "deals" ? (
        <section className="mt-8">
          <SectionHeader
            title="Tarifs négociés"
            description="Des offres partenaires négociées progressivement pour les membres Demaa."
          />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {deals.map((deal) => (
              <article key={deal.name} className="demaa-card rounded-[1.15rem] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                  <Gift className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                  {deal.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{deal.name}</h2>
                <p className="mt-2 inline-flex rounded-full bg-dema-sage px-3 py-1 text-xs font-medium text-dema-forest">
                  {deal.offer}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted">
                  {deal.description}
                </p>
                <a
                  href={deal.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-dema-forest"
                >
                  Voir l&apos;offre
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}
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
