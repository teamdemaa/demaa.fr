import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Mentions légales - Demaa",
  description: "Mentions légales du site Demaa.fr.",
};

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white px-6 py-7 md:px-8 md:py-9">
      <h2 className="text-2xl font-black tracking-tight text-brand-blue">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F8] pb-20">
        <section className="border-b border-brand-coral/10 bg-brand-coral/5 px-4 pb-12 pt-16 text-center md:pb-14 md:pt-20">
          <h1 className="text-4xl font-black tracking-tight text-brand-blue md:text-5xl">
            Mentions <span className="text-brand-coral">légales</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
            Informations légales applicables au site Demaa.fr, à son éditeur et à son hébergement.
          </p>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-10 md:gap-8 md:pt-14">
          <LegalSection title="1. Éditeur du site">
            <p>
              Le site <strong>Demaa.fr</strong> est édité par <strong>Oumou Gory</strong>, entrepreneur individuel exerçant sous l&apos;enseigne <strong>Demaa</strong>.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Forme juridique :</strong> Entrepreneur individuel</li>
              <li><strong>Régime :</strong> Micro-entreprise</li>
              <li><strong>SIREN :</strong> 889 656 906</li>
              <li><strong>SIRET (siège) :</strong> 889 656 906 00027</li>
              <li><strong>TVA intracommunautaire :</strong> FR16889656906</li>
              <li><strong>Inscription au RCS :</strong> inscrit au greffe de Bobigny le 23/10/2024</li>
              <li><strong>Numéro RCS :</strong> 889 656 906 R.C.S. Bobigny</li>
              <li><strong>Inscription au RNE :</strong> inscrite</li>
              <li><strong>Responsable de la publication :</strong> Oumou Gory</li>
              <li><strong>Email de contact :</strong> team@demaa.fr</li>
              <li><strong>Téléphone :</strong> +33 7 82 84 24 35</li>
              <li><strong>Adresse de l&apos;entreprise :</strong> 6 rue du maréchal juin, 95210 Saint Gratien, France</li>
            </ul>
          </LegalSection>

          <LegalSection title="2. Hébergement">
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #1135, Walnut, CA 91789, États-Unis.
            </p>
            <p>
              Site de l&apos;hébergeur :{" "}
              <a
                href="https://vercel.com"
                className="text-brand-coral underline decoration-brand-coral/30 underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                vercel.com
              </a>
            </p>
          </LegalSection>

          <LegalSection title="3. Activité du site">
            <p>
              Demaa.fr propose des contenus, outils gratuits, ressources, formulaires de contact, demandes d&apos;audit, demandes d&apos;automatisation et accompagnements autour de l&apos;organisation, de l&apos;automatisation et des systèmes business.
            </p>
            <p>
              Les informations publiées sur le site sont fournies à titre informatif. Elles ne constituent pas un conseil juridique, fiscal, comptable ou financier individualisé.
            </p>
          </LegalSection>

          <LegalSection title="4. Propriété intellectuelle">
            <p>
              L&apos;ensemble des éléments présents sur le site, notamment les textes, structures, visuels, composants, marques, logos, contenus éditoriaux et ressources, est protégé par le droit de la propriété intellectuelle.
            </p>
            <p>
              Sauf autorisation écrite préalable, toute reproduction, représentation, adaptation, extraction ou réutilisation, totale ou partielle, est interdite.
            </p>
          </LegalSection>

          <LegalSection title="5. Responsabilité">
            <p>
              L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site. Toutefois, il ne peut garantir l&apos;absence totale d&apos;erreurs, d&apos;omissions ou d&apos;indisponibilités.
            </p>
            <p>
              L&apos;utilisateur reste responsable de l&apos;usage qu&apos;il fait des informations et outils proposés. L&apos;éditeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
            </p>
          </LegalSection>

          <LegalSection title="6. Liens externes">
            <p>
              Le site peut contenir des liens vers des sites tiers, outils ou services externes. Demaa ne contrôle pas leur contenu ni leurs politiques et décline toute responsabilité à leur sujet.
            </p>
          </LegalSection>

          <LegalSection title="7. Contact">
            <p>
              Pour toute question relative au site ou à son éditeur, vous pouvez écrire à <strong>team@demaa.fr</strong>.
            </p>
          </LegalSection>
        </div>
      </main>
    </>
  );
}
