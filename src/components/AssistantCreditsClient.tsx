"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Check,
  ChevronDown,
  FileCheck2,
  HandCoins,
  MessageCircle,
  Minus,
  ReceiptText,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import {
  ASSISTANT_PACK_OFFERS,
  formatAssistantPrice,
  type AssistantOfferId,
  type AssistantPackId,
} from "@/lib/assistant-packs";

const OFFER_ICONS = {
  "structuration-automatisation": Settings2,
  facturation: ReceiptText,
  administratif: Send,
  subvention: HandCoins,
  "appel-offre": FileCheck2,
} satisfies Record<AssistantOfferId, typeof Settings2>;

type CartItem = {
  id: AssistantPackId;
  quantity: number;
};

type EmbeddedCheckoutState = {
  clientSecret: string;
  label: string;
  publishableKey: string;
  sessionId: string | null;
};

const DEFAULT_PACK_BY_OFFER = Object.fromEntries(
  ASSISTANT_PACK_OFFERS.map((offer) => [offer.id, offer.packs[0].id])
) as Record<AssistantOfferId, AssistantPackId>;

const STEPS = [
  {
    title: "Choisissez vos packs",
    description: "Vous sélectionnez les heures ou dossiers dont vous avez besoin, sans abonnement.",
  },
  {
    title: "Ajoutez au panier",
    description: "Vous pouvez combiner structuration, facturation, administratif, subvention ou appel d'offre.",
  },
  {
    title: "On cadre puis on exécute",
    description: "Après paiement, vous envoyez vos éléments et on revient vers vous sous 24h.",
  },
] as const;

const WHATSAPP_FLOW = [
  "Vous envoyez vos tâches, documents ou consignes directement dans la conversation.",
  "On clarifie ce qui manque, puis on priorise les actions les plus utiles.",
  "Vous suivez l'avancement simplement, sans créer un nouvel outil de gestion.",
] as const;

const FAQ_ITEMS = [
  {
    question: "Est-ce un abonnement ?",
    answer:
      "Non. Vous achetez un ou plusieurs packs, sans abonnement. Vous pouvez reprendre un pack quand vous en avez besoin.",
  },
  {
    question: "Puis-je mélanger plusieurs assistants ?",
    answer:
      "Oui. Vous pouvez ajouter plusieurs packs dans le même panier, par exemple structuration et facturation.",
  },
  {
    question: "Que se passe-t-il si le besoin dépasse le pack ?",
    answer:
      "On vous prévient avant de continuer. Le temps ou le dossier complémentaire est validé avant facturation.",
  },
  {
    question: "Les dossiers subvention et appel d'offre sont-ils toujours à 500 € ?",
    answer:
      "500 € est le minimum pour lancer un dossier simple ou une réponse simple. Les cas plus complexes sont cadrés avant d'aller plus loin.",
  },
  {
    question: "Comment démarre la mission ?",
    answer:
      "Après paiement, vous indiquez les sujets à traiter et vos coordonnées WhatsApp. L'équipe Demaa revient vers vous sous 24h.",
  },
] as const;

function getPackDetails(packId: AssistantPackId) {
  for (const offer of ASSISTANT_PACK_OFFERS) {
    const pack = offer.packs.find((item) => item.id === packId);

    if (pack) {
      return { offer, pack };
    }
  }

  return null;
}

function getCartItemLabel(item: CartItem) {
  const details = getPackDetails(item.id);

  if (!details) return "Pack assistant";

  return `${details.offer.title} - ${details.pack.label}`;
}

export default function AssistantCreditsClient() {
  const [selectedPacks, setSelectedPacks] =
    useState<Record<AssistantOfferId, AssistantPackId>>(DEFAULT_PACK_BY_OFFER);
  const [openPackMenu, setOpenPackMenu] = useState<AssistantOfferId | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [embeddedCheckout, setEmbeddedCheckout] = useState<EmbeddedCheckoutState | null>(null);
  const [isEmbeddedCheckoutLoading, setIsEmbeddedCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const embeddedCheckoutRef = useRef<{ destroy: () => void } | null>(null);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const details = getPackDetails(item.id);
        return total + (details?.pack.amount ?? 0) * item.quantity;
      }, 0),
    [cartItems]
  );

  const cartLabel = useMemo(() => {
    if (cartItems.length === 0) return "Votre sélection";

    return cartItems
      .map((item) => {
        const label = getCartItemLabel(item);
        return item.quantity > 1 ? `${label} x${item.quantity}` : label;
      })
      .join(", ");
  }, [cartItems]);

  const addPackToCart = (packId: AssistantPackId) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === packId);

      if (existingItem) {
        return current.map((item) =>
          item.id === packId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { id: packId, quantity: 1 }];
    });
    setCheckoutError(null);
  };

  const removePackFromCart = (packId: AssistantPackId) => {
    setCartItems((current) => current.filter((item) => item.id !== packId));
    setCheckoutError(null);
  };

  const decrementPack = (packId: AssistantPackId) => {
    setCartItems((current) =>
      current.flatMap((item) => {
        if (item.id !== packId) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
    setCheckoutError(null);
  };

  const handlePayment = async () => {
    setCheckoutError(null);

    if (cartItems.length === 0) {
      setCheckoutError("Ajoutez au moins un pack au panier pour continuer.");
      return;
    }

    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/stripe/assistant-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            packId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            clientSecret?: string;
            error?: string;
            id?: string | null;
            label?: string;
            publishableKey?: string;
          }
        | null;

      if (!response.ok || !payload?.clientSecret || !payload.publishableKey) {
        throw new Error(
          payload?.error ||
            "Impossible de créer le paiement Stripe pour le moment."
        );
      }

      setEmbeddedCheckout({
        clientSecret: payload.clientSecret,
        label: payload.label || cartLabel,
        publishableKey: payload.publishableKey,
        sessionId: payload.id ?? null,
      });
      setIsStartingCheckout(false);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le paiement Stripe pour le moment."
      );
      setIsStartingCheckout(false);
    }
  };

  const closeEmbeddedCheckout = () => {
    embeddedCheckoutRef.current?.destroy();
    embeddedCheckoutRef.current = null;
    setEmbeddedCheckout(null);
    setIsEmbeddedCheckoutLoading(false);
  };

  useEffect(() => {
    if (!embeddedCheckout) return undefined;

    let isActive = true;
    const containerId = "assistant-embedded-checkout";

    setCheckoutError(null);
    setIsEmbeddedCheckoutLoading(true);

    void (async () => {
      try {
        const stripe = await loadStripe(embeddedCheckout.publishableKey);

        if (!stripe) {
          throw new Error("Impossible de charger Stripe Checkout.");
        }

        const checkout = await stripe.createEmbeddedCheckoutPage({
          clientSecret: embeddedCheckout.clientSecret,
          onComplete: () => {
            if (embeddedCheckout.sessionId) {
              window.location.assign(
                `/assistant/success?session_id=${encodeURIComponent(embeddedCheckout.sessionId)}`
              );
            }
          },
        });

        if (!isActive) {
          checkout.destroy();
          return;
        }

        embeddedCheckoutRef.current?.destroy();
        embeddedCheckoutRef.current = checkout;
        checkout.mount(`#${containerId}`);
        setIsEmbeddedCheckoutLoading(false);
      } catch (error) {
        setCheckoutError(
          error instanceof Error
            ? error.message
            : "Impossible d'afficher le paiement Stripe pour le moment."
        );
        setEmbeddedCheckout(null);
        setIsEmbeddedCheckoutLoading(false);
      }
    })();

    return () => {
      isActive = false;
      embeddedCheckoutRef.current?.destroy();
      embeddedCheckoutRef.current = null;
    };
  }, [embeddedCheckout]);

  return (
    <div className="min-h-screen bg-dema-cream text-brand-blue">
      {embeddedCheckout ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-brand-blue/45 px-4 py-6 backdrop-blur-sm md:px-8 md:py-10"
          role="dialog"
          aria-modal="true"
          aria-label={`Paiement Stripe pour ${embeddedCheckout.label}`}
        >
          <div className="mx-auto min-h-full w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_24px_60px_rgba(23,35,29,0.14)]">
              <div className="flex items-center justify-between gap-4 border-b border-dema-line px-5 py-4 md:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dema-forest">
                    Paiement sécurisé
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-brand-blue">
                    {formatAssistantPrice(cartTotal)}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeEmbeddedCheckout}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
                  aria-label="Fermer le paiement"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="min-h-[680px] px-2 py-4 md:px-4">
                {isEmbeddedCheckoutLoading ? (
                  <div className="flex min-h-[560px] items-center justify-center text-sm font-medium text-dema-muted">
                    Chargement du paiement...
                  </div>
                ) : null}
                <div id="assistant-embedded-checkout" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-20 md:px-8 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="demaa-hero-title text-[3rem] leading-[0.98] tracking-tight text-brand-blue md:text-[5rem]">
            Déléguez ce qui vous ralentit.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
            Choisissez un pack, envoyez vos éléments, puis l&apos;équipe Demaa
            prend le relais sur WhatsApp.
          </p>
          <div className="mt-9 flex flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-3">
            <a
              href="#packs"
              className="inline-flex min-h-10 w-auto items-center justify-center rounded-full bg-dema-forest px-3 text-[11px] font-medium text-dema-paper transition hover:bg-[#284f3a] sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Choisir un pack
            </a>
            <a
              href="#fonctionnement"
              className="inline-flex min-h-10 w-auto items-center justify-center rounded-full bg-dema-sage px-3 text-[11px] font-medium text-brand-blue/72 transition hover:bg-[#ebeee9] hover:text-brand-blue sm:min-h-12 sm:px-6 sm:text-sm"
            >
              Voir le fonctionnement
            </a>
          </div>
        </div>

        <section id="fonctionnement" className="mx-auto mt-24 max-w-5xl md:mt-32">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Un achat simple, sans boutique compliquée.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
              Vous composez votre panier avec des packs d&apos;heures ou de
              dossiers, puis vous payez en une fois.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="demaa-card rounded-[1.15rem] px-5 py-6">
                <p className="text-xs font-semibold text-dema-forest">0{index + 1}</p>
                <h2 className="mt-4 text-base font-semibold text-brand-blue">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-5xl md:mt-36">
          <div className="demaa-surface grid gap-8 rounded-[1.25rem] px-5 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-10">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                Tout se passe sur WhatsApp.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                Vous gardez un canal simple pour cadrer les demandes, envoyer les
                éléments utiles et valider les prochaines actions.
              </p>
            </div>

            <div className="space-y-3">
              {WHATSAPP_FLOW.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-4">
                  <span className="mt-0.5 text-xs font-semibold text-dema-forest">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-dema-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="packs" className="mx-auto mt-28 max-w-6xl md:mt-36">
          <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
            <div>
              <div className="max-w-2xl">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Packs assistant
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
                  Choisissez ce que vous voulez déléguer.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
                  Sélectionnez un pack dans chaque carte, ajoutez-le au panier,
                  puis validez le paiement.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {ASSISTANT_PACK_OFFERS.map((offer) => {
                  const selectedPackId = selectedPacks[offer.id];
                  const selectedPack =
                    offer.packs.find((pack) => pack.id === selectedPackId) ||
                    offer.packs[0];
                  const Icon = OFFER_ICONS[offer.id];
                  const isMenuOpen = openPackMenu === offer.id;

                  return (
                    <article
                      key={offer.id}
                      className="demaa-card flex min-h-[22rem] flex-col rounded-[1.15rem] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                            {offer.category}
                          </p>
                          <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-brand-blue">
                            {offer.title}
                          </h3>
                        </div>
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                        {offer.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-dema-sage px-3 py-1.5 text-xs font-medium text-brand-blue/72">
                          {offer.startingLabel}
                        </span>
                        <span className="rounded-full bg-dema-paper px-3 py-1.5 text-xs font-medium text-dema-forest">
                          {offer.rateLabel}
                        </span>
                      </div>

                      <div className="mt-auto pt-6">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenPackMenu(isMenuOpen ? null : offer.id)
                            }
                            className="flex min-h-14 w-full items-center justify-between rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 text-left text-sm font-normal text-brand-blue shadow-[0_6px_18px_rgba(23,35,29,0.024)] transition hover:bg-dema-sage/45"
                            aria-expanded={isMenuOpen}
                          >
                            <span className="min-w-0 pr-3">
                              <span className="block break-words font-medium">
                                {selectedPack.label} - {formatAssistantPrice(selectedPack.amount)}
                              </span>
                              <span className="mt-0.5 block break-words text-xs text-dema-muted">
                                {selectedPack.detail}
                              </span>
                            </span>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 transition-transform ${
                                isMenuOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isMenuOpen ? (
                            <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-[0.9rem] border border-dema-line bg-dema-paper py-2 shadow-[0_16px_32px_rgba(23,35,29,0.07)]">
                              {offer.packs.map((pack) => {
                                const isSelected = pack.id === selectedPack.id;

                                return (
                                  <button
                                    key={pack.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPacks((current) => ({
                                        ...current,
                                        [offer.id]: pack.id,
                                      }));
                                      setOpenPackMenu(null);
                                    }}
                                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition ${
                                      isSelected
                                        ? "font-semibold text-dema-forest"
                                        : "font-normal text-brand-blue hover:bg-dema-sage/50"
                                    }`}
                                  >
                                    <span className="min-w-0">
                                      <span className="block break-words">
                                        {pack.label} - {formatAssistantPrice(pack.amount)}
                                      </span>
                                      <span className="mt-0.5 block break-words text-xs font-normal text-dema-muted">
                                        {pack.detail}
                                      </span>
                                    </span>
                                    {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => addPackToCart(selectedPack.id)}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-4 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
                        >
                          Ajouter au panier
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="demaa-surface rounded-[1.15rem] px-5 py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Votre panier
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue">
                  Sélection
                </h2>

                {cartItems.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {cartItems.map((item) => {
                      const details = getPackDetails(item.id);

                      if (!details) return null;

                      const lineTotal = details.pack.amount * item.quantity;

                      return (
                        <div key={item.id} className="rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold leading-snug text-brand-blue">
                                {details.offer.title}
                              </p>
                              <p className="mt-1 text-xs text-dema-muted">
                                {details.pack.label}
                                {item.quantity > 1 ? ` x${item.quantity}` : ""}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-dema-forest">
                              {formatAssistantPrice(lineTotal)}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => decrementPack(item.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
                              aria-label="Réduire la quantité"
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removePackFromCart(item.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
                              aria-label="Retirer du panier"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 rounded-[0.9rem] border border-dashed border-dema-line px-4 py-5 text-sm leading-relaxed text-dema-muted">
                    Ajoutez un pack pour voir le total et ouvrir le paiement.
                  </p>
                )}

                <div className="mt-5 border-t border-dema-line pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-dema-muted">Total</span>
                    <span className="text-xl font-semibold text-brand-blue">
                      {formatAssistantPrice(cartTotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isStartingCheckout || cartItems.length === 0}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isStartingCheckout ? "Ouverture du paiement..." : "Valider et payer"}
                  </button>
                  {checkoutError ? (
                    <p className="mt-3 text-sm leading-relaxed text-dema-forest">
                      {checkoutError}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xs leading-relaxed text-dema-muted">
                    Si le besoin dépasse le pack prévu, le complément est validé
                    avant d&apos;être facturé.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-5xl md:mt-36">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
              Les questions avant de démarrer.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted md:text-base">
              Le but : vous faire gagner du temps sans abonnement lourd, sans
              recrutement, et sans complexité.
            </p>
          </div>

          <div className="mt-8 space-y-2">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={item.question} className="rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-brand-blue">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-dema-forest transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <p className="pb-4 text-sm leading-relaxed text-dema-muted">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-3xl pb-8 text-center md:mt-36">
          <h2 className="text-2xl font-semibold tracking-tight text-brand-blue md:text-3xl">
            Déléguez une première tâche cette semaine.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-dema-muted md:text-base">
            Choisissez un pack, payez en ligne, puis envoyez les éléments à
            traiter.
          </p>
          <a
            href="#packs"
            className="mt-6 inline-flex rounded-full bg-dema-forest px-6 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a]"
          >
            Choisir un pack
          </a>
        </section>
      </section>
    </div>
  );
}
