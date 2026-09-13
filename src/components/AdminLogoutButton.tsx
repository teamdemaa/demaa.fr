"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAdminSession } from "@/lib/admin-auth-session.client";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    try {
      await deleteAdminSession();
      router.replace("/admin/connexion");
      router.refresh();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={() => void signOut()}
      className="inline-flex min-h-10 shrink-0 items-center px-2 text-xs font-medium text-dema-forest transition hover:text-brand-blue disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:underline sm:text-sm"
    >
      {isSigningOut ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
