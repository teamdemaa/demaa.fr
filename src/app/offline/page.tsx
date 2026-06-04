import Link from "next/link";

export const metadata = {
  title: "Hors ligne - Demaa",
  description: "Cette page est disponible lorsque la connexion est interrompue.",
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Hors ligne
      </p>
      <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
        La connexion semble interrompue.
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        Demaa est installe comme application, mais cette page a besoin du
        reseau pour recuperer ses dernieres donnees. Reviens ici des que la
        connexion est retablie.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex w-fit items-center rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition hover:opacity-90"
      >
        Retour a l&apos;accueil
      </Link>
    </main>
  );
}
