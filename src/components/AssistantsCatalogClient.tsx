"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Check,
  ChevronDown,
  FileCheck2,
  HandCoins,
  Minus,
  Plus,
  ReceiptText,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import {
  ASSISTANT_PACK_OFFERS,
  formatAssistantPrice,
  type AssistantOfferId,
  type AssistantPackId,
} from "@/lib/assistant-packs";

type AssistantCatalogOffer = {
  title: string;
  category: string;
  tags: readonly string[];
  format: string;
  description: string;
  icon: typeof Workflow;
  packOfferId: AssistantOfferId;
};

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

const assistantOffers = [
  {
    title: "Structuration & automatisation",
    category: "Automatisation",
    tags: ["Automatisation", "Administration"],
    format: "À partir de 300 €",
    description:
      "Cadrage des tâches répétitives, structuration des process et mise en place d'automatisations simples avec vos outils.",
    icon: Workflow,
    packOfferId: "structuration-automatisation",
  },
  {
    title: "Assistant facturation",
    category: "Finance",
    tags: ["Finance", "Administration"],
    format: "À partir de 300 €",
    description:
      "Classement des pièces, suivi des paiements, relances simples et préparation comptable.",
    icon: ReceiptText,
    packOfferId: "facturation",
  },
  {
    title: "Assistant administratif",
    category: "Administration",
    tags: ["Administration"],
    format: "À partir de 250 €",
    description:
      "Classement de documents, préparation de formulaires, suivi de dossiers et organisation des pièces utiles.",
    icon: Send,
    packOfferId: "administratif",
  },
  {
    title: "Subventions",
    category: "Financement",
    tags: ["Finance", "Dossiers"],
    format: "À partir de 500 €",
    description:
      "Préparation d'un dossier de subvention simple avec les pièces, les informations demandées et le suivi de dépôt.",
    icon: HandCoins,
    packOfferId: "subvention",
  },
  {
    title: "Appels d'offres",
    category: "Dossiers",
    tags: ["Dossiers", "Commercial"],
    format: "À partir de 500 €",
    description:
      "Préparation d'une réponse simple à appel d'offre avec les pièces, la trame et les éléments demandés.",
    icon: FileCheck2,
    packOfferId: "appel-offre",
  },
] as const satisfies readonly AssistantCatalogOffer[];

const filterTags = [
  "Tous",
  "Finance",
  "Marketing",
  "Commercial",
  "Dossiers",
  "Automatisation",
  "Administration",
] as const;

type FilterTag = (typeof filterTags)[number];

const DEFAULT_PACK_BY_OFFER = Object.fromEntries(
  ASSISTANT_PACK_OFFERS.map((offer) => [offer.id, offer.packs[0].id])
) as Record<AssistantOfferId, AssistantPackId>;

function getPackDetails(packId: AssistantPackId) {
  for (const offer of ASSISTANT_PACK_OFFERS) {
    const pack = offer.packs.find((item) => item.id === packId);

    if (pack) {
      return { offer, pack };
    }
  }

  return null;
}

function getPackOffer(offerId: AssistantOfferId) {
  return ASSISTANT_PACK_OFFERS.find((offer) => offer.id === offerId);
}

function getCartItemLabel(item: CartItem) {
  const details = getPackDetails(item.id);

  if (!details) return "Pack assistant";

  return `${details.offer.title} - ${details.pack.label}`;
}

export default function AssistantsCatalogClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<FilterTag>("Tous");
  const [selectedPacks, setSelectedPacks] =
    useState<Record<AssistantOfferId, AssistantPackId>>(DEFAULT_PACK_BY_OFFER);
  const [openPackOfferId, setOpenPackOfferId] = useState<AssistantOfferId | null>(null);
  const [openCartOfferId, setOpenCartOfferId] = useState<AssistantOfferId | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [embeddedCheckout, setEmbeddedCheckout] = useState<EmbeddedCheckoutState | null>(null);
  const [isEmbeddedCheckoutLoading, setIsEmbeddedCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const embeddedCheckoutRef = useRef<{ destroy: () => void } | null>(null);

  const filteredOffers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return assistantOffers.filter((offer) => {
      const matchesTag =
        activeTag === "Tous" || (offer.tags as readonly string[]).includes(activeTag);
      const packOffer = getPackOffer(offer.packOfferId);
      const matchesSearch =
        !query ||
        offer.title.toLowerCase().includes(query) ||
        offer.category.toLowerCase().includes(query) ||
        offer.format.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query) ||
        offer.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        Boolean(
          packOffer?.packs.some(
            (pack) =>
              pack.label.toLowerCase().includes(query) ||
              pack.detail.toLowerCase().includes(query)
          )
        );

      return matchesTag && matchesSearch;
    });
  }, [activeTag, searchQuery]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const details = getPackDetails(item.id);
        return total + (details?.pack.amount ?? 0);
      }, 0),
    [cartItems]
  );

  const cartCount = cartItems.length;

  const cartLabel = useMemo(() => {
    if (cartItems.length === 0) return "Votre sélection";

    return cartItems
      .map((item) => {
        return getCartItemLabel(item);
      })
      .join(", ");
  }, [cartItems]);

  const addPackToCart = (packId: AssistantPackId) => {
    setCartItems((current) => {
      const details = getPackDetails(packId);
      if (!details) return current;

      const existingItem = current.find((item) => {
        const itemDetails = getPackDetails(item.id);
        return itemDetails?.offer.id === details.offer.id;
      });

      if (existingItem) {
        const currentIndex = details.offer.packs.findIndex((pack) => pack.id === existingItem.id);
        const selectedIndex = details.offer.packs.findIndex((pack) => pack.id === packId);
        const nextIndex =
          existingItem.id === packId
            ? Math.min(currentIndex + 1, details.offer.packs.length - 1)
            : selectedIndex;
        const nextPack = details.offer.packs[nextIndex] ?? details.pack;

        return current.map((item) =>
          item.id === existingItem.id ? { ...item, id: nextPack.id, quantity: 1 } : item
        );
      }

      return [...current, { id: packId, quantity: 1 }];
    });
    setIsCartOpen(true);
    setCheckoutError(null);
  };

  const selectPack = (offerId: AssistantOfferId, packId: AssistantPackId) => {
    setSelectedPacks((current) => ({
      ...current,
      [offerId]: packId,
    }));
    setOpenPackOfferId(null);
  };

  const removePackFromCart = (packId: AssistantPackId) => {
    setCartItems((current) => current.filter((item) => item.id !== packId));
    setCheckoutError(null);
  };

  const decrementPack = (packId: AssistantPackId) => {
    const details = getPackDetails(packId);
    if (!details) return;

    const currentIndex = details.offer.packs.findIndex((pack) => pack.id === packId);

    setCartItems((current) => {
      if (currentIndex <= 0) {
        return current.filter((item) => item.id !== packId);
      }

      const previousPack = details.offer.packs[currentIndex - 1];

      return current.map((item) =>
        item.id === packId ? { ...item, id: previousPack.id, quantity: 1 } : item
      );
    });
    setCheckoutError(null);
  };

  const incrementPack = (packId: AssistantPackId) => {
    const details = getPackDetails(packId);
    if (!details) return;

    const currentIndex = details.offer.packs.findIndex((pack) => pack.id === packId);
    const nextPack = details.offer.packs[Math.min(currentIndex + 1, details.offer.packs.length - 1)];

    setCartItems((current) =>
      current.map((item) =>
        item.id === packId ? { ...item, id: nextPack.id, quantity: 1 } : item
      )
    );
    setCheckoutError(null);
  };

  const changeCartPack = (currentPackId: AssistantPackId, nextPackId: AssistantPackId) => {
    if (currentPackId === nextPackId) return;

    setCartItems((current) => {
      const currentItem = current.find((item) => item.id === currentPackId);
      if (!currentItem) return current;

      const nextDetails = getPackDetails(nextPackId);
      const nextItem = current.find((item) => {
        const itemDetails = getPackDetails(item.id);
        return itemDetails?.offer.id === nextDetails?.offer.id && item.id !== currentPackId;
      });

      if (nextItem) {
        return current
          .filter((item) => item.id !== currentPackId)
          .map((item) =>
            item.id === nextPackId
              ? { ...item, quantity: 1 }
              : item
          );
      }

      return current.map((item) =>
        item.id === currentPackId ? { ...item, id: nextPackId, quantity: 1 } : item
      );
    });
    setOpenCartOfferId(null);
    setCheckoutError(null);
  };

  const handlePayment = async () => {
    setCheckoutError(null);

    if (cartItems.length === 0) {
      setCheckoutError("Ajoutez au moins un pack pour continuer.");
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
            quantity: 1,
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
            url?: string;
          }
        | null;

      if (!response.ok || (!payload?.url && (!payload?.clientSecret || !payload.publishableKey))) {
        throw new Error(
          payload?.error ||
            "Impossible de créer le paiement Stripe pour le moment."
        );
      }

      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }

      const clientSecret = payload.clientSecret;
      const publishableKey = payload.publishableKey;

      if (!clientSecret || !publishableKey) {
        throw new Error("Impossible de créer le paiement Stripe pour le moment.");
      }

      setEmbeddedCheckout({
        clientSecret,
        label: payload.label || cartLabel,
        publishableKey,
        sessionId: payload.id ?? null,
      });
      setIsCartOpen(false);
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
    let loadingFallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let iframeObserver: MutationObserver | null = null;
    const containerId = "assistant-embedded-checkout";

    setCheckoutError(null);
    setIsEmbeddedCheckoutLoading(true);

    function watchStripeFrameLoad() {
      const container = document.getElementById(containerId);
      if (!container) return;

      const markLoaded = () => {
        if (!isActive) return;
        setIsEmbeddedCheckoutLoading(false);
      };

      const attachLoadListener = () => {
        const iframe = container.querySelector("iframe");
        if (!iframe) return false;

        iframe.addEventListener("load", markLoaded, { once: true });
        return true;
      };

      if (attachLoadListener()) return;

      iframeObserver = new MutationObserver(() => {
        if (attachLoadListener()) {
          iframeObserver?.disconnect();
          iframeObserver = null;
        }
      });
      iframeObserver.observe(container, { childList: true, subtree: true });
    }

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
        watchStripeFrameLoad();
        loadingFallbackTimer = setTimeout(() => {
          if (isActive) setIsEmbeddedCheckoutLoading(false);
        }, 6000);
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
      if (loadingFallbackTimer) clearTimeout(loadingFallbackTimer);
      iframeObserver?.disconnect();
      embeddedCheckoutRef.current?.destroy();
      embeddedCheckoutRef.current = null;
    };
  }, [embeddedCheckout]);

  return (
    <>
      {embeddedCheckout ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/45 px-4 py-5 md:px-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Paiement Stripe pour ${embeddedCheckout.label}`}
        >
          <div className="mx-auto max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_24px_60px_rgba(23,35,29,0.14)]">
            <div className="border-b border-dema-line bg-dema-paper">
              <div className="flex items-center justify-between gap-4 px-5 py-4 md:px-6">
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
            </div>
            <div className="relative min-h-[680px] px-2 py-4 md:px-4">
              {isEmbeddedCheckoutLoading ? (
                <div className="absolute inset-0 z-10 flex min-h-[560px] items-center justify-center bg-dema-paper/92 text-sm font-medium text-dema-muted">
                  <span className="rounded-full border border-dema-line bg-dema-paper px-4 py-2 shadow-[0_8px_24px_rgba(23,35,29,0.04)]">
                    Chargement du paiement...
                  </span>
                </div>
              ) : null}
              <div id="assistant-embedded-checkout" />
            </div>
          </div>
        </div>
      ) : null}

      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-12 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-[2.24rem] tracking-tight leading-[0.98] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Déléguez</span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                ce qui vous ralentit.
              </span>
            </h1>
          </div>

          <div className="demaa-search-shell mx-auto w-full max-w-4xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/42 md:left-5 md:h-5 md:w-5" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un assistant"
                aria-label="Rechercher un assistant"
                className="w-full rounded-full bg-dema-paper py-2.5 pl-10 pr-5 text-sm font-normal text-brand-blue outline-none transition placeholder:text-brand-blue/36 md:py-3 md:pl-12 md:text-base"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-4 pt-1 md:pb-5">
        <div className="mx-auto flex max-w-6xl items-start justify-center gap-3">
          <div className="max-w-4xl overflow-x-auto pb-2 soft-scroll">
            <div className="flex min-w-max justify-center gap-2 px-1">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`demaa-chip ${
                    activeTag === tag ? "demaa-chip-active" : ""
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-forest shadow-[0_8px_24px_rgba(23,35,29,0.04)] transition hover:bg-dema-sage/70"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-dema-forest px-1 text-[10px] font-semibold text-dema-paper">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pb-28 md:pt-10">
        {filteredOffers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer) => {
              const Icon = offer.icon;
              const packOffer = getPackOffer(offer.packOfferId);
              const selectedPackId = selectedPacks[offer.packOfferId];
              const selectedPack =
                packOffer?.packs.find((pack) => pack.id === selectedPackId) ||
                packOffer?.packs[0];

              return (
                <article
                  key={offer.title}
                  className="demaa-card flex h-full flex-col rounded-[1.15rem] p-5"
                >
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
                      {offer.category}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-brand-blue">
                      {offer.title}
                    </h2>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                    {offer.description}
                  </p>
                  <div className="mt-auto pt-5">
                    {packOffer && selectedPack ? (
                      <div className="flex items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenPackOfferId((current) =>
                                current === offer.packOfferId ? null : offer.packOfferId
                              )
                            }
                            className="group inline-flex h-11 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-dema-line/85 bg-dema-paper px-3.5 text-left text-sm font-medium text-brand-blue shadow-[0_7px_18px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/20 hover:bg-dema-sage/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest/35"
                            aria-expanded={openPackOfferId === offer.packOfferId}
                            aria-haspopup="listbox"
                          >
                            <span className="min-w-0 truncate">
                              {selectedPack.label} - {formatAssistantPrice(selectedPack.amount)}
                            </span>
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-paper">
                              <ChevronDown
                                className={`h-4 w-4 transition ${
                                  openPackOfferId === offer.packOfferId ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                          </button>
                          {openPackOfferId === offer.packOfferId ? (
                            <div
                              className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-[1rem] border border-dema-line bg-dema-paper p-1.5 shadow-[0_18px_46px_rgba(23,35,29,0.12)]"
                              role="listbox"
                            >
                              {packOffer.packs.map((pack) => {
                                const isSelected = pack.id === selectedPack.id;

                                return (
                                  <button
                                    key={pack.id}
                                    type="button"
                                    onClick={() => selectPack(offer.packOfferId, pack.id)}
                                    className={`flex w-full items-start justify-between gap-3 rounded-[0.8rem] px-3 py-2.5 text-left transition ${
                                      isSelected
                                        ? "bg-dema-sage text-brand-blue"
                                        : "text-brand-blue hover:bg-dema-sage/55"
                                    }`}
                                    role="option"
                                    aria-selected={isSelected}
                                  >
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold leading-tight">
                                        {pack.label} - {formatAssistantPrice(pack.amount)}
                                      </span>
                                      <span className="mt-1 block text-xs leading-snug text-dema-muted">
                                        {pack.detail}
                                      </span>
                                    </span>
                                    {isSelected ? (
                                      <Check
                                        className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedPack) return;
                            addPackToCart(selectedPack.id);
                          }}
                          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-dema-forest/18 bg-dema-paper px-4 text-sm font-medium text-dema-forest shadow-[0_7px_18px_rgba(23,35,29,0.025)] transition hover:border-dema-forest/28 hover:bg-dema-sage/55"
                        >
                          Ajouter
                        </button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.15rem] border border-dashed border-dema-line bg-dema-paper px-6 py-10 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-brand-blue">
              Aucun assistant trouvé
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dema-muted">
              Essayez un autre mot-clé ou un autre filtre.
            </p>
          </div>
        )}
      </section>

      {isCartOpen ? (
        <div className="fixed inset-0 z-50 bg-brand-blue/35" onClick={() => setIsCartOpen(false)}>
          <aside
            className="absolute bottom-0 right-0 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[1.15rem] bg-dema-cream shadow-[0_20px_60px_rgba(23,35,29,0.18)] md:bottom-auto md:top-0 md:h-full md:max-h-none md:w-[26rem] md:rounded-l-[1.15rem] md:rounded-tr-none"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 md:px-6 md:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                    Votre panier
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue">
                    Sélection
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
                  aria-label="Fermer le panier"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {cartItems.length > 0 ? (
                <div className="mt-6 space-y-3 pb-5">
                  {cartItems.map((item) => {
                    const details = getPackDetails(item.id);

                    if (!details) return null;

                    const lineTotal = details.pack.amount;
                    const currentPackIndex = details.offer.packs.findIndex(
                      (pack) => pack.id === item.id
                    );
                    const packStep = currentPackIndex + 1;
                    const isFirstPack = currentPackIndex <= 0;
                    const isLastPack = currentPackIndex >= details.offer.packs.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="rounded-[0.9rem] border border-dema-line bg-dema-paper px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-snug text-brand-blue">
                              {details.offer.title}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold text-dema-forest">
                            {formatAssistantPrice(lineTotal)}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="relative min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenCartOfferId((current) =>
                                  current === details.offer.id ? null : details.offer.id
                                )
                              }
                              className="group inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-dema-line/85 bg-dema-cream px-3 text-left text-xs font-medium text-brand-blue transition hover:border-dema-forest/20 hover:bg-dema-sage/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dema-forest/35"
                              aria-expanded={openCartOfferId === details.offer.id}
                              aria-haspopup="listbox"
                            >
                              <span className="min-w-0 truncate">
                                {details.pack.label} - {formatAssistantPrice(details.pack.amount)}
                              </span>
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-paper text-dema-forest transition group-hover:bg-dema-sage">
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition ${
                                    openCartOfferId === details.offer.id ? "rotate-180" : ""
                                  }`}
                                  aria-hidden="true"
                                />
                              </span>
                            </button>
                            {openCartOfferId === details.offer.id ? (
                              <div
                                className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[1rem] border border-dema-line bg-dema-paper p-1.5 shadow-[0_18px_46px_rgba(23,35,29,0.12)]"
                                role="listbox"
                              >
                                {details.offer.packs.map((pack) => {
                                  const isSelected = pack.id === item.id;

                                  return (
                                    <button
                                      key={pack.id}
                                      type="button"
                                      onClick={() => changeCartPack(item.id, pack.id)}
                                      className={`flex w-full items-start justify-between gap-3 rounded-[0.8rem] px-3 py-2.5 text-left transition ${
                                        isSelected
                                          ? "bg-dema-sage text-brand-blue"
                                          : "text-brand-blue hover:bg-dema-sage/55"
                                      }`}
                                      role="option"
                                      aria-selected={isSelected}
                                    >
                                      <span className="min-w-0">
                                        <span className="block text-xs font-semibold leading-tight">
                                          {pack.label} - {formatAssistantPrice(pack.amount)}
                                        </span>
                                        <span className="mt-1 block text-[11px] leading-snug text-dema-muted">
                                          {pack.detail}
                                        </span>
                                      </span>
                                      {isSelected ? (
                                        <Check
                                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dema-forest"
                                          aria-hidden="true"
                                        />
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                          <div className="inline-flex shrink-0 items-center rounded-full border border-dema-line bg-dema-cream p-1">
                            <button
                              type="button"
                              onClick={() => decrementPack(item.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-dema-forest transition hover:bg-dema-paper disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label={
                                isFirstPack ? "Retirer du panier" : "Revenir au pack précédent"
                              }
                            >
                              <Minus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="min-w-8 text-center text-xs font-semibold text-brand-blue">
                              {packStep}
                            </span>
                            <button
                              type="button"
                              onClick={() => incrementPack(item.id)}
                              disabled={isLastPack}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-dema-forest transition hover:bg-dema-paper disabled:cursor-not-allowed disabled:opacity-35"
                              aria-label="Passer au pack suivant"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePackFromCart(item.id)}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition hover:bg-[#ebeee9]"
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
                <p className="mt-6 rounded-[0.9rem] border border-dashed border-dema-line bg-dema-paper px-4 py-5 text-sm leading-relaxed text-dema-muted">
                  Ajoutez un pack pour voir le total et ouvrir le paiement.
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-dema-line bg-dema-cream px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 md:px-6 md:pb-6">
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
                <p className="mt-3 text-sm leading-relaxed text-red-500">
                  {checkoutError}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
