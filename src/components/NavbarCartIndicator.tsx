"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CART_UPDATED_EVENT, readServiceCartSlugs } from "@/lib/service-cart";

export default function NavbarCartIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const syncCart = () => {
      setCount(readServiceCartSlugs().length);
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_UPDATED_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
    };
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/annuaire-services?panier=1"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3 py-2 text-sm font-medium text-brand-blue/75 transition hover:border-dema-forest/25 hover:text-dema-forest"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      Panier
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-dema-forest px-1.5 text-[11px] font-semibold text-white">
        {count}
      </span>
    </Link>
  );
}
