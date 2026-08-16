"use client";

import { useState } from "react";
import { deleteCustomerSession } from "@/lib/customer-auth-session.client";

export default function CustomerLogoutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await deleteCustomerSession();
      window.location.assign("/");
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
      {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
