"use client";

import Link from "next/link";

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  return (
    <nav className="sticky top-0 z-40 border-b border-brand-coral/10 bg-[#ffffff] py-1">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:pl-14 lg:pr-28">
        <div className="flex justify-between py-3 md:py-4 items-center">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="inline-flex items-center text-xl sm:text-2xl font-medium tracking-tight text-brand-blue shrink-0 z-50 cursor-pointer"
            onClick={(event) => {
              event.preventDefault();
              window.location.assign("/");
            }}
          >
            Demaa<span className="text-brand-coral">.</span>
          </Link>

          {!minimal && (
            <Link
              href="/assistant"
              className="inline-flex items-center whitespace-nowrap rounded-full border border-brand-blue/12 bg-transparent px-5 py-3 text-xs font-medium text-brand-blue transition-colors hover:border-neutral-300 hover:text-neutral-700 md:text-sm"
            >
              <span className="hidden sm:inline">J&apos;ai besoin d&apos;un assistant</span>
              <span className="sm:hidden">Assistant</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
