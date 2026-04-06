import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Politique de cookies - Demaa",
  description: "Politique de cookies et traceurs du site Demaa.fr.",
};

function CookieSection({
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

export default function PolitiqueCookiesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F8] pb-20">
        <section className="border-b border-brand-coral/10 bg-brand-coral/5 px-4 pb-12 pt-16 text-center md:pb-14 md:pt-20">
          <h1 className="text-4xl font-black tracking-tight text-brand-blue md:text-5xl">
            Politique de <span className="text-brand-coral">cookies</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
            Cette page explique les traceurs, cookies et stockages locaux utilisés sur Demaa.fr, ainsi que vos choix.
          </p>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-10 md:gap-8 md:pt-14">
          <CookieSection title="1. Qu&apos;est-ce qu&apos;un cookie ?">
            <p>
              Un cookie est un petit fichier déposé sur votre terminal lorsque vous consultez un site. D&apos;autres technologies proches
              peuvent également être utilisées, comme le stockage local du navigateur ou certains identifiants techniques.
            </p>
          </CookieSection>

          <CookieSection title="2. Cookies et traceurs utilisés sur Demaa.fr">
            <p>À la date de publication de cette page, Demaa.fr utilise principalement :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>des traceurs de mesure d&apos;audience</strong> liés à l&apos;hébergement et à l&apos;analyse de fréquentation du site ;</li>
              <li><strong>du stockage local navigateur</strong> pour mémoriser certaines informations utiles à l&apos;assistant et à l&apos;expérience utilisateur ;</li>
              <li><strong>des éléments techniques de session ou de sécurité</strong> nécessaires au bon fonctionnement du site.</li>
            </ul>
          </CookieSection>

          <CookieSection title="3. Finalités">
            <ul className="list-disc space-y-2 pl-5">
              <li>mesurer l&apos;usage du site et améliorer les contenus et outils proposés ;</li>
              <li>mémoriser certaines préférences ou informations temporaires côté navigateur ;</li>
              <li>assurer la sécurité, la stabilité et le bon fonctionnement technique du site.</li>
            </ul>
          </CookieSection>

          <CookieSection title="4. Consentement">
            <p>
              Lorsque les traceurs utilisés sont strictement nécessaires au fonctionnement du site, ils peuvent être déposés sans consentement préalable.
            </p>
            <p>
              Si Demaa ajoute des cookies marketing, publicitaires, de retargeting ou des outils soumis au consentement, un mécanisme de recueil de consentement
              adapté devra être mis en place avant leur dépôt.
            </p>
          </CookieSection>

          <CookieSection title="5. Durée de conservation">
            <p>
              Les cookies et stockages locaux sont conservés pendant la durée strictement nécessaire à leur finalité, dans la limite des règles applicables
              et des paramètres techniques retenus par les services utilisés.
            </p>
          </CookieSection>

          <CookieSection title="6. Gérer vos choix">
            <p>
              Vous pouvez à tout moment supprimer les cookies et les données stockées localement depuis les réglages de votre navigateur.
            </p>
            <p>
              Vous pouvez également configurer votre navigateur pour bloquer tout ou partie des cookies. Certaines fonctionnalités du site peuvent alors
              être dégradées.
            </p>
          </CookieSection>

          <CookieSection title="7. Contact">
            <p>
              Pour toute question liée aux cookies ou aux traceurs utilisés sur Demaa.fr, vous pouvez écrire à <strong>team@demaa.fr</strong>.
            </p>
          </CookieSection>
        </div>
      </main>
    </>
  );
}
