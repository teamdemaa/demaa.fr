import DemaaWordmark from "@/components/DemaaWordmark";

export function BrandLogoPreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dema-cream px-6 py-16">
      <div className="flex w-full max-w-5xl items-center justify-center rounded-[2rem] border border-dema-line/70 bg-dema-cream px-10 py-24">
        <DemaaWordmark className="text-[clamp(4.25rem,12.75vw,8.5rem)]" />
      </div>
    </div>
  );
}

export function BrandMiniaturePreview() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dema-cream px-6 py-16 text-brand-blue">
      <div className="flex w-full max-w-6xl flex-col items-center rounded-[2rem] border border-dema-line/70 bg-dema-cream px-10 py-14 text-center md:px-14 md:py-18">
        <div className="max-w-5xl">
          <h1 className="text-[clamp(3.8rem,8vw,6.2rem)] leading-[0.94] tracking-tight">
            <span className="demaa-hero-title text-dema-forest">
              Structurez votre entreprise
            </span>
            <br />
            <span className="font-sans text-brand-blue/86">
              avec les bons systèmes
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-2xl leading-[1.45] text-dema-muted">
            Organisez votre entreprise avec les bons processus et outils pour
            reprendre le contrôle, mieux déléguer et soutenir une croissance
            durable.
          </p>
        </div>
      </div>
    </div>
  );
}
