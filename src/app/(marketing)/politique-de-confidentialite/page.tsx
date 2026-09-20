import type { Metadata } from "next";
import LegalPageLayout from "@/components/LegalPageLayout";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité - sini",
  description: "Comment sini traite les données de contact et de reprise.",
  robots: { index: false, follow: false },
};

function PrivacySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-[#d8e0e7] bg-white px-6 py-7 md:px-8 md:py-9">
      <h2 className="text-2xl font-medium tracking-tight text-[#17283e]">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#627181] md:text-base">{children}</div>
    </section>
  );
}

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de"
      titleAccent="confidentialité"
      description="Les données utilisées pour présenter des opportunités et répondre aux demandes sur sini."
    >
      <PrivacySection title="1. Responsable du traitement">
        <p><strong>{LEGAL.legalEntityName}</strong>, {LEGAL.legalStatus.toLowerCase()}, exploite sini. C&apos;est la même entreprise éditrice que pour DEMAA, sous le nom commercial {LEGAL.tradeName}.</p>
        <p>Adresse : {LEGAL.address}. SIREN : {LEGAL.siren}. Contact pour vos droits : <a href={`mailto:${LEGAL.email}`} className="underline">{LEGAL.email}</a>.</p>
      </PrivacySection>
      <PrivacySection title="2. Données et finalités">
        <p>Lorsque les formulaires seront activés, sini pourra traiter les coordonnées et les informations que vous lui transmettez pour répondre à une demande de reprise, de vente ou de conseil : nom, adresse e-mail, téléphone, entreprise, projet, critères de recherche, message et annonce concernée.</p>
        <p>Si vous créez une alerte, votre adresse e-mail et vos critères servent à vous envoyer les nouvelles opportunités correspondantes et à gérer cette alerte. Les informations techniques nécessaires à la sécurité du site et à la prévention des abus peuvent également être traitées.</p>
        <p>Ces traitements reposent sur votre demande de contact ou de service et, pour la sécurité et le suivi opérationnel, sur l&apos;intérêt légitime de l&apos;éditeur. Les demandes ne vous inscrivent pas automatiquement à une newsletter.</p>
      </PrivacySection>
      <PrivacySection title="3. Destinataires et conservation">
        <p>Les informations sont accessibles aux personnes habilitées à traiter votre demande. Les prestataires techniques nécessaires peuvent intervenir pour l&apos;hébergement, le stockage et l&apos;envoi des messages, notamment Vercel, Firebase et Resend lorsque ces services sont configurés pour sini.</p>
        <p>Les demandes de contact sont conservées le temps nécessaire à leur traitement et à leur suivi. Les critères d&apos;alerte sont conservés jusqu&apos;à la suppression de l&apos;alerte. Les journaux techniques sont conservés pour la durée nécessaire à la sécurité et au fonctionnement du site.</p>
        <p>Une demande de mise en relation n&apos;est transmise au contact de l&apos;entreprise concernée qu&apos;après vérification et échange avec vous.</p>
      </PrivacySection>
      <PrivacySection title="4. Vos droits">
        <p>Vous pouvez demander l&apos;accès, la rectification ou l&apos;effacement de vos données, vous opposer à certains traitements ou demander leur limitation. La portabilité s&apos;applique dans les cas prévus par la réglementation.</p>
        <p>Écrivez à <a href={`mailto:${LEGAL.email}`} className="underline">{LEGAL.email}</a>. Si votre demande n&apos;aboutit pas, vous pouvez saisir la CNIL.</p>
      </PrivacySection>
      <PrivacySection title="5. Liens externes et mises à jour">
        <p>Les liens vers des sites tiers renvoient vers les politiques de leurs propres éditeurs. Cette page sera mise à jour avant l&apos;ouverture des formulaires si les prestataires, les durées ou les usages évoluent.</p>
      </PrivacySection>
    </LegalPageLayout>
  );
}
