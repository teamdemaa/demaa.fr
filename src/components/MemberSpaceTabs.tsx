"use client";

import { useEffect } from "react";
import Link from "next/link";
import { writeServiceCartSlugs } from "@/lib/service-cart";

type MemberRequestPayment = {
  amountTotal: number | null;
  assistantAccessToken?: string | null;
  assistantTasks: string | null;
  cartSummary: string | null;
  createdAt: string | null;
  currency: string;
  itemCount: number | null;
  liveSessionAccesses: Array<{
    purchaseSlug: string;
    trainingTitle: string;
    sessionDate: string;
    systemName: string | null;
    assets: Array<{
      id: string;
      label: string;
      description: string;
      href: string;
      external?: boolean;
    }>;
  }>;
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
        {requestCards.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {requestCards.map((card) => (
              <RequestCardArticle key={card.payment.stripeSessionId} card={card} />
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
}: {
  card: RequestCard;
}) {
  const { payment, request } = card;
  const hasServiceBundle = payment.orderType === "service_bundle";
  const hasSectorSystem = payment.orderType === "sector_system";
  const hasLiveSession =
    payment.orderType === "live_session" ||
    payment.serviceSlugs.some((slug) => slug.startsWith("session-direct-"));
  const shouldShowServiceFollowUp = !hasLiveSession || hasServiceBundle;
  const hasServiceBrief = Boolean(payment.serviceBrief);

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

      {hasSectorSystem ? (
        <p className="mt-5 rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
          Achat confirmé. Demaa vous envoie la suite pour accéder au système acheté.
        </p>
      ) : (
        <>
          {hasLiveSession ? (
            <>
              <p className="mt-5 rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
                Inscription confirmée. Demaa vous transmettra les informations pratiques avant la session.
              </p>
              {payment.liveSessionAccesses.map((access) => (
                <section
                  key={access.purchaseSlug}
                  className="mt-5 rounded-[1rem] border border-dema-line bg-dema-paper p-4"
                  aria-label={`Modèles inclus avec ${access.trainingTitle}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                    Modèles opérationnels + session Q&amp;A
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-brand-blue">
                    {access.trainingTitle}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-dema-muted">
                    {access.sessionDate}
                    {access.systemName ? ` · Modèles adaptés à ${access.systemName}` : ""}
                  </p>
                  {access.assets.length > 0 ? (
                    <div className="mt-4 space-y-2.5">
                      {access.assets.map((asset) => (
                        <Link
                          key={asset.id}
                          href={asset.href}
                          target={asset.external ? "_blank" : undefined}
                          rel={asset.external ? "noreferrer" : undefined}
                          className="block rounded-[0.85rem] border border-dema-line px-4 py-3 transition hover:border-dema-forest/30 hover:bg-dema-sage/35"
                        >
                          <span className="block text-sm font-medium text-dema-forest">
                            {asset.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-dema-muted">
                            {asset.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                      Les modèles personnalisés seront ajoutés ici avant la session.
                    </p>
                  )}
                  <p className="mt-4 text-xs leading-relaxed text-dema-muted">
                    La session comprend un temps de Q&amp;A pour adapter ces modèles à votre entreprise.
                  </p>
                </section>
              ))}
            </>
          ) : null}

          {shouldShowServiceFollowUp ? (
            <p className="mt-5 rounded-full bg-dema-sage px-4 py-2 text-center text-sm text-dema-forest">
              {request || hasServiceBrief
                ? "Votre demande historique a bien été enregistrée par Demaa."
                : "Commande historique enregistrée. Demaa vous contacte directement pour la suite."}
            </p>
          ) : null}
        </>
      )}
    </article>
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
