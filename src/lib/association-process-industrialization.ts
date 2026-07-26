import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

export type AssociationProfile = {
  slug: "association";
  name: string;
  sourceUrl: string;
  researchSources: readonly string[];
  processCount: number;
};

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

const associationProcesses = {
  governance:
    "process.association.direction.repartir-les-roles-de-gouvernance",
  strategy: "process.association.direction.savoir-ou-va-lassociation",
  team: "process.association.equipe.coordonner-salaries-et-benevoles",
  payables:
    "process.association.finance-admin.payer-a-temps-et-justifier-les-depenses",
  finance:
    "process.association.finance-admin.suivre-budget-encaissements-subventions-et-tresorerie",
  membership:
    "process.association.marketing-vente.recruter-et-fideliser-membres-beneficiaires-ou-partenaires",
  complaints:
    "process.association.marketing-vente.traiter-une-reclamation-ou-un-signalement",
  operations:
    "process.association.operations.organiser-une-action-un-evenement-ou-un-accompagnement",
} as const;

const associationDefinitions: Record<
  keyof typeof associationProcesses,
  IndustrializedProcessDefinition
> = {
  governance: def(
    "Répartir les pouvoirs et responsabilités conformément aux statuts et aux décisions des instances.",
    "Élection, délégation, réunion, départ d’un dirigeant ou engagement important.",
    "Une décision prise par l’organe compétent, tracée puis exécutée.",
    "Président ou secrétaire",
    "À chaque décision",
  ),
  strategy: def(
    "Transformer l’objet associatif en priorités, actions, moyens et résultats mesurables.",
    "Préparation de l’exercice, nouvelle opportunité, financement ou revue d’activité.",
    "Un projet associatif réaliste compatible avec les ressources disponibles.",
    "Conseil d’administration",
    "Trimestrielle",
  ),
  team: def(
    "Coordonner salariés, bénévoles, volontaires et intervenants sans confondre leurs statuts.",
    "Nouvelle mission, planning, absence, recrutement ou changement de responsabilité.",
    "Chaque mission est couverte, comprise et exercée dans un cadre sûr.",
    "Responsable d’activité",
    "Hebdomadaire",
  ),
  payables: def(
    "Engager et payer les dépenses autorisées avec une justification complète.",
    "Achat, note de frais, facture, avance, remboursement ou échéance.",
    "Une dépense utile, autorisée, imputée et payée une seule fois.",
    "Trésorier",
    "Hebdomadaire",
  ),
  finance: def(
    "Suivre les ressources, emplois, fonds affectés et engagements de l’association.",
    "Encaissement, subvention, don, clôture, budget ou revue de trésorerie.",
    "Des comptes fiables qui expliquent l’utilisation de chaque financement.",
    "Trésorier",
    "Mensuelle",
  ),
  membership: def(
    "Attirer, accueillir et fidéliser les membres, bénéficiaires, donateurs et partenaires pertinents.",
    "Demande entrante, campagne, adhésion, renouvellement ou partenariat.",
    "Une relation qualifiée avec un statut, un engagement et une prochaine action clairs.",
    "Responsable développement",
    "Hebdomadaire",
  ),
  complaints: def(
    "Traiter une réclamation ou un signalement avec protection, impartialité et confidentialité.",
    "Plainte, alerte, conflit, comportement inapproprié ou incident.",
    "Une situation sécurisée, instruite, décidée et suivie.",
    "Référent désigné",
    "À chaque signalement",
  ),
  operations: def(
    "Préparer, réaliser et justifier une action associative de bout en bout.",
    "Décision de lancer une action, un événement ou un accompagnement.",
    "Une action conforme à l’objet, financée, réalisée et évaluée.",
    "Responsable d’activité",
    "À chaque action",
  ),
};

const associationContent: Record<
  keyof typeof associationProcesses,
  IndustrializedContentItem[]
> = {
  governance: [
    item("implementation_action", "Centraliser statuts signés, règlement intérieur, récépissés, publication, RNA, Siren-Siret, agréments, conventions et dernière liste des dirigeants"),
    item("implementation_action", "Créer la matrice des pouvoirs entre assemblée générale, conseil d’administration, bureau, président, trésorier, secrétaire et direction salariée"),
    item("implementation_action", "Formaliser les délégations pour contrats, dépenses, banque, embauche, demandes de subvention, représentation et accès numériques"),
    item("operational_step", "Préparer chaque réunion avec organe compétent, convocation, délai, ordre du jour, documents, quorum, procurations et conflits d’intérêts"),
    item("operational_step", "Tracer dans le procès-verbal participants, quorum, débats utiles, votes, abstentions, décisions, responsables et échéances"),
    item("operational_step", "Déclarer dans les trois mois les changements qui l’exigent et conserver accusé, version des statuts et éventuelle publication"),
    item("recurring_control", "Contrôler chaque trimestre mandats, délégations, signatures bancaires, assurances, échéances statutaires et décisions non exécutées"),
    item("operational_step", "Organiser à chaque changement de dirigeant la remise des archives, contrats, moyens de paiement, clés, comptes et dossiers ouverts"),
    item("operating_rule", "Ne pas engager l’association au-delà du pouvoir prévu par les statuts, la délégation ou la décision de l’instance compétente"),
  ],
  strategy: [
    item("implementation_action", "Formuler l’objet opérationnel avec publics visés, besoins traités, territoire, activités autorisées et résultats recherchés"),
    item("implementation_action", "Fixer pour l’année des objectifs de bénéficiaires, adhérents, bénévoles, qualité, impact, ressources propres, subventions et trésorerie"),
    item("operational_step", "Transformer chaque priorité en action avec responsable, calendrier, capacité, budget, financement, indicateur et risque principal"),
    item("operational_step", "Évaluer toute nouvelle action selon objet statutaire, besoin démontré, capacité humaine, coût complet, financement et continuité"),
    item("recurring_control", "Comparer chaque mois calendrier des actions, charge disponible, financements confirmés, dépenses engagées et trésorerie"),
    item("recurring_control", "Comparer chaque trimestre réalisations, bénéficiaires, qualité, impact, budget, mobilisation et engagements envers les financeurs"),
    item("operational_step", "Ajuster ou arrêter une action lorsque public, moyens, sécurité, financement ou résultat ne permettent plus de la tenir correctement"),
    item("implementation_action", "Cartographier collectivités, fondations, entreprises, réseaux et associations partenaires avec intérêts, attentes et complémentarités"),
    item("operational_step", "Préparer le rapport d’activité annuel à partir de preuves homogènes plutôt que de souvenirs reconstitués en fin d’exercice"),
    item("operating_rule", "Ne pas modifier l’objet réel ou lancer une activité durable uniquement pour répondre à un financement disponible"),
  ],
  team: [
    item("implementation_action", "Tenir la liste des salariés, bénévoles, volontaires, prestataires et dirigeants avec statut, mission, responsable, assurance et accès"),
    item("implementation_action", "Créer une fiche par mission précisant objectif, tâches, limites, compétences, horaires, risques, frais, données accessibles et référent"),
    item("operational_step", "Accueillir chaque personne avec objet associatif, règles, sécurité, confidentialité, publics concernés, outils et personne à alerter"),
    item("operational_step", "Planifier les missions selon disponibilités réelles, compétences, continuité, repos des salariés et présence d’un responsable"),
    item("operational_step", "Réaffecter une mission dès une absence et informer bénéficiaires, équipe et partenaires de ce qui change réellement"),
    item("operational_step", "Traiter les frais bénévoles avec politique écrite, autorisation, justificatifs, lien avec la mission et choix remboursement ou abandon"),
    item("recurring_control", "Faire chaque semaine le point sur charge, missions non couvertes, nouveaux besoins, fatigue, tensions et personnes sans accompagnement"),
    item("operational_step", "À chaque départ, récupérer matériel, clés et documents puis retirer comptes, listes, messageries et accès aux données"),
    item("operating_rule", "Ne pas placer un bénévole dans une relation de travail subordonnée permanente ni lui confier une mission dangereuse sans cadre adapté"),
  ],
  payables: [
    item("implementation_action", "Définir les seuils d’achat et de validation avec devis requis, décideur, budget, mode de paiement et pièces à conserver"),
    item("operational_step", "Vérifier avant engagement objet de la dépense, ligne budgétaire, financement autorisé, fournisseur, prix, livraison et approbation"),
    item("operational_step", "Rattacher chaque facture au devis, à la commande, à la livraison ou à la prestation réellement reçue"),
    item("operational_step", "Contrôler bénéficiaire, coordonnées bancaires, montant, TVA, échéance, projet, justificatif et absence de double paiement"),
    item("operational_step", "Traiter une note de frais avec identité, mission, date, motif, trajet, justificatifs, barème et validation indépendante"),
    item("operational_step", "Isoler toute facture litigieuse, demander correction ou avoir et conserver la preuve de la contestation"),
    item("recurring_control", "Préparer chaque semaine les échéances avec trésorerie disponible, dépenses prioritaires, validations manquantes et risques de retard"),
    item("recurring_control", "Contrôler chaque mois les dépenses par action, financeur, restriction, fournisseur et écart au budget"),
    item("operating_rule", "La personne qui engage ou bénéficie directement d’une dépense ne doit pas être seule à la valider et à la payer"),
  ],
  finance: [
    item("implementation_action", "Choisir avec le comptable une organisation de trésorerie ou d’engagement adaptée aux activités, financements, salariés et obligations"),
    item("implementation_action", "Créer le suivi analytique par action avec budget, fonds affectés, ressources, dépenses, bénévolat valorisé et justificatifs attendus"),
    item("operational_step", "Enregistrer cotisation, don, subvention, vente, billetterie ou participation avec date, payeur, objet, moyen, affectation et pièce émise"),
    item("operational_step", "Rapprocher banque, caisse, plateforme de paiement, reçus, factures et comptabilité sans compenser les écarts"),
    item("operational_step", "Suivre chaque subvention avec demande, convention, montant attribué, versements, dépenses éligibles, indicateurs et compte rendu"),
    item("operational_step", "Émettre un reçu fiscal uniquement lorsque l’éligibilité de l’organisme et du versement est sécurisée, avec numérotation et preuve"),
    item("recurring_control", "Mettre à jour chaque mois réalisé, engagé, reste à dépenser, reste à recevoir, trésorerie prévisionnelle et fonds non consommés"),
    item("recurring_control", "Présenter régulièrement aux dirigeants budget, écarts, risques, financements conditionnés, créances, dettes et décisions nécessaires"),
    item("operating_rule", "Ne pas utiliser une ressource affectée à un projet pour une autre dépense sans vérifier la convention et obtenir l’accord requis"),
  ],
  membership: [
    item("implementation_action", "Distinguer membre, adhérent, bénéficiaire, bénévole, donateur et partenaire avec droits, obligations, cotisation et accès associés"),
    item("implementation_action", "Créer un parcours d’adhésion conforme aux statuts avec demande, critères, décision d’admission, paiement et confirmation"),
    item("operational_step", "Qualifier chaque contact par besoin, motivation, disponibilité, territoire, compétences, capacité de contribution et prochaine étape"),
    item("operational_step", "Collecter uniquement les données nécessaires et informer sur finalité, accès, conservation, droits et communication éventuelle"),
    item("operational_step", "Accueillir le nouveau membre avec projet associatif, fonctionnement, calendrier, contacts, droits de vote et possibilités d’engagement"),
    item("operational_step", "Proposer une première action adaptée puis vérifier rapidement que la personne a les informations et le soutien nécessaires"),
    item("operational_step", "Construire chaque partenariat avec objectif commun, contributions, bénéficiaires, calendrier, visibilité, données, budget et interlocuteurs"),
    item("recurring_control", "Suivre chaque mois demandes, adhésions, renouvellements, participation, bénévoles actifs, dons et partenariats ouverts"),
    item("operational_step", "Relancer avant échéance avec bilan de la relation, montant ou engagement attendu et moyen simple de renouveler"),
    item("operating_rule", "Ne pas promettre de reçu fiscal, avantage, décision d’admission, visibilité ou contrepartie sans en vérifier les conditions"),
  ],
  complaints: [
    item("implementation_action", "Mettre en place des canaux identifiés et confidentiels pour réclamation, conflit, discrimination, violence, fraude ou risque concernant un public"),
    item("operational_step", "Accuser réception, évaluer urgence et sécurité puis protéger immédiatement les personnes et preuves lorsque nécessaire"),
    item("operational_step", "Désigner un instructeur sans conflit d’intérêts et définir qui peut connaître l’identité, les faits et les documents"),
    item("operational_step", "Recueillir séparément faits, dates, personnes, témoins, pièces et mesures déjà prises sans promettre une issue"),
    item("operational_step", "Décider mesure conservatoire, médiation, réponse, sanction statutaire, déclaration, assurance ou orientation vers l’autorité compétente"),
    item("operational_step", "Informer les personnes concernées de la suite utile dans les limites de la confidentialité et des droits de chacun"),
    item("recurring_control", "Suivre jusqu’à clôture protection, décision, action corrective, délai, récidive et mise à jour des règles"),
    item("operating_rule", "Interdire toute représaille et ne jamais diffuser un signalement au-delà des personnes nécessaires à son traitement"),
  ],
  operations: [
    item("implementation_action", "Créer la fiche action avec besoin, public, objectif, critères d’accès, contenu, responsable, dates, lieu, partenaires et résultat attendu"),
    item("operational_step", "Vérifier avant lancement décision de l’instance, budget, financement, assurance, autorisation, sécurité, accessibilité et traitement des données"),
    item("operational_step", "Construire le planning avec tâches, bénévoles ou salariés, prestataires, matériel, inscriptions, communications et solutions de remplacement"),
    item("operational_step", "Inscrire le bénéficiaire ou participant avec informations nécessaires, consentements utiles, besoins spécifiques et confirmation pratique"),
    item("operational_step", "Briefer l’équipe avant l’action sur public, rôles, horaires, confidentialité, risques, incidents et personne qui décide"),
    item("operational_step", "Tracer réalisation, présence, livrables, difficultés, incidents, dépenses et changements par rapport au projet validé"),
    item("operational_step", "Clore avec bénéficiaires, matériel, paiements, pièces, partenaires, remerciements et actions restant à mener"),
    item("recurring_control", "Comparer après chaque action objectifs, personnes touchées, qualité, résultats, budget, bénévolat et écarts à expliquer"),
    item("operational_step", "Produire le compte rendu du financeur avec réalisation, indicateurs, dépenses, écarts, comptes approuvés et rapport d’activité dans le délai prévu"),
    item("operating_rule", "Ne pas déclarer une action, un bénéficiaire, une dépense ou un résultat sans preuve vérifiable et cohérente avec le financement"),
  ],
};

export const associationProfile: AssociationProfile = {
  slug: "association",
  name: "Association",
  sourceUrl:
    "https://docs.google.com/spreadsheets/d/1v32FuEomEQtbXOH8IRprH69JKJYvJkyL6dI4GgKvGhk/edit",
  researchSources: [
    "https://www.service-public.fr/particuliers/vosdroits/F24418",
    "https://associations.gouv.fr/la-comptabilite-associative",
    "https://associations.gouv.fr/demander-une-subvention",
    "https://associations.gouv.fr/saisir-les-comptes-rendus-financiers",
    "https://associations.gouv.fr/les-conditions-doctroi-dune-subvention",
    "https://www.service-public.fr/particuliers/vosdroits/N22150",
    "https://www.service-public.fr/particuliers/vosdroits/R47828",
    "https://cnil.fr/fr/mon-quotidien/associations",
  ],
  processCount: 8,
};

export function generateAssociationDraft(): ProcessDraft {
  return {
    definitionsById: Object.fromEntries(
      Object.entries(associationProcesses).map(([role, processId]) => [
        processId,
        associationDefinitions[role as keyof typeof associationProcesses],
      ]),
    ),
    contentByProcessId: Object.fromEntries(
      Object.entries(associationProcesses).map(([role, processId]) => [
        processId,
        associationContent[role as keyof typeof associationProcesses],
      ]),
    ),
  };
}
