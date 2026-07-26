import Link from "next/link";
import Navbar from "@/components/Navbar";
import { fulfillOperationalSystemOrder } from "@/lib/operational-system-orders.server";
import { getStripeClient } from "@/lib/stripe.server";

type PurchaseSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export const dynamic = "force-dynamic";

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PurchaseSuccessPage({
  searchParams,
}: PurchaseSuccessPageProps) {
  const sessionId = getParamValue((await searchParams).session_id);
  let result: Awaited<ReturnType<typeof fulfillOperationalSystemOrder>> | null =
    null;

  if (sessionId?.startsWith("cs_")) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(
        sessionId,
      );
      result = await fulfillOperationalSystemOrder(session);
    } catch {
      result = null;
    }
  }

  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-xl rounded-[1.5rem] border border-dema-line bg-dema-paper p-7 shadow-[0_18px_55px_rgba(23,35,29,0.06)] sm:p-10">
          {result?.fulfilled ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Paiement confirmé
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                Votre système est prêt
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                Créez maintenant votre copie personnelle dans Google Drive.
                Le lien a également été envoyé à {result.email}.
              </p>
              <a
                href={result.copyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="demaa-primary-button mt-7 inline-flex w-full items-center justify-center"
              >
                Créer ma copie
              </a>
              {!result.emailSent ? (
                <p className="mt-3 text-xs leading-relaxed text-dema-muted">
                  L’e-mail n’a pas encore pu être envoyé. Conservez cette page
                  et utilisez le bouton ci-dessus.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Vérification du paiement
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-brand-blue">
                Paiement non confirmé
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-dema-muted">
                Nous ne pouvons pas remettre le fichier avec ce lien. Revenez
                sur la page du système ou vérifiez l’e-mail utilisé lors du
                paiement.
              </p>
              <Link
                href="/trouver-mon-systeme"
                className="mt-7 inline-flex text-sm font-semibold text-dema-forest underline underline-offset-4"
              >
                Revenir aux systèmes opérationnels
              </Link>
            </>
          )}
        </section>
      </main>
    </>
  );
}
