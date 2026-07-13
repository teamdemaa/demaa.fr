"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, ShoppingBag } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  openServiceCartModal,
  readServiceCartSlugs,
} from "@/lib/service-cart";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";

export default function NavbarCartIndicator() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    const syncCart = () => {
      setSelectedSlugs(readServiceCartSlugs());
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  if (selectedSlugs.length === 0) return null;

  const allLiveSessions = selectedSlugs.every(
    (slug) => getPurchasableServiceConfig(slug)?.kind === "live_session",
  );
  const IndicatorIcon = allLiveSessions ? CalendarCheck2 : ShoppingBag;

  return (
    <button
      type="button"
      onClick={openServiceCartModal}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3 py-2 text-sm font-medium text-brand-blue/75 transition hover:border-dema-forest/25 hover:text-dema-forest"
    >
      <IndicatorIcon className="h-4 w-4" aria-hidden="true" />
      {allLiveSessions ? "Sélection" : "Panier"}
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-dema-forest px-1.5 text-[11px] font-semibold text-white">
        {selectedSlugs.length}
      </span>
    </button>
  );
}
