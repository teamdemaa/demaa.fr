import {
  composeProcessDraft,
  type IndustrializedContentItem,
  type IndustrializedProcessDefinition,
  type ProcessContentPatch,
  type ProcessDraft,
} from "@/lib/process-industrialization";

type DigitalCommerceProcessKey =
  | "cap"
  | "decisions"
  | "access"
  | "acquisition"
  | "conversion"
  | "complaint"
  | "catalog"
  | "operations"
  | "returns"
  | "team"
  | "profitability"
  | "payables"
  | "cash";

const item = (
  type: IndustrializedContentItem["type"],
  label: string,
): IndustrializedContentItem => ({ type, label });

const def = (
  objective: string,
  trigger: string,
  expectedResult: string,
  defaultOwner: string,
  cadence: string,
): IndustrializedProcessDefinition => ({
  objective,
  trigger,
  expectedResult,
  defaultOwner,
  cadence,
});

const definitionsByKey: Record<
  DigitalCommerceProcessKey,
  IndustrializedProcessDefinition
> = {
  cap: def(
    "Choisir les offres, canaux et clients qui doivent porter une croissance rentable.",
    "Début de trimestre ou écart important.",
    "Des priorités chiffrées compatibles avec la capacité opérationnelle.",
    "Dirigeant",
    "Trimestrielle",
  ),
  decisions: def(
    "Déléguer les arbitrages courants sans bloquer les ventes ni exposer les clients.",
    "Incident, rupture, contestation, dépense ou opportunité.",
    "Une décision rapide, tracée et prise dans une limite connue.",
    "Dirigeant ou responsable des opérations",
    "Mensuelle",
  ),
  access: def(
    "Maintenir les accès, données et indicateurs indispensables à l’activité.",
    "Arrivée, départ, incident ou revue d’activité.",
    "Des droits maîtrisés et une information exploitable par les remplaçants.",
    "Responsable des opérations",
    "Mensuelle",
  ),
  acquisition: def(
    "Attirer et activer les publics utiles avec un coût et une qualité mesurables.",
    "Lancement de campagne, offre ou canal.",
    "Un flux qualifié suivi jusqu’à la première transaction.",
    "Responsable acquisition",
    "Hebdomadaire",
  ),
  conversion: def(
    "Transformer les visites qualifiées en commandes sans créer de promesse trompeuse.",
    "Visite d’une offre ou abandon du parcours d’achat.",
    "Un parcours clair, mesuré et cohérent avec le stock et la livraison.",
    "Responsable e-commerce",
    "Hebdomadaire",
  ),
  complaint: def(
    "Traiter une réclamation ou un litige à partir des faits, responsabilités et preuves.",
    "Insatisfaction, contestation, signalement ou demande de remboursement.",
    "Une réponse tracée et une cause opérationnelle corrigée.",
    "Responsable support",
    "À chaque demande",
  ),
  catalog: def(
    "Publier des offres exactes, disponibles et conformes aux règles applicables.",
    "Création ou modification d’une offre.",
    "Une offre contrôlée avant sa mise en ligne.",
    "Responsable catalogue",
    "Quotidienne",
  ),
  operations: def(
    "Exécuter les opérations et incidents sans perdre une commande ni une preuve.",
    "Commande, publication, signalement ou événement opérationnel.",
    "Une exécution suivie avec une prochaine action visible.",
    "Responsable des opérations",
    "Quotidienne",
  ),
  returns: def(
    "Coordonner les retours, remboursements et parties prenantes jusqu’à leur clôture.",
    "Retour, annulation, non-conformité ou blocage de commande.",
    "Un dossier clôturé avec statut, responsabilité et mouvement financier rapprochés.",
    "Responsable opérations ou support",
    "À chaque dossier",
  ),
  team: def(
    "Organiser l’équipe pour que support, catalogue et opérations continuent sans leur titulaire.",
    "Absence, surcharge, changement d’équipe ou pic d’activité.",
    "Une reprise possible avec les accès, priorités et limites utiles.",
    "Responsable d’équipe",
    "Hebdomadaire",
  ),
  profitability: def(
    "Connaître la marge réelle par offre, canal et transaction.",
    "Dépense, vente, remboursement ou clôture mensuelle.",
    "Des décisions de prix et d’acquisition fondées sur la marge contributive.",
    "Dirigeant ou responsable financier",
    "Mensuelle",
  ),
  payables: def(
    "Payer les fournisseurs et partenaires à partir de montants justifiés.",
    "Facture, échéance ou demande de règlement.",
    "Des paiements validés, affectés et rapprochés.",
    "Responsable administratif",
    "Hebdomadaire",
  ),
  cash: def(
    "Sécuriser les encaissements, remboursements et rapprochements.",
    "Paiement, reversement, remboursement ou écart.",
    "Chaque mouvement est rattaché à une transaction et à son statut.",
    "Responsable financier",
    "Quotidienne",
  ),
};

const commonContent: Record<
  Exclude<DigitalCommerceProcessKey, "conversion">,
  IndustrializedContentItem[]
> = {
  cap: [
    item("implementation_action", "Choisir les offres, segments, canaux et zones qui doivent porter la croissance"),
    item("implementation_action", "Fixer des objectifs de volume, chiffre d’affaires, marge, réachat et qualité de service"),
    item("operational_step", "Comparer la demande visée au catalogue, à la capacité opérationnelle et à la trésorerie"),
    item("recurring_control", "Comparer chaque mois objectifs, trafic, activation, transactions, marge et rétention"),
    item("recurring_control", "Mesurer par segment le coût d’acquisition, le panier, les incidents et la valeur client"),
    item("operating_rule", "Ne pas ouvrir un canal ou une offre sans propriétaire, objectif, marge cible et capacité"),
  ],
  decisions: [
    item("implementation_action", "Écrire les décisions déléguées sur prix, remboursement, geste client, suspension et dépense"),
    item("operational_step", "Classer l’arbitrage selon client touché, obligation, fraude, impact financier et urgence"),
    item("operational_step", "Appliquer la mesure conservatoire autorisée puis informer les personnes concernées"),
    item("operating_rule", "Escalader immédiatement fraude importante, donnée exposée, produit dangereux ou fonds inexpliqués"),
    item("recurring_control", "Tracer décision, motif, auteur, heure, montant et résultat"),
    item("recurring_control", "Revoir chaque mois les décisions remontées inutilement ou prises hors limite"),
  ],
  access: [
    item("implementation_action", "Créer un registre des outils, propriétaires, accès, rôles, sauvegardes et contacts"),
    item("operational_step", "Attribuer un droit individuel limité à la mission réellement exercée"),
    item("operational_step", "Retirer ou réattribuer les droits dès un départ ou un changement de rôle"),
    item("recurring_control", "Tester chaque mois les accès critiques, exports, alertes et moyens de récupération"),
    item("operating_rule", "Ne jamais partager un compte nominatif ni conserver un accès sans propriétaire identifié"),
  ],
  acquisition: [
    item("implementation_action", "Créer un plan d’acquisition avec cible, proposition, canal, budget, message et page d’arrivée"),
    item("operational_step", "Vérifier que la promesse publicitaire correspond à l’offre réellement accessible"),
    item("operational_step", "Marquer la source et suivre le parcours jusqu’à l’activation ou la première transaction"),
    item("recurring_control", "Comparer chaque semaine dépenses, visites qualifiées, activations, transactions et marge"),
    item("recurring_control", "Couper ou corriger un canal qui attire du volume non qualifié ou durablement non rentable"),
    item("operating_rule", "Ne pas piloter l’acquisition au clic seul ; relier chaque canal à une transaction et à sa marge"),
  ],
  complaint: [
    item("implementation_action", "Créer un registre avec transaction, demandeur, motif, pièces, délai, réponse et correction"),
    item("operational_step", "Accuser réception et sécuriser immédiatement le paiement, la livraison ou l’offre si nécessaire"),
    item("operational_step", "Comparer offre, commande, paiement, messages, suivi, preuves et règles applicables"),
    item("operational_step", "Répondre avec faits établis, responsabilité, action, délai et interlocuteur"),
    item("recurring_control", "Vérifier après clôture que remboursement, retour, correction ou information a été exécuté"),
    item("recurring_control", "Analyser chaque mois motifs, délais, remboursements, récidives et dossiers réouverts"),
  ],
  catalog: [
    item("implementation_action", "Créer une fiche offre avec titre, description, prix, disponibilité, visuels, conditions et responsable"),
    item("operational_step", "Vérifier identité de l’offre, caractéristiques essentielles, variantes et informations obligatoires"),
    item("operational_step", "Contrôler prix total, stock ou capacité, délai, livraison et conditions de retour avant publication"),
    item("operational_step", "Relire visuels et promesses pour retirer toute information non démontrable"),
    item("recurring_control", "Dépublier ou corriger rapidement les offres indisponibles, erronées, signalées ou obsolètes"),
    item("operating_rule", "Une offre ne reste pas en ligne sans propriétaire, source de vérité et date de contrôle"),
  ],
  operations: [
    item("implementation_action", "Créer une vue opérationnelle avec transaction, statut, paiement, responsable, incident et prochaine action"),
    item("operational_step", "Contrôler les prérequis avant de confirmer l’opération au client"),
    item("operational_step", "Tracer chaque changement de statut avec date, auteur, motif et preuve utile"),
    item("operational_step", "Informer rapidement les parties lorsqu’un délai, un prix ou un résultat change"),
    item("recurring_control", "Contrôler chaque jour les transactions bloquées, en retard, sans preuve ou sans propriétaire"),
    item("operating_rule", "Un statut ouvert doit toujours avoir une prochaine action et une échéance"),
  ],
  returns: [
    item("implementation_action", "Créer un parcours de retour et remboursement avec motif, éligibilité, preuve, décision et délai"),
    item("operational_step", "Distinguer annulation, rétractation applicable, non-conformité, dommage et geste commercial"),
    item("operational_step", "Donner une consigne écrite sur envoi, collecte, preuve, délai et prise en charge des frais"),
    item("operational_step", "Déclencher le mouvement financier uniquement à partir du statut et de la décision vérifiés"),
    item("recurring_control", "Rapprocher chaque semaine retours physiques, remboursements, avoirs et transactions"),
    item("operating_rule", "Ne jamais clôturer un dossier tant que le client et le mouvement financier ont des statuts contradictoires"),
  ],
  team: [
    item("implementation_action", "Créer une fiche de passation avec files d’attente, priorités, accès, seuils et contacts"),
    item("operational_step", "Affecter chaque file et chaque contrôle à un titulaire et un remplaçant"),
    item("operational_step", "Transmettre les dossiers sensibles avec faits, pièces, décision attendue et prochaine action"),
    item("operational_step", "Renforcer l’équipe avant campagne, pic saisonnier, lancement ou incident majeur"),
    item("operating_rule", "Ne pas donner au remplaçant un droit supérieur à celui nécessaire au rôle repris"),
    item("recurring_control", "Tester chaque trimestre la reprise du support et des opérations sans leur titulaire"),
  ],
  profitability: [
    item("implementation_action", "Créer un compte de marge par offre et canal avec revenus, coûts variables et coûts d’acquisition"),
    item("operational_step", "Affecter chaque vente, remise, frais, remboursement et coût au bon canal et à la bonne offre"),
    item("operational_step", "Calculer la marge contributive après paiement, opération, support, retour et acquisition"),
    item("recurring_control", "Comparer chaque mois volume, panier, marge, remboursement et coût d’acquisition"),
    item("recurring_control", "Identifier offres, canaux et segments qui détruisent de la marge malgré leur volume"),
    item("operating_rule", "Ne pas augmenter le budget d’un canal tant que sa marge et ses remboursements ne sont pas connus"),
  ],
  payables: [
    item("implementation_action", "Créer un échéancier avec fournisseur, période, pièce, montant, validation et date de paiement"),
    item("operational_step", "Comparer facture, commande, service rendu, transaction concernée et conditions convenues"),
    item("operational_step", "Faire valider l’écart ou l’avoir avant paiement"),
    item("recurring_control", "Revoir chaque semaine échéances, doublons, litiges, avoirs et trésorerie disponible"),
    item("operating_rule", "Ne pas payer une dépense sans fournisseur identifié, pièce et rattachement vérifiable"),
  ],
  cash: [
    item("implementation_action", "Relier chaque mouvement à une transaction, un payeur, un bénéficiaire, des frais et un statut"),
    item("operational_step", "Rapprocher paiement, remboursement, contestation et versement avec le relevé du prestataire"),
    item("recurring_control", "Traiter chaque jour les paiements échoués, doublons, écarts, contestations et montants suspendus"),
    item("operating_rule", "Ne pas corriger un écart financier sans conserver le mouvement d’origine et son motif"),
  ],
};

const conversionContent: IndustrializedContentItem[] = [
  item("implementation_action", "Créer un parcours d’achat avec offre, panier, identification, livraison, paiement et confirmation"),
  item("operational_step", "Afficher avant paiement prix total, disponibilité, délai, livraison, retours et coordonnées du vendeur"),
  item("operational_step", "Vérifier sur mobile la compréhension des variantes, quantités, frais et bouton de commande"),
  item("operational_step", "Envoyer après paiement une confirmation avec récapitulatif, référence et prochaine étape"),
  item("recurring_control", "Analyser chaque semaine abandon, erreurs de paiement, conversion, panier et motifs de contact"),
  item("operating_rule", "Le client doit comprendre qu’il s’engage à payer avant de valider définitivement sa commande"),
];

export type DigitalCommerceProfile = {
  slug: "e-commerce" | "marketplace";
  name: string;
  family: "ecommerce" | "marketplace";
  reviewState: "internal_review_complete";
  sourceUrl: string;
  processIds: Partial<Record<DigitalCommerceProcessKey, string>> &
    Record<
      Exclude<DigitalCommerceProcessKey, "conversion">,
      string
    >;
  growthPriorities: string;
  delegatedDecisions: string;
  accessRisks: string;
  acquisitionFrame: string;
  activationProof: string;
  complaintEvidence: string;
  catalogFrame: string;
  catalogChecks: string;
  operationsFrame: string;
  operationsProof: string;
  returnsFrame: string;
  replacementChecks: string;
  marginRisks: string;
  paymentProof: string;
  complianceFrame: string;
};

function buildCoreContent(
  profile: DigitalCommerceProfile,
): Record<string, IndustrializedContentItem[]> {
  const entries = Object.entries(commonContent).map(([key, items]) => [
    profile.processIds[key as keyof typeof commonContent],
    items.map((entry) => ({ ...entry })),
  ]);

  if (profile.processIds.conversion) {
    entries.splice(4, 0, [
      profile.processIds.conversion,
      conversionContent.map((entry) => ({ ...entry })),
    ]);
  } else {
    const extraItems: Partial<
      Record<
        Exclude<DigitalCommerceProcessKey, "conversion">,
        IndustrializedContentItem
      >
    > = {
      acquisition: item("recurring_control", "Mesurer séparément acquisition et activation des deux côtés de la place de marché"),
      catalog: item("operating_rule", "Suspendre l’offre ou le vendeur lorsqu’une vérification critique manque ou qu’un risque sérieux apparaît"),
      operations: item("operational_step", "Qualifier chaque signalement, conserver sa preuve et appliquer la mesure proportionnée"),
      returns: item("operational_step", "Coordonner acheteur, vendeur et prestataire de paiement sans masquer qui doit agir"),
      profitability: item("operational_step", "Rapprocher volume d’affaires, commission, frais, remboursements, incitations et support"),
      cash: item("recurring_control", "Rapprocher chaque reversement vendeur avec transactions, commissions, remboursements et réserves"),
    };

    for (const [key, extra] of Object.entries(extraItems)) {
      const processId =
        profile.processIds[key as Exclude<DigitalCommerceProcessKey, "conversion">];
      const entry = entries.find(([id]) => id === processId);
      if (entry && extra) {
        (entry[1] as IndustrializedContentItem[]).push(extra);
      }
    }
  }

  return Object.fromEntries(entries);
}

export function generateDigitalCommerceCoreDraft(
  profile: DigitalCommerceProfile,
): ProcessDraft {
  const processEntries = Object.entries(profile.processIds).filter(
    (entry): entry is [DigitalCommerceProcessKey, string] => Boolean(entry[1]),
  );

  return {
    definitionsById: Object.fromEntries(
      processEntries.map(([key, processId]) => [
        processId,
        { ...definitionsByKey[key] },
      ]),
    ),
    contentByProcessId: buildCoreContent(profile),
  };
}

const patches = (
  profile: DigitalCommerceProfile,
): ProcessContentPatch[] => [
  { processId: profile.processIds.cap, contentIndex: 0, label: `Choisir les priorités de croissance : ${profile.growthPriorities}` },
  { processId: profile.processIds.decisions, contentIndex: 0, label: `Déléguer explicitement : ${profile.delegatedDecisions}` },
  { processId: profile.processIds.access, contentIndex: 3, label: `Tester les accès et risques critiques : ${profile.accessRisks}` },
  { processId: profile.processIds.acquisition, contentIndex: 0, label: `Construire l’acquisition avec : ${profile.acquisitionFrame}` },
  { processId: profile.processIds.acquisition, contentIndex: 2, label: `Relier l’activation à une preuve : ${profile.activationProof}` },
  { processId: profile.processIds.complaint, contentIndex: 0, label: `Constituer le dossier avec : ${profile.complaintEvidence}` },
  { processId: profile.processIds.catalog, contentIndex: 0, label: `Structurer chaque offre avec : ${profile.catalogFrame}` },
  { processId: profile.processIds.catalog, contentIndex: 1, label: `Contrôler avant publication : ${profile.catalogChecks}` },
  { processId: profile.processIds.operations, contentIndex: 0, label: `Piloter les opérations avec : ${profile.operationsFrame}` },
  { processId: profile.processIds.operations, contentIndex: 2, label: `Conserver comme preuve : ${profile.operationsProof}` },
  { processId: profile.processIds.returns, contentIndex: 0, label: `Traiter les retours et incidents avec : ${profile.returnsFrame}` },
  { processId: profile.processIds.team, contentIndex: 1, label: `Prévoir le remplacement sur : ${profile.replacementChecks}` },
  { processId: profile.processIds.profitability, contentIndex: 1, label: `Affecter précisément les risques de marge : ${profile.marginRisks}` },
  { processId: profile.processIds.cash, contentIndex: 0, label: `Justifier chaque flux avec : ${profile.paymentProof}` },
  { processId: profile.processIds.access, contentIndex: 0, label: `Tenir à jour les obligations et accès : ${profile.complianceFrame}` },
];

export const generateDigitalCommerceDraft = (
  profile: DigitalCommerceProfile,
) =>
  composeProcessDraft(generateDigitalCommerceCoreDraft(profile), [
    { id: `metier.${profile.slug}`, contentPatches: patches(profile) },
  ]);

export const digitalCommerceProfiles = {
  "e-commerce": {
    slug: "e-commerce",
    name: "E-commerce",
    family: "ecommerce",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1wxAn6FtUzJaTzi88GXMzwoFvVjnFbwgqDCagfwP7_-c/edit",
    processIds: {
      cap: "process.ecommerce.direction.savoir-ou-va-lactivite",
      decisions: "process.ecommerce.direction.decider-sans-bloquer-lexecution",
      access: "process.ecommerce.direction.donner-acces-a-lessentiel",
      acquisition: "process.ecommerce.marketing-vente.attirer-du-trafic-qualifie",
      conversion: "process.ecommerce.marketing-vente.convertir-les-visiteurs",
      complaint: "process.ecommerce.marketing-vente.traiter-un-retour-ou-une-reclamation-client",
      catalog: "process.ecommerce.operations.maintenir-le-catalogue-et-la-boutique-en-ligne",
      operations: "process.ecommerce.operations.preparer-commandes-et-expeditions",
      returns: "process.ecommerce.operations.gerer-retours-support-et-litiges",
      team: "process.ecommerce.equipe.organiser-support-et-execution",
      profitability: "process.ecommerce.finance-admin.suivre-ventes-panier-et-marge",
      payables: "process.ecommerce.finance-admin.payer-a-temps",
      cash: "process.ecommerce.finance-admin.securiser-les-encaissements",
    },
    growthPriorities: "catégories rentables, réachat, base clients propriétaire, canaux maîtrisés et promesse de livraison tenable",
    delegatedDecisions: "remboursement sous plafond, remplacement, geste client, suspension d’une fiche, arrêt de campagne et escalade fraude",
    accessRisks: "administration de la boutique, nom de domaine, paiement, stock, transporteurs, analytics, publicité, e-mail et sauvegardes",
    acquisitionFrame: "recherche, contenu, réseaux sociaux, e-mail, publicité, audiences, budget, page produit et mesure de la marge",
    activationProof: "source, campagne, consentement applicable, visite, ajout au panier, commande, revenu et marge",
    complaintEvidence: "commande, produit, client, paiement, CGV acceptées, suivi transporteur, échanges, photos utiles, retour et remboursement",
    catalogFrame: "SKU, variante, caractéristiques, prix TTC, stock, délai, livraison, retours, visuels et source fournisseur",
    catalogChecks: "caractéristiques essentielles, prix total, disponibilité, délai, restriction, conformité, garantie et cohérence des visuels",
    operationsFrame: "commande payée, stock réservé, prélèvement, contrôle, emballage, étiquette, transporteur, suivi et preuve d’expédition",
    operationsProof: "commande, SKU et quantité scannés, opérateur, colis, poids, étiquette, heure de remise, transporteur et suivi",
    returnsFrame: "motif, droit applicable, autorisation, étiquette, réception, contrôle, remise en stock, remboursement et information client",
    replacementChecks: "support, boutique, stock, commandes urgentes, transporteurs, paiement, remboursements, campagnes et seuils de décision",
    marginRisks: "achat produit, emballage, préparation, transport, paiement, publicité, remise, retour, casse, support et fraude",
    paymentProof: "commande, montant autorisé, capture, frais, remboursement, contestation, versement du prestataire et relevé bancaire",
    complianceFrame: "boutique, domaine, paiement, mentions légales, CGV, prix, livraison, rétractation applicable, garanties, cookies, données et habilitations",
  },
  marketplace: {
    slug: "marketplace",
    name: "Marketplace",
    family: "marketplace",
    reviewState: "internal_review_complete",
    sourceUrl: "https://docs.google.com/spreadsheets/d/1Jrm0g0FUcgPf5uZfOmi3aqsR28o7dZa6cqatrT9AfEc/edit",
    processIds: {
      cap: "process.marketplace.direction.savoir-ou-va-la-plateforme",
      decisions: "process.marketplace.direction.decider-sans-bloquer-la-plateforme",
      access: "process.marketplace.direction.donner-acces-a-lessentiel",
      acquisition: "process.marketplace.marketing-vente.recruter-vendeurs-et-acheteurs",
      complaint: "process.marketplace.marketing-vente.traiter-un-litige-ou-une-reclamation",
      catalog: "process.marketplace.operations.publier-et-controler-les-offres",
      operations: "process.marketplace.operations.moderer-la-plateforme-et-les-incidents",
      returns: "process.marketplace.operations.suivre-commandes-retours-et-coordination-vendeurs",
      team: "process.marketplace.equipe.organiser-support-et-moderation",
      profitability: "process.marketplace.finance-admin.suivre-commissions-paiements-et-performance",
      payables: "process.marketplace.finance-admin.payer-a-temps",
      cash: "process.marketplace.finance-admin.se-faire-payer-et-reverser",
    },
    growthPriorities: "catégories où vendeurs actifs, offres disponibles et acheteurs qualifiés créent une liquidité durable",
    delegatedDecisions: "suspension d’offre, demande de preuve, blocage préventif, remboursement selon responsabilité, geste plafonné et escalade fraude",
    accessRisks: "administration, comptes vendeurs, modération, prestataire de paiement, reversements, données, support, journaux et récupération",
    acquisitionFrame: "recrutement vendeur, activation du catalogue, acquisition acheteur, demande par catégorie, parrainage et mesure de liquidité",
    activationProof: "vendeur vérifié, première offre conforme, disponibilité, acheteur qualifié, première transaction et réachat",
    complaintEvidence: "transaction, offre, identités, vendeur professionnel ou particulier déclaré, paiement, messages, livraison, signalement et décision",
    catalogFrame: "vendeur, identité vérifiée, catégorie, caractéristiques, prix, disponibilité, livraison, conditions, visuels et historique de contrôle",
    catalogChecks: "informations du vendeur, produits ou services autorisés, caractéristiques, prix, disponibilité, allégations, sécurité et règles de catégorie",
    operationsFrame: "signalement, qualification, preuve, urgence, mesure conservatoire, information, recours interne et clôture",
    operationsProof: "contenu signalé, auteur, motif, horodatage, pièces, mesure prise, notification, contestation et décision finale",
    returnsFrame: "commande, vendeur responsable, acheteur, livraison, motif, règle applicable, consigne, remboursement et reversement corrigé",
    replacementChecks: "files de signalement, vendeurs sensibles, commandes bloquées, reversements, prestataire de paiement, droits et seuils d’escalade",
    marginRisks: "commission, frais de paiement, incitation vendeur ou acheteur, remboursement, fraude, support, modération et coût d’acquisition des deux côtés",
    paymentProof: "transaction, acheteur, vendeur, commission, frais, remboursement, réserve, reversement du prestataire et relevé bancaire",
    complianceFrame: "administration, vérification des vendeurs, informations affichées, mécanisme de signalement, motivation des décisions, recours, paiement, données et obligations applicables selon la taille et le modèle",
  },
} satisfies Record<string, DigitalCommerceProfile>;
