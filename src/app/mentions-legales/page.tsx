import LegalPageLayout from "@/components/LegalPageLayout";
import { LEGAL, LEGAL_COPY } from "@/lib/legal";

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
    <LegalPageLayout
      title="Mentions"
      titleAccent="légales"
      description="Informations légales applicables au site Demaa.fr, à son éditeur et à son hébergement."
    >
      <LegalSection title="1. Éditeur du site">
            <p>
              {LEGAL_COPY.sitePublisherSentence} {LEGAL_COPY.brandOperatorSentence}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Entité juridique :</strong> {LEGAL.legalEntityName}</li>
              <li><strong>Marque exploitée :</strong> {LEGAL.brandName}</li>
              <li><strong>Forme juridique :</strong> {LEGAL.legalStatus}</li>
              <li><strong>Régime :</strong> Micro-entreprise</li>
              <li><strong>Représentante légale :</strong> {LEGAL.legalRepresentative}</li>
              <li><strong>SIREN :</strong> {LEGAL.siren}</li>
              <li><strong>SIRET (siège) :</strong> {LEGAL.siret}</li>
              <li><strong>TVA intracommunautaire :</strong> {LEGAL.vatNumber}</li>
              <li><strong>Inscription au RCS :</strong> inscrit au greffe de {LEGAL.rcsCity} le {LEGAL.rcsRegistrationDate}</li>
              <li><strong>Numéro RCS :</strong> {LEGAL.rcsNumber}</li>
              <li><strong>Inscription au RNE :</strong> inscrite</li>
              <li><strong>Responsable de la publication :</strong> {LEGAL.legalRepresentative}</li>
              <li><strong>Email de contact :</strong> {LEGAL.email}</li>
              <li><strong>Téléphone :</strong> {LEGAL.phone}</li>
              <li><strong>Adresse de l&apos;entreprise :</strong> {LEGAL.address}</li>
            </ul>
      </LegalSection>

      <LegalSection title="2. Hébergement">
            <p>
              Le site est hébergé par <strong>{LEGAL.hostingProviderName}</strong>, {LEGAL.hostingProviderAddress}.
            </p>
            <p>
              Site de l&apos;hébergeur :{" "}
              <a
                href={LEGAL.hostingProviderUrl}
                className="text-brand-coral underline decoration-brand-coral/30 underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                {LEGAL.hostingProviderUrl.replace("https://", "")}
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
              Pour toute question relative au site ou à son éditeur, vous pouvez écrire à <strong>{LEGAL.email}</strong>.
            </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
