"use client";

import { useState } from "react";
import { deleteCustomerSession } from "@/lib/customer-auth-session.client";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export default function CustomerLogoutButton({
  localeCode = "fr",
}: {
  localeCode?: InterfaceLocaleCode;
}) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await deleteCustomerSession();
      window.location.assign(localeCode === "en" ? "/en" : "/");
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={() => void signOut()}
      className="block w-full whitespace-nowrap px-2 py-1.5 text-left text-sm text-brand-blue transition hover:text-dema-forest disabled:cursor-wait disabled:opacity-60"
    >
      {localeCode === "en"
        ? isSigningOut ? "Signing out…" : "Sign out"
        : isSigningOut ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
