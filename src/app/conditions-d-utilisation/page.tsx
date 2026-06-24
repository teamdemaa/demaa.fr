import LegalPageLayout from "@/components/LegalPageLayout";
import { LEGAL, LEGAL_COPY } from "@/lib/legal";

export const metadata = {
  title: "Conditions d’utilisation - Demaa",
  description: "Conditions d’utilisation du site et des services Demaa.",
};

function UsageSection({
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

export default function ConditionsUtilisationPage() {
  return (
    <LegalPageLayout
      title="Conditions d’utilisation"
      description="Ces conditions encadrent l’accès et l’usage du site Demaa.fr, de ses contenus, de ses outils et de son espace membre."
    >
      <UsageSection title="1. Périmètre">
            <p>
              Les présentes conditions d&apos;utilisation s&apos;appliquent au site <strong>{LEGAL.domain}</strong> et aux services proposés sous la marque <strong>{LEGAL.brandName}</strong>.
            </p>
            <p>
              {LEGAL_COPY.sitePublisherSentence} {LEGAL_COPY.brandOperatorSentence}
            </p>
      </UsageSection>

      <UsageSection title="2. Acceptation">
            <p>
              L&apos;accès au site et l&apos;utilisation de ses fonctionnalités impliquent l&apos;acceptation des présentes conditions d&apos;utilisation.
            </p>
            <p>
              Si vous n&apos;acceptez pas ces conditions, vous devez cesser d&apos;utiliser le site et les services associés.
            </p>
      </UsageSection>

      <UsageSection title="3. Services concernés">
            <p>
              Demaa peut proposer des contenus éditoriaux, annuaires, outils gratuits, formulaires, demandes d&apos;audit, prestations de service, espace membre et fonctionnalités d&apos;assistant.
            </p>
            <p>
              Sauf mention expresse contraire, les contenus et outils accessibles sur le site sont fournis à titre informatif, opérationnel ou préparatoire.
            </p>
      </UsageSection>

      <UsageSection title="4. Règles de bon usage">
            <ul className="list-disc space-y-2 pl-5">
              <li>utiliser le site de manière loyale, licite et conforme à sa finalité ;</li>
              <li>ne pas porter atteinte au bon fonctionnement du site ou de ses services ;</li>
              <li>ne pas transmettre de contenus illicites, trompeurs, malveillants ou frauduleux ;</li>
              <li>ne pas tenter d&apos;accéder à des espaces, données ou comptes non autorisés ;</li>
              <li>ne pas détourner les formulaires, l&apos;assistant, l&apos;espace membre ou les outils à des fins abusives.</li>
            </ul>
      </UsageSection>

      <UsageSection title="5. Interdictions spécifiques">
            <ul className="list-disc space-y-2 pl-5">
              <li>intrusion, scan, contournement de sécurité ou tentative d&apos;accès non autorisé ;</li>
              <li>scraping, extraction massive ou réutilisation non autorisée des contenus et données ;</li>
              <li>usurpation d&apos;identité, création de faux comptes ou fourniture d&apos;informations inexactes ;</li>
              <li>spam, sollicitations abusives ou envoi automatisé via les formulaires du site ;</li>
              <li>usage des livrables, contenus ou outils dans un cadre contraire à la loi ou aux droits de tiers.</li>
            </ul>
      </UsageSection>

      <UsageSection title="6. Espace membre et accès personnels">
            <p>
              Certaines fonctionnalités peuvent nécessiter un accès personnel, notamment via un lien sécurisé ou un espace membre.
            </p>
            <p>
              Vous êtes responsable de la confidentialité de vos accès, de l&apos;usage fait depuis votre adresse email et de l&apos;exactitude des informations transmises à Demaa.
            </p>
      </UsageSection>

      <UsageSection title="7. Outils, assistant et contenus">
            <p>
              Les outils, recommandations, réponses de l&apos;assistant et contenus mis à disposition sur Demaa ne remplacent pas un conseil juridique, fiscal, comptable ou financier individualisé.
            </p>
            <p>
              Vous restez responsable de la vérification, de l&apos;adaptation et de l&apos;usage des informations, documents, automatisations ou livrables générés ou transmis via le site.
            </p>
      </UsageSection>

      <UsageSection title="8. Services tiers">
            <p>
              Certaines fonctionnalités peuvent s&apos;appuyer sur des services tiers nécessaires au fonctionnement de Demaa, notamment pour l&apos;hébergement, les paiements, les notifications, l&apos;analyse ou certaines fonctionnalités techniques.
            </p>
            <p>
              Demaa ne saurait être responsable des indisponibilités, modifications ou limites propres à ces services tiers en dehors de son contrôle raisonnable.
            </p>
      </UsageSection>

      <UsageSection title="9. Propriété intellectuelle">
            <p>
              Les textes, structures, bases de contenu, visuels, composants, annuaires, modèles, ressources et éléments distinctifs du site sont protégés par la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, extraction, adaptation ou réutilisation non autorisée, totale ou partielle, est interdite.
            </p>
      </UsageSection>

      <UsageSection title="10. Suspension ou restriction d’accès">
            <p>
              Demaa peut suspendre, limiter ou refuser l&apos;accès à tout ou partie du site ou de ses services en cas d&apos;usage abusif, frauduleux, illicite ou contraire aux présentes conditions.
            </p>
      </UsageSection>

      <UsageSection title="11. Responsabilité">
            <p>
              Demaa met en œuvre des moyens raisonnables pour assurer l&apos;accessibilité et le bon fonctionnement du site, sans garantie d&apos;absence totale d&apos;erreur, d&apos;interruption ou d&apos;indisponibilité.
            </p>
            <p>
              L&apos;utilisateur reste responsable de ses décisions, de l&apos;usage des contenus et de l&apos;intégration opérationnelle des informations ou outils obtenus via le site.
            </p>
      </UsageSection>

      <UsageSection title="12. Contact">
            <p>
              Pour toute question relative à l&apos;utilisation du site ou à ces conditions, vous pouvez écrire à <strong>{LEGAL.email}</strong>.
            </p>
      </UsageSection>
    </LegalPageLayout>
  );
}
