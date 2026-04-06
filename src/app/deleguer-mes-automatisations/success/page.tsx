"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type VerificationState =
  | { status: "loading" }
  | {
      status: "success";
      offerLabel: string;
      email: string | null;
      name: string | null;
    }
  | { status: "error"; message: string };

const BOOKING_URL = "https://teamdemaa.fillout.com/t/4QP8VeqUAaus";

export default function DeleguerMesAutomatisationsSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verification, setVerification] = useState<VerificationState>({
    status: "loading",
  });
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setVerification({
        status: "error",
        message:
          "Impossible de verifier votre paiement. Merci d'utiliser le lien de retour Stripe.",
      });
      return;
    }

    void (async () => {
      try {
        const response = await fetch(
          `/api/stripe/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              paid?: boolean;
              offerLabel?: string;
              email?: string | null;
              name?: string | null;
            }
          | null;

        if (!response.ok || !payload?.paid) {
          throw new Error(
            payload?.error ||
              "Le paiement n'a pas pu etre verifie. Merci de contacter Demaa."
          );
        }

        setVerification({
          status: "success",
          offerLabel: payload.offerLabel || "Offre Demaa",
          email: payload.email || null,
          name: payload.name || null,
        });
        setShowBookingModal(true);
      } catch (error) {
        setVerification({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Le paiement n'a pas pu etre verifie. Merci de contacter Demaa.",
        });
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#FFF9F8]">
      <Navbar />
      <main className="px-4 pb-20 pt-8 md:px-6 md:pb-28 md:pt-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-black/5 bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(21,36,69,0.06)] md:px-10 md:py-14">
            {verification.status === "loading" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-coral/10 text-brand-coral">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-brand-blue md:text-4xl">
                  Verification du paiement
                </h1>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  Nous confirmons votre paiement avant d&apos;ouvrir la prise de rendez-vous.
                </p>
              </div>
            )}

            {verification.status === "success" && (
              <div className="space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-brand-blue md:text-4xl">
                  Paiement confirme
                </h1>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  {verification.name ? `Merci ${verification.name}, ` : ""}
                  votre paiement pour <strong>{verification.offerLabel}</strong> a bien ete valide.
                </p>
                <p className="text-sm leading-relaxed text-gray-500 md:text-base">
                  {verification.email
                    ? `Un email de confirmation va etre envoye a ${verification.email}.`
                    : "Vous pouvez maintenant reserver votre rendez-vous."}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="inline-flex items-center justify-center rounded-full bg-brand-blue px-6 py-3 text-sm font-black text-white transition-colors hover:bg-brand-coral"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ouvrir la prise de rendez-vous
                  </button>
                </div>
              </div>
            )}

            {verification.status === "error" && (
              <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight text-brand-blue md:text-4xl">
                  Verification impossible
                </h1>
                <p className="text-sm leading-relaxed text-red-500 md:text-base">
                  {verification.message}
                </p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showBookingModal && verification.status === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="fixed inset-0 z-50 bg-brand-blue/45 backdrop-blur-sm px-5 py-8 md:px-8 md:py-10"
            >
              <div className="flex h-full w-full items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_30px_80px_rgba(21,36,69,0.18)]"
                >
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="absolute right-5 top-5 z-10 text-gray-300 transition-colors hover:text-brand-blue"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="border-b border-black/5 px-6 py-5 md:px-8">
                    <h2 className="text-2xl font-black tracking-tight text-brand-blue">
                      Reserver votre rendez-vous
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500 md:text-base">
                      Choisissez un creneau pour lancer votre automatisation avec l&apos;equipe Demaa.
                    </p>
                  </div>

                  <iframe
                    src={BOOKING_URL}
                    title="Prise de rendez-vous Demaa"
                    className="h-[70vh] w-full border-0"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
