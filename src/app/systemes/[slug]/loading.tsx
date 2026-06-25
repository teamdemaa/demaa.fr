import Navbar from "@/components/Navbar";

function LoadingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="demaa-card flex min-h-[14rem] flex-col rounded-[1.15rem] p-5 text-left">
      <div className="h-10 w-10 animate-pulse rounded-full bg-dema-sage/70" />
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-dema-muted">
        {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-dema-muted">
        {description}
      </p>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <div className="mt-4">
            <div className="h-10 w-56 animate-pulse rounded-full bg-dema-sage/60" />
            <div className="mt-6 h-12 w-72 animate-pulse rounded-[1rem] bg-dema-sage/60" />
            <div className="mt-4 max-w-2xl space-y-2">
              <div className="h-4 animate-pulse rounded-full bg-dema-sage/45" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-dema-sage/45" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Chargement", "Mise à jour", "Ouverture"].map((label) => (
                <div
                  key={label}
                  className="h-10 w-28 animate-pulse rounded-full bg-dema-sage/55"
                />
              ))}
            </div>

            <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
              {[
                "Outils",
                "Fournisseurs",
                "Expert comptable",
                "Financement",
                "Réseau pro",
                "Ressources",
                "Formation",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue/55"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <LoadingCard
                title="Chargement du système"
                description="On prépare les outils, recommandations et contenus utiles pour cette activité."
              />
              <LoadingCard
                title="Récupération des données"
                description="Les blocs métier et les annuaires associés arrivent dans un instant."
              />
              <LoadingCard
                title="Ouverture de la page"
                description="La page système se construit avec ses recommandations adaptées."
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
