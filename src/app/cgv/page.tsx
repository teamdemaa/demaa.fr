import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CGV - Demaa",
  description: "Conditions générales de vente des prestations proposées par Demaa.",
};

function CgvSection({
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

export default function CgvPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFF9F8] pb-20">
        <section className="border-b border-brand-coral/10 bg-brand-coral/5 px-4 pb-12 pt-16 text-center md:pb-14 md:pt-20">
          <h1 className="text-4xl font-black tracking-tight text-brand-blue md:text-5xl">
            Conditions générales de <span className="text-brand-coral">vente</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
            Ces CGV encadrent les prestations et offres commerciales proposées par Demaa, notamment les missions d&apos;automatisation, audits et crédits d&apos;automatisation.
          </p>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-10 md:gap-8 md:pt-14">
          <CgvSection title="1. Identité du vendeur">
            <p>
              Les prestations sont proposées par <strong>Oumou Gory</strong>, entrepreneur individuel exerçant sous l&apos;enseigne <strong>Demaa</strong>.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Forme juridique :</strong> Entrepreneur individuel</li>
              <li><strong>Régime :</strong> Micro-entreprise</li>
              <li><strong>SIREN :</strong> 889 656 906</li>
              <li><strong>SIRET :</strong> 889 656 906 00027</li>
              <li><strong>TVA intracommunautaire :</strong> FR16889656906</li>
              <li><strong>Adresse :</strong> 6 rue du maréchal juin, 95210 Saint Gratien, France</li>
              <li><strong>Email :</strong> team@demaa.fr</li>
            </ul>
          </CgvSection>

          <CgvSection title="2. Objet">
            <p>
              Les présentes CGV régissent les prestations vendues par Demaa, en particulier les audits, cadrages, missions d&apos;automatisation, accompagnements,
              prestations liées aux crédits d&apos;automatisation et plus largement les services professionnels proposés via le site.
            </p>
            <p>
              Les outils gratuits accessibles sur le site sont fournis à titre informatif ou utilitaire et ne constituent pas, à eux seuls, une prestation vendue.
            </p>
          </CgvSection>

          <CgvSection title="3. Commande et formation du contrat">
            <p>
              Toute commande peut intervenir via un formulaire, un échange écrit, un devis, une page dédiée ou tout autre moyen proposé par Demaa.
            </p>
            <p>
              Le contrat est formé à compter de l&apos;acceptation expresse de l&apos;offre commerciale, du devis ou du paiement selon le cas.
            </p>
          </CgvSection>

          <CgvSection title="4. Crédits d&apos;automatisation">
            <p>
              Les crédits d&apos;automatisation constituent une unité commerciale permettant de cadrer et réaliser des automatisations selon leur niveau de complexité.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>un processus simple peut représenter environ <strong>2 crédits</strong> ;</li>
              <li>un processus intermédiaire peut représenter environ <strong>3 à 4 crédits</strong> ;</li>
              <li>un processus complet ou plus dense peut nécessiter <strong>5 crédits et plus</strong>.</li>
            </ul>
            <p>
              Le nombre exact de crédits consommés dépend du cadrage réel de la mission, de la densité des données, des outils à connecter et du niveau de logique métier demandé.
            </p>
          </CgvSection>

          <CgvSection title="5. Prix">
            <p>
              Les prix applicables sont ceux affichés ou communiqués au moment de la commande. Sauf mention contraire, ils sont exprimés en euros.
            </p>
            <p>
              Les offres, packs et conditions tarifaires peuvent être modifiés à tout moment pour l&apos;avenir, sans effet rétroactif sur une commande déjà acceptée.
            </p>
          </CgvSection>

          <CgvSection title="6. Modalités de paiement">
            <p>
              Le paiement peut être exigé comptant à la commande, selon les modalités précisées sur le devis, la page de vente, le lien de paiement ou les échanges commerciaux.
            </p>
            <p>
              En cas de retard de paiement, Demaa se réserve le droit de suspendre l&apos;exécution des prestations jusqu&apos;à régularisation.
            </p>
          </CgvSection>

          <CgvSection title="7. Exécution des prestations">
            <p>
              Demaa met en œuvre les moyens raisonnables nécessaires à la bonne exécution des prestations, dans le périmètre convenu avec le client.
            </p>
            <p>
              Le client s&apos;engage à fournir en temps utile les informations, accès, validations et éléments nécessaires à la mission. Les délais peuvent être ajustés si ces éléments manquent ou sont transmis tardivement.
            </p>
          </CgvSection>

          <CgvSection title="8. Obligations du client">
            <ul className="list-disc space-y-2 pl-5">
              <li>fournir des informations exactes et à jour ;</li>
              <li>transmettre les accès, contenus et validations nécessaires ;</li>
              <li>vérifier que les automatisations mises en place correspondent bien à ses contraintes métier, légales et opérationnelles ;</li>
              <li>utiliser les prestations dans un cadre licite et conforme à ses obligations propres.</li>
            </ul>
          </CgvSection>

          <CgvSection title="9. Propriété intellectuelle">
            <p>
              Les méthodes, contenus, documents, structures, composants, modèles et éléments créatifs ou techniques de Demaa restent sa propriété, sauf cession expresse écrite.
            </p>
            <p>
              Le client bénéficie des droits d&apos;usage nécessaires sur les livrables remis dans le cadre de la prestation, pour ses besoins propres et dans le périmètre convenu.
            </p>
          </CgvSection>

          <CgvSection title="10. Responsabilité">
            <p>
              Demaa est tenue à une obligation de moyens. Sa responsabilité ne pourra être engagée en cas d&apos;usage inadapté des livrables, d&apos;erreur provenant d&apos;un tiers,
              d&apos;outil externe, d&apos;accès fourni par le client ou de décision métier prise par le client.
            </p>
            <p>
              En tout état de cause, la responsabilité de Demaa est limitée au montant effectivement payé au titre de la prestation concernée, sauf disposition légale contraire d&apos;ordre public.
            </p>
          </CgvSection>

          <CgvSection title="11. Rétractation et médiation">
            <p>
              Les prestations de Demaa sont principalement destinées à une clientèle professionnelle. Si certaines offres venaient à être proposées à des consommateurs,
              les mentions relatives au droit de rétractation et au médiateur de la consommation devront être complétées selon le cadre effectivement appliqué.
            </p>
          </CgvSection>

          <CgvSection title="12. Droit applicable et juridiction compétente">
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties rechercheront d&apos;abord une solution amiable.
            </p>
            <p>
              À défaut d&apos;accord amiable, compétence est attribuée aux juridictions compétentes dans les conditions prévues par la loi.
            </p>
          </CgvSection>
        </div>
      </main>
    </>
  );
}
