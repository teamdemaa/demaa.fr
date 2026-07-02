"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, ShoppingBag, X } from "lucide-react";
import {
  CART_MODAL_CLOSE_EVENT,
  CART_MODAL_OPEN_EVENT,
  CART_UPDATED_EVENT,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import {
  formatPurchasableServicePrice,
  formatPurchasableServicePriceLabel,
  getPurchasableServiceConfig,
  type PurchasableServiceConfig,
} from "@/lib/service-purchase";

type CheckoutResponse =
  | { url: string }
  | { error: string };

export default function ServiceCartTray() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [highlightCart, setHighlightCart] = useState(false);
  const [isDesktopCartOpen, setIsDesktopCartOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    const syncCart = () => {
      setSelectedSlugs(readServiceCartSlugs());
    };

    const openCart = () => {
      syncCart();
      setIsDesktopCartOpen(true);
      setIsMobileCartOpen(true);
      setHighlightCart(true);
      window.setTimeout(() => setHighlightCart(false), 2200);
    };

    const closeCart = () => {
      setIsDesktopCartOpen(false);
      setIsMobileCartOpen(false);
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener(CART_MODAL_OPEN_EVENT, openCart);
    window.addEventListener(CART_MODAL_CLOSE_EVENT, closeCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener(CART_MODAL_OPEN_EVENT, openCart);
      window.removeEventListener(CART_MODAL_CLOSE_EVENT, closeCart);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("panier") !== "1") return;
    if (readServiceCartSlugs().length === 0) return;

    setIsDesktopCartOpen(true);
    setIsMobileCartOpen(true);
    setHighlightCart(true);

    const highlightTimer = window.setTimeout(() => {
      setHighlightCart(false);
    }, 2200);

    params.delete("panier");
    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);

    return () => {
      window.clearTimeout(highlightTimer);
    };
  }, []);

  const selectedServices = useMemo(() => {
    return selectedSlugs
      .map((slug) => {
        const purchase = getPurchasableServiceConfig(slug);

        return purchase;
      })
      .filter((service): service is NonNullable<typeof service> => Boolean(service));
  }, [selectedSlugs]);

  const cartTotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + service.unitAmount, 0);
  }, [selectedServices]);

  useEffect(() => {
    if (selectedSlugs.length > 0) return;

    setIsDesktopCartOpen(false);
    setIsMobileCartOpen(false);
  }, [selectedSlugs.length]);

  function removeServiceSelection(slug: string) {
    setCheckoutError(null);
    const next = selectedSlugs.filter((entry) => entry !== slug);

    writeServiceCartSlugs(next);
    setSelectedSlugs(next);
  }

  async function handleCheckout() {
    if (selectedSlugs.length === 0 || isCheckoutLoading) return;

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceSlugs: selectedSlugs,
        }),
      });

      const payload = (await response.json().catch(() => null)) as CheckoutResponse | null;

      if (!response.ok || !payload || !("url" in payload)) {
        throw new Error(
          payload && "error" in payload
            ? payload.error
            : "Impossible de lancer le paiement pour le moment."
        );
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Impossible de lancer le paiement pour le moment."
      );
      setIsCheckoutLoading(false);
    }
  }

  if (selectedServices.length === 0) return null;

  return (
    <>
      <div className="hidden md:block">
        <div
          className={`fixed inset-0 z-30 bg-brand-blue/10 transition-opacity duration-300 ${
            isDesktopCartOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
          onClick={() => setIsDesktopCartOpen(false)}
        />
        <aside
          className={`fixed bottom-4 right-4 top-[5.35rem] z-40 w-[27.75rem] overflow-hidden rounded-[1.7rem] border border-white/8 bg-[#2f4f3f] text-dema-paper shadow-[0_18px_38px_rgba(23,35,29,0.12)] transition-transform duration-300 ease-out ${
            isDesktopCartOpen ? "translate-x-0" : "translate-x-[110%]"
          }`}
        >
          <CartContent
            desktop
            error={checkoutError}
            highlight={highlightCart}
            isCheckoutLoading={isCheckoutLoading}
            onCheckout={handleCheckout}
            onCloseDesktop={() => setIsDesktopCartOpen(false)}
            onRemove={removeServiceSelection}
            selectedServices={selectedServices}
            total={cartTotal}
          />
        </aside>
      </div>

      <aside
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-dema-line bg-dema-paper/95 shadow-[0_-14px_40px_rgba(23,35,29,0.12)] backdrop-blur transition-transform duration-300 md:hidden ${
          isMobileCartOpen ? "translate-y-0" : "translate-y-[105%]"
        }`}
      >
        <CartContent
          compact
          error={checkoutError}
          highlight={highlightCart}
          isCheckoutLoading={isCheckoutLoading}
          onCheckout={handleCheckout}
          onCloseMobile={() => setIsMobileCartOpen(false)}
          onRemove={removeServiceSelection}
          selectedServices={selectedServices}
          total={cartTotal}
        />
      </aside>
    </>
  );
}

function CartContent({
  selectedServices,
  total,
  onRemove,
  onCheckout,
  onCloseDesktop,
  onCloseMobile,
  isCheckoutLoading,
  error,
  compact = false,
  desktop = false,
  highlight = false,
}: {
  selectedServices: PurchasableServiceConfig[];
  total: number;
  onRemove: (slug: string) => void;
  onCheckout: () => void;
  onCloseDesktop?: () => void;
  onCloseMobile?: () => void;
  isCheckoutLoading: boolean;
  error: string | null;
  compact?: boolean;
  desktop?: boolean;
  highlight?: boolean;
}) {
  const hasMonthlyServices = selectedServices.some(
    (service) => service.billingType === "monthly"
  );
  const allMonthlyServices =
    selectedServices.length > 0 &&
    selectedServices.every((service) => service.billingType === "monthly");

  return (
    <div
      id="demaa-service-cart"
      className={`${compact ? "p-4" : desktop ? "flex h-full flex-col px-6 pb-6 pt-5" : "p-5"} transition-shadow duration-500 ${
        highlight ? "shadow-[0_0_0_3px_rgba(49,95,70,0.2)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
              desktop ? "bg-white/12 text-dema-paper" : "bg-dema-sage text-dema-forest"
            }`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-[0.16em] ${
                desktop ? "text-white/58" : "text-dema-muted"
              }`}
            >
              {hasMonthlyServices ? "Abonnement" : "Panier"}
            </p>
            <p
              className={`mt-1 text-[1.05rem] font-semibold ${
                desktop ? "text-dema-paper" : "text-brand-blue"
              }`}
            >
              {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} ·{" "}
              {formatPurchasableServicePrice(total)}
              {allMonthlyServices ? " / mois" : ""}
            </p>
          </div>
        </div>
        {desktop && onCloseDesktop ? (
          <button
            type="button"
            onClick={onCloseDesktop}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/82 transition hover:bg-white/14 hover:text-white"
            aria-label="Fermer le panier"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : compact && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-dema-line bg-white text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer le panier"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {desktop ? <div className="mt-5 border-b border-white/10 pb-5" /> : null}
      <div
        className={`${desktop ? "mt-5" : "mt-4"} ${
          compact ? "max-h-40" : desktop ? "flex-1 overflow-y-auto pr-1" : "max-h-64 overflow-y-auto pr-1"
        }`}
      >
        <div className={desktop ? "space-y-2.5" : "space-y-2"}>
          {selectedServices.map((service) => (
            <div
              key={service.slug}
              className={`flex items-start justify-between gap-3 px-3 py-3 ${
                desktop
                  ? "rounded-[1.1rem] border border-white/6 bg-white/7"
                  : "rounded-[0.95rem] bg-dema-sage/40"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium leading-snug ${
                    desktop ? "text-dema-paper" : "text-brand-blue"
                  }`}
                >
                  {service.name}
                </p>
                <p className={`mt-1 text-xs ${desktop ? "text-white/62" : "text-dema-muted"}`}>
                  {formatPurchasableServicePriceLabel(service)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(service.slug)}
                className={`inline-flex shrink-0 items-center justify-center rounded-full transition ${
                  desktop
                    ? "h-8 w-8 border border-white/12 bg-white/10 text-white/76 hover:bg-white/16 hover:text-white"
                    : "h-7 w-7 border border-dema-line bg-white text-brand-blue/65 hover:border-dema-forest/25 hover:text-dema-forest"
                }`}
                aria-label={`Retirer ${service.name}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <p
          className={`mt-4 rounded-[0.9rem] px-3 py-2 text-sm ${
            desktop
              ? "border border-white/10 bg-white/10 text-dema-paper"
              : "border border-dema-forest/10 bg-dema-sage/60 text-dema-forest"
          }`}
        >
          {error}
        </p>
      ) : null}

      <div className={desktop ? "mt-5 border-t border-white/10 pt-5" : ""}>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isCheckoutLoading}
          className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            desktop
              ? "bg-dema-paper text-dema-forest hover:bg-white"
              : "bg-dema-forest text-dema-paper hover:bg-brand-blue"
          } ${compact ? "mb-[env(safe-area-inset-bottom)]" : ""}`}
        >
          {isCheckoutLoading ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Redirection…
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {allMonthlyServices ? "S'abonner" : "Payer"}{" "}
              {formatPurchasableServicePrice(total)}
              {allMonthlyServices ? " / mois" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
