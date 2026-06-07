"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Check,
  ChevronDown,
  FileCheck2,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import {
  ASSISTANT_PACK_OFFERS,
  formatAssistantPrice,
  type AssistantOffer,
  type AssistantOfferId,
  type AssistantPack,
  type AssistantPackId,
} from "@/lib/assistant-packs";
import PrimaryMobileNav from "@/components/PrimaryMobileNav";
import SystemSetupModal from "@/components/SystemSetupModal";

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
    title: "Accompagnement structuration",
    category: "Organisation",
    tags: ["Administration"],
    format: "À partir de 750 €",
    description:
      "On vous aide à clarifier vos process, poser des systèmes de travail solides et reprendre la main sur votre organisation.",
    icon: Workflow,
    packOfferId: "structuration-automatisation",
  },
  {
    title: "Assistant polyvalent",
    category: "Administration",
    tags: ["Administration"],
    format: "Minimum 20 h / mois",
    description:
      "On prend en charge vos tâches récurrentes, le suivi de vos dossiers et l'organisation opérationnelle du mois.",
    icon: Send,
    packOfferId: "administratif",
  },
  {
    title: "Appels d'offres",
    category: "Dossiers",
    tags: ["Dossiers", "Commercial"],
    format: "À partir de 500 €",
    description:
      "On vous aide à structurer une réponse claire, rassembler les pièces demandées et sécuriser un dossier prêt à envoyer.",
    icon: FileCheck2,
    packOfferId: "appel-offre",
  },
] as const satisfies readonly AssistantCatalogOffer[];

const howItWorksSteps = [
  {
    title: "Vous choisissez la mission",
    description:
      "Structuration, tâches récurrentes ou appel d’offres : vous choisissez ce que vous voulez nous confier.",
  },
  {
    title: "On confirme le cadre",
    description:
      "On vérifie le périmètre, les délais, les documents nécessaires et les points à valider.",
  },
  {
    title: "On avance avec vous",
    description:
      "On exécute la mission, on vous tient au courant, et vous gardez la main sur les décisions importantes.",
  },
] as const;

const faqItems = [
  {
    question: "Est-ce que l’audit gratuit m’engage à acheter quelque chose ?",
    answer:
      "Non. L’audit gratuit ne vous engage à rien. Il sert à faire le point sur votre organisation si vous voulez commencer par clarifier les choses.",
  },
  {
    question: "Comment je sais quelle offre choisir ?",
    answer:
      "Si vous voulez remettre de l’ordre dans votre organisation, choisissez l’accompagnement structuration. Si vous voulez déléguer des tâches chaque mois, choisissez l’assistant polyvalent. Si vous devez répondre à un marché, choisissez l’appel d’offres.",
  },
  {
    question: "Est-ce que je garde la main sur les décisions ?",
    answer:
      "Oui. On prend en charge l’exécution, l’organisation et le suivi, mais les décisions importantes restent de votre côté.",
  },
  {
    question: "Qu’est-ce que je dois fournir ?",
    answer:
      "Les informations utiles à la mission : documents, accès, consignes, échéances et validations attendues.",
  },
  {
    question: "Comment se passe la communication ?",
    answer:
      "La communication se fait simplement sur WhatsApp, pour que les échanges soient rapides, faciles à suivre et proches de votre quotidien. Si un document ou une validation est nécessaire, on vous le précise clairement.",
  },
  {
    question: "Est-ce que je peux commencer petit ?",
    answer:
      "Oui. Vous pouvez choisir le plus petit format adapté, puis ajuster ensuite si le besoin évolue.",
  },
  {
    question: "Et si mon besoin ne rentre pas exactement dans une offre ?",
    answer:
      "Vous pouvez passer par l’audit gratuit ou nous contacter. On vous dira simplement si le besoin est adapté, s’il faut ajuster le périmètre, ou si ce n’est pas le bon sujet.",
  },
] as const;

const em2aResults = [
  "36 jours/an gagnés côté comptabilité",
  "30 jours/an gagnés côté paie",
  "Jusqu’à 30 000 € de capacité récupérée/an",
] as const;

const em2aImpacts = [
  "Moins de relances",
  "Moins de flou dans le suivi",
  "Plus de temps pour les clients",
] as const;

const em2aSteps = [
  "Audit de l’organisation",
  "Priorisation des demandes clients et de la collecte paie",
  "Mise en place du système opérationnel avec Airtable, Fillout et Linktree",
] as const;

function getPurchasablePacks(offer: AssistantOffer): readonly AssistantPack[] {
  return offer.packs.filter((pack) => pack.amount > 0);
}

const DEFAULT_PACK_BY_OFFER = Object.fromEntries(
  ASSISTANT_PACK_OFFERS.map((offer) => {
    const firstPurchasablePack = getPurchasablePacks(offer)[0] ?? offer.packs[0];

    return [offer.id, firstPurchasablePack.id];
  })
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
  const [selectedPacks, setSelectedPacks] =
    useState<Record<AssistantOfferId, AssistantPackId>>(DEFAULT_PACK_BY_OFFER);
  const [openPackOfferId, setOpenPackOfferId] = useState<AssistantOfferId | null>(null);
  const [openCartOfferId, setOpenCartOfferId] = useState<AssistantOfferId | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [embeddedCheckout, setEmbeddedCheckout] = useState<EmbeddedCheckoutState | null>(null);
  const [isEmbeddedCheckoutLoading, setIsEmbeddedCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const embeddedCheckoutRef = useRef<{ destroy: () => void } | null>(null);

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
      if (!details || details.pack.amount <= 0) return current;

      const purchasablePacks = getPurchasablePacks(details.offer);

      const existingItem = current.find((item) => {
        const itemDetails = getPackDetails(item.id);
        return itemDetails?.offer.id === details.offer.id;
      });

      if (existingItem) {
        const currentIndex = purchasablePacks.findIndex((pack) => pack.id === existingItem.id);
        const selectedIndex = purchasablePacks.findIndex((pack) => pack.id === packId);
        const nextIndex =
          existingItem.id === packId
            ? Math.min(Math.max(currentIndex, 0) + 1, purchasablePacks.length - 1)
            : selectedIndex;
        const nextPack = purchasablePacks[nextIndex] ?? details.pack;

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

    const purchasablePacks = getPurchasablePacks(details.offer);
    const currentIndex = purchasablePacks.findIndex((pack) => pack.id === packId);

    setCartItems((current) => {
      if (currentIndex <= 0) {
        return current.filter((item) => item.id !== packId);
      }

      const previousPack = purchasablePacks[currentIndex - 1];

      return current.map((item) =>
        item.id === packId ? { ...item, id: previousPack.id, quantity: 1 } : item
      );
    });
    setCheckoutError(null);
  };

  const incrementPack = (packId: AssistantPackId) => {
    const details = getPackDetails(packId);
    if (!details) return;

    const purchasablePacks = getPurchasablePacks(details.offer);
    const currentIndex = purchasablePacks.findIndex((pack) => pack.id === packId);
    const nextPack =
      purchasablePacks[Math.min(Math.max(currentIndex, 0) + 1, purchasablePacks.length - 1)];

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

      <section className="ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-dema-cream px-4 pb-5 pt-5 text-center md:px-8 md:pb-6 md:pt-16">
        <div className="mx-auto max-w-6xl space-y-6 md:space-y-7">
          <PrimaryMobileNav activeTab="deleguer" />

          <div className="mx-auto max-w-5xl">
            <h1 className="text-[clamp(3rem,14.5vw,3.36rem)] tracking-tight leading-[0.92] sm:text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem]">
              <span className="demaa-hero-title text-brand-blue/86">Déléguez</span>
              <br />
              <span className="font-sans font-light not-italic text-brand-blue/44">
                ce qui vous ralentit.
              </span>
            </h1>
          </div>

        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-4 md:px-8 md:pb-20 md:pt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-tight text-brand-blue md:text-base">
            Ce que vous pouvez déléguer
          </h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-blue/28 bg-dema-paper text-brand-blue/72 shadow-[0_5px_14px_rgba(23,35,29,0.025)] transition hover:border-brand-blue/40 hover:bg-dema-sage/45"
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assistantOffers.map((offer) => {
            const Icon = offer.icon;
            const packOffer = getPackOffer(offer.packOfferId);
            const purchasablePacks = packOffer ? getPurchasablePacks(packOffer) : [];
            const selectedPackId = selectedPacks[offer.packOfferId];
            const selectedPack =
              purchasablePacks.find((pack) => pack.id === selectedPackId) ||
              purchasablePacks[0];
            const isPackDropdownOpen = openPackOfferId === offer.packOfferId;

            return (
              <article
                key={offer.title}
                className={`demaa-card relative flex h-full flex-col overflow-visible rounded-[1.15rem] p-5 ${
                  isPackDropdownOpen ? "z-40" : "z-0"
                }`}
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
                          aria-expanded={isPackDropdownOpen}
                          aria-haspopup="listbox"
                        >
                          <span className="min-w-0 truncate">
                            {selectedPack.label} - {formatAssistantPrice(selectedPack.amount)}
                          </span>
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dema-sage text-dema-forest transition group-hover:bg-dema-paper">
                            <ChevronDown
                              className={`h-4 w-4 transition ${
                                isPackDropdownOpen ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                        </button>
                        {isPackDropdownOpen ? (
                          <div
                            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-[1rem] border border-dema-line bg-dema-paper p-1.5 shadow-[0_18px_46px_rgba(23,35,29,0.12)]"
                            role="listbox"
                          >
                            {purchasablePacks.map((pack) => {
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
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8 md:pb-28">
        <div className="border-t border-dema-line/65 pt-10 md:pt-14">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
              Comment ça se passe concrètement ?
            </h2>
            <div className="mx-auto mt-6 grid gap-4 md:max-w-5xl md:grid-cols-3 md:gap-5">
              {howItWorksSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[1rem] border border-dema-line/70 bg-dema-sage/30 px-4 py-4 md:min-h-[11.5rem] md:px-5 md:py-5"
                >
                  <div className="flex gap-3 md:flex-col">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dema-paper text-sm font-semibold text-dema-forest">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold leading-snug text-brand-blue md:text-base">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-dema-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 md:mt-20">
            <div className="grid gap-6 rounded-[1rem] border border-dema-line/70 bg-dema-paper px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-7">
              <div>
                <p className="inline-flex rounded-full bg-dema-forest/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
                  Étude de cas EM2A
                </p>
                <h2 className="mt-4 text-[2.45rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3.45rem]">
                  Plus de{" "}
                  <span className="demaa-hero-title text-brand-blue/86">2 mois</span>
                  <br />
                  de travail récupérés par an.
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {em2aImpacts.map((impact) => (
                    <div
                      key={impact}
                      className="rounded-[0.9rem] bg-dema-sage/55 px-4 py-3"
                    >
                      <p className="text-sm font-semibold leading-snug text-brand-blue">
                        {impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[0.9rem] border border-dema-line/70 bg-dema-cream px-4 py-5 md:px-5">
                <p className="text-sm font-semibold text-brand-blue">Résultats</p>
                <div className="mt-4 space-y-3">
                  {em2aResults.map((result) => (
                    <div key={result} className="flex gap-3">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-dema-forest" />
                      <p className="text-sm leading-relaxed text-dema-muted">{result}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-dema-line/70 pt-5">
                  <p className="text-sm font-semibold text-brand-blue">Méthode</p>
                  <div className="mt-4 space-y-3">
                    {em2aSteps.map((step, index) => (
                      <div key={step} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dema-sage text-xs font-semibold text-dema-forest">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed text-dema-muted">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 md:mt-20">
            <h2 className="text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
              On répond aux questions fréquentes
            </h2>
            <div className="mt-6 divide-y divide-dema-line/70 rounded-[1rem] border border-dema-line/70 bg-dema-paper">
              {faqItems.map((item, index) => (
                <div key={item.question} className="px-4 py-5 md:px-5">
                  <h3 className="text-sm font-semibold leading-snug text-brand-blue md:text-base">
                    {index + 1}. {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-4xl rounded-[1rem] border border-dema-line/70 bg-dema-paper px-5 py-12 text-center shadow-[0_18px_50px_rgba(23,35,29,0.04)] md:mt-20 md:px-12 md:py-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dema-forest">
                Expérience
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-brand-blue md:text-4xl">
                Plus de 200 dirigeants accompagnés.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-dema-muted md:text-lg">
                Des dirigeants de TPE, cabinets, indépendants et petites équipes, dans différents
                secteurs, accompagnés pour structurer leur organisation et alléger leur quotidien.
              </p>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="demaa-primary-button mx-auto mt-8 px-5 py-3"
              >
                Audit organisation gratuit
              </button>
            </div>
          </div>
        </div>
      </section>

      <SystemSetupModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

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

                    const purchasablePacks = getPurchasablePacks(details.offer);
                    const lineTotal = details.pack.amount;
                    const currentPackIndex = purchasablePacks.findIndex(
                      (pack) => pack.id === item.id
                    );
                    const packStep = currentPackIndex + 1;
                    const isFirstPack = currentPackIndex <= 0;
                    const isLastPack = currentPackIndex >= purchasablePacks.length - 1;

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
                                {purchasablePacks.map((pack) => {
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
                <p className="mt-3 text-sm leading-relaxed text-dema-forest">
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
