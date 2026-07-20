import CookiePreferencesPanel from "@/components/CookiePreferencesPanel";
import LegalPageLayout from "@/components/LegalPageLayout";
import { LEGAL, LEGAL_COPY } from "@/lib/legal";

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
    <LegalPageLayout
      title="Politique de"
      titleAccent="cookies"
      description="Cette page explique les traceurs, cookies et stockages locaux utilisés sur Demaa.fr, ainsi que vos choix."
    >
      <CookieSection title="1. Responsable et périmètre">
            <p>
              Cette politique s&apos;applique au site {LEGAL.domain}, exploité sous la marque <strong>{LEGAL.brandName}</strong> par <strong>{LEGAL.legalEntityName}</strong>.
            </p>
            <p>{LEGAL_COPY.brandOperatorSentence}</p>
      </CookieSection>

      <CookieSection title="2. Qu&apos;est-ce qu&apos;un cookie ?">
            <p>
              Un cookie est un petit fichier déposé sur votre terminal lorsque vous consultez un site. D&apos;autres technologies proches
              peuvent également être utilisées, comme le stockage local du navigateur ou certains identifiants techniques.
            </p>
      </CookieSection>

      <CookieSection title="3. Cookies et traceurs utilisés sur Demaa.fr">
            <p>À la date de publication de cette page, Demaa.fr utilise principalement :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Vercel Analytics</strong> pour la mesure d&apos;audience du site ;</li>
              <li><strong>Google Analytics</strong> pour l&apos;analyse de fréquentation et des parcours ;</li>
              <li><strong>Meta Pixel</strong> pour la mesure marketing et publicitaire ;</li>
              <li><strong>un stockage local d&apos;attribution Demaa</strong> pour mémoriser pendant 90 jours la première et la dernière source d&apos;acquisition lorsque la mesure d&apos;audience est autorisée ;</li>
              <li><strong>du stockage local navigateur</strong> pour mémoriser certaines informations utiles à l&apos;assistant et à l&apos;expérience utilisateur ;</li>
              <li><strong>des éléments techniques de session ou de sécurité</strong> nécessaires au bon fonctionnement du site.</li>
            </ul>
      </CookieSection>

      <CookieSection title="4. Finalités">
            <ul className="list-disc space-y-2 pl-5">
              <li>mesurer l&apos;usage du site et améliorer les contenus et outils proposés ;</li>
              <li>évaluer l&apos;efficacité des campagnes et des sources d&apos;acquisition ;</li>
              <li>rattacher une première et une dernière source à une demande envoyée volontairement ;</li>
              <li>mémoriser certaines préférences ou informations temporaires côté navigateur ;</li>
              <li>assurer la sécurité, la stabilité et le bon fonctionnement technique du site.</li>
            </ul>
      </CookieSection>

      <CookieSection title="5. Consentement">
            <p>
              Les traceurs strictement nécessaires au fonctionnement du site peuvent être déposés sans consentement préalable.
            </p>
            <p>
              Les outils de mesure d&apos;audience et les traceurs publicitaires non nécessaires, notamment Google Analytics, Meta Pixel et Vercel Analytics lorsqu&apos;ils sont activés,
              ne sont chargés qu&apos;après votre acceptation via le bandeau de consentement.
            </p>
            <p>
              Vous pouvez autoriser séparément la mesure d&apos;audience et la publicité. Un refus n&apos;empêche pas l&apos;envoi d&apos;un formulaire ; dans ce cas, seules les informations minimales disponibles au moment de la demande sont enregistrées et la source peut rester inconnue.
            </p>
      </CookieSection>

      <CookieSection title="6. Durée de conservation">
            <p>
              Les cookies et stockages locaux sont conservés pendant la durée strictement nécessaire à leur finalité, dans la limite des règles applicables
              et des paramètres techniques retenus par les services utilisés.
            </p>
            <p>
              Votre choix de consentement est également mémorisé localement pour éviter de vous redemander votre préférence à chaque visite.
            </p>
            <p>
              Le contexte d&apos;attribution conservé dans le navigateur expire après 90 jours. Le choix de consentement expire après 6 mois.
            </p>
      </CookieSection>

      <CookieSection title="7. Gérer vos choix">
            <p>
              Vous pouvez à tout moment supprimer les cookies et les données stockées localement depuis les réglages de votre navigateur.
            </p>
            <p>
              Vous pouvez également configurer votre navigateur pour bloquer tout ou partie des cookies. Certaines fonctionnalités du site peuvent alors
              être dégradées.
            </p>
            <p>
              Vous pouvez modifier ou retirer votre choix immédiatement avec les commandes ci-dessous. Le retrait arrête les outils concernés et supprime les données d&apos;attribution persistantes ainsi que les cookies analytiques accessibles à Demaa.
            </p>
            <div className="pt-2">
              <CookiePreferencesPanel />
            </div>
      </CookieSection>

      <CookieSection title="8. Contact">
            <p>
              Pour toute question liée aux cookies ou aux traceurs utilisés sur Demaa.fr, vous pouvez écrire à <strong>{LEGAL.email}</strong>.
            </p>
      </CookieSection>
    </LegalPageLayout>
  );
}
