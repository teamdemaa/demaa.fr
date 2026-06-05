"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FreeToolBackLink() {
  return (
    <div className="w-full bg-white px-4 pt-4">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/annuaire-outils"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue/55 transition hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à l&apos;annuaire outils
        </Link>
      </div>
    </div>
  );
}
