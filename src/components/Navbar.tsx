"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wrench, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const AUDIT_URL = "https://teamdemaa.fillout.com/t/4QP8VeqUAaus";

export default function Navbar({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditMode, setAuditMode] = useState<"choice" | "callback" | "meeting">("choice");
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    sector: "",
  });

  const closeAuditModal = () => {
    setShowAuditModal(false);
    setAuditMode("callback");
    setCallbackSubmitted(false);
  };

  const openAuditModal = () => {
    setShowAuditModal(true);
    setAuditMode("callback");
    setCallbackSubmitted(false);
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "Navbar audit callback",
        }),
      });
    } catch (error) {
      console.error("Callback lead submission failed", error);
    }

    setCallbackSubmitted(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#FFF9F8] border-b border-brand-coral/10 py-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:pl-14 lg:pr-28">
          <div className="flex justify-between py-3 md:py-4 items-center">
            <Link
              href="/"
              aria-label="Retour à l'accueil"
              className="inline-flex items-center text-xl sm:text-2xl font-bold tracking-tight text-brand-blue shrink-0 z-50 cursor-pointer"
              onClick={(event) => {
                if (pathname === "/") {
                  event.preventDefault();
                  window.location.assign("/");
                }
              }}
            >
              Demaa<span className="text-brand-coral">.</span>
            </Link>

            {!minimal && (
              <div className="flex items-center gap-3 md:gap-5">
                <Link
                  href="/outils-gratuits"
                  className="group flex items-center space-x-2 text-brand-blue hover:text-brand-coral transition-all duration-300 font-bold"
                >
                  <Wrench className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden sm:inline">Outils Gratuits</span>
                  <span className="sm:hidden">Outils</span>
                </Link>

                <button
                  type="button"
                  onClick={openAuditModal}
                  className="inline-flex items-center rounded-full bg-brand-blue px-4 py-2 text-xs md:text-sm font-black text-white transition-colors hover:bg-brand-coral whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Demander un audit (offert)</span>
                  <span className="sm:hidden">Audit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showAuditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-blue/50 backdrop-blur-sm px-4"
          >
            <div className="h-full w-full flex items-center justify-center py-6">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                className="relative w-full max-w-4xl rounded-[2rem] border border-black/5 bg-white p-4 md:p-5 shadow-[0_30px_80px_rgba(21,36,69,0.18)]"
              >
                <button
                  onClick={closeAuditModal}
                  className="absolute right-5 top-5 z-10 text-gray-300 transition-colors hover:text-brand-blue"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-3 pt-2 pb-4 md:px-4">
                  <h3 className="text-2xl font-black tracking-tight text-brand-blue">
                    Demander un audit (offert)
                  </h3>
                  <p className="mt-2 max-w-2xl text-gray-500">
                    Laissez vos coordonnées pour être rappelé rapidement, ou basculez sur la prise de rendez-vous si vous préférez choisir un créneau tout de suite.
                  </p>
                </div>

                <div className="px-3 pb-4 md:px-4">
                  <div className="inline-flex rounded-2xl bg-gray-50 p-1 border border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuditMode("callback");
                        setCallbackSubmitted(false);
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                        auditMode === "callback"
                          ? "bg-white text-brand-blue shadow-sm"
                          : "text-gray-400 hover:text-brand-blue"
                      }`}
                    >
                      Être rappelé
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuditMode("meeting")}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                        auditMode === "meeting"
                          ? "bg-white text-brand-blue shadow-sm"
                          : "text-gray-400 hover:text-brand-blue"
                      }`}
                    >
                      Prendre rendez-vous
                    </button>
                  </div>
                </div>

                {auditMode === "callback" && (
                  <div className="px-3 pb-3 md:px-4">
                    {!callbackSubmitted ? (
                      <form onSubmit={handleCallbackSubmit} className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            required
                            type="text"
                            placeholder="Nom"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="demaa-input h-13 rounded-2xl border border-brand-blue/10 px-5 text-sm shadow-none"
                          />
                          <input
                            required
                            type="text"
                            placeholder="Entreprise"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="demaa-input h-13 rounded-2xl border border-brand-blue/10 px-5 text-sm shadow-none"
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            required
                            type="email"
                            placeholder="Email pro"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="demaa-input h-13 rounded-2xl border border-brand-blue/10 px-5 text-sm shadow-none"
                          />
                          <input
                            required
                            type="tel"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="demaa-input h-13 rounded-2xl border border-brand-blue/10 px-5 text-sm shadow-none"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Secteur d'activité"
                          value={formData.sector}
                          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                          className="demaa-input h-13 w-full rounded-2xl border border-brand-blue/10 px-5 text-sm shadow-none"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-2xl bg-brand-blue py-4 text-sm font-black text-white transition-colors hover:bg-brand-coral"
                        >
                          Demander à être rappelé
                        </button>
                      </form>
                    ) : (
                      <div className="rounded-[1.5rem] border border-brand-coral/15 bg-[#FFF9F8] px-6 py-10 text-center">
                        <div className="text-xl font-black text-brand-blue">C&apos;est noté</div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-500">
                          Merci, nous revenons vers vous rapidement pour parler des tâches à automatiser en priorité.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {auditMode === "meeting" && (
                  <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-gray-50">
                    <iframe
                      src={AUDIT_URL}
                      title="Prendre rendez-vous"
                      className="h-[62vh] min-h-[520px] w-full bg-white"
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
