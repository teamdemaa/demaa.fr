import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  ProcessDraft,
} from "@/lib/process-industrialization";

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

const processIds = {
  cap: "process.auto-ecole.direction.savoir-ou-va-lactivite",
  decisions:
    "process.auto-ecole.direction.decider-au-quotidien-sans-tout-centraliser",
  access: "process.auto-ecole.direction.donner-acces-a-lessentiel",
  visibility:
    "process.auto-ecole.direction.garder-une-visibilite-sans-reprendre-la-main",
  acquisition:
    "process.auto-ecole.marketing-vente.developper-les-inscriptions",
  sell: "process.auto-ecole.marketing-vente.vendre-une-formule-de-conduite",
  complaint:
    "process.auto-ecole.marketing-vente.traiter-une-reclamation-eleve",
  dossiers:
    "process.auto-ecole.operations.gerer-inscriptions-et-dossiers-eleves",
  planning:
    "process.auto-ecole.operations.planifier-heures-moniteurs-et-vehicules",
  progress:
    "process.auto-ecole.operations.suivre-progression-et-examens",
  vehicles:
    "process.auto-ecole.operations.suivre-vehicules-et-incidents",
  team:
    "process.auto-ecole.equipe.organiser-les-moniteurs-et-remplacements",
  onboard:
    "process.auto-ecole.equipe.integrer-un-nouveau-collaborateur",
  profitability:
    "process.auto-ecole.finance-admin.suivre-paiements-forfaits-et-heures",
  payables: "process.auto-ecole.finance-admin.payer-a-temps",
  financing:
    "process.auto-ecole.finance-admin.suivre-financements-et-relances",
  compliance:
    "process.auto-ecole.conformite-metier.tenir-dossiers-eleves-et-vehicules-en-regle",
} as const;

export const autoSchoolResearchSources = [
  "https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/auto-ecole",
  "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000041963999",
  "https://www.service-public.gouv.fr/particuliers/vosdroits/R59785",
  "https://permisdeconduire.ants.gouv.fr/aide-et-contact/eleve-d-une-ecole-de-conduite-cssr?lang=fr",
  "https://www.moncompteformation.gouv.fr/espace-public/tout-savoir-sur-le-permis-de-conduire",
] as const;

export const autoSchoolProfile = {
  slug: "auto-ecole",
  name: "Auto-école",
  family: "auto-school",
  reviewState: "internal_review_complete",
  sourceUrl:
    "https://docs.google.com/spreadsheets/d/1a7EpQKobVx1EPswsfZq9CeELaj6_oQU0R-s0M-TXvmg/edit",
  processIds,
} as const;

export function generateAutoSchoolDraft(): ProcessDraft {
  return {
    definitionsById: {
      [processIds.cap]: def(
        "Choisir les catégories de permis, formules et capacités qui doivent porter une activité rentable.",
        "Début de trimestre ou écart important de remplissage, délai ou marge.",
        "Des objectifs compatibles avec les moniteurs, véhicules et places d’examen disponibles.",
        "Dirigeant",
        "Mensuelle",
      ),
      [processIds.decisions]: def(
        "Déléguer les arbitrages courants sans bloquer un élève, un moniteur ou un examen.",
        "Absence, panne, retard de dossier, paiement ou place d’examen.",
        "Une décision rapide, tracée et prise dans une limite connue.",
        "Responsable d’agence",
        "Mensuelle",
      ),
      [processIds.access]: def(
        "Sécuriser les accès aux outils et données indispensables à la continuité de l’auto-école.",
        "Arrivée, départ, incident ou revue des droits.",
        "Des comptes nominatifs maîtrisés et récupérables.",
        "Responsable administratif",
        "Mensuelle",
      ),
      [processIds.visibility]: def(
        "Voir les inscriptions, heures, examens, encaissements et risques avant qu’ils ne bloquent l’activité.",
        "Revue d’activité.",
        "Des écarts expliqués avec une action, un responsable et une date.",
        "Responsable d’agence",
        "Hebdomadaire",
      ),
      [processIds.acquisition]: def(
        "Attirer des candidats correspondant aux catégories, zones et capacités réellement disponibles.",
        "Nouvelle demande ou campagne locale.",
        "Une demande qualifiée jusqu’au rendez-vous d’inscription.",
        "Accueil ou responsable commercial",
        "Hebdomadaire",
      ),
      [processIds.sell]: def(
        "Transformer le besoin en formule de conduite claire, adaptée et contractualisée.",
        "Entretien d’inscription.",
        "Un contrat compris, complet et finançable sans promesse trompeuse.",
        "Accueil ou responsable commercial",
        "À chaque inscription",
      ),
      [processIds.complaint]: def(
        "Traiter une réclamation à partir du contrat, des heures réalisées et des faits.",
        "Insatisfaction, contestation, demande de transfert ou incident.",
        "Une réponse tracée et une cause opérationnelle corrigée.",
        "Responsable d’agence",
        "À chaque réclamation",
      ),
      [processIds.dossiers]: def(
        "Sécuriser l’inscription administrative et le dossier de chaque élève avant sa formation et son examen.",
        "Nouvelle inscription ou pièce arrivée à échéance.",
        "Un dossier complet avec mandat, NEPH et justificatifs vérifiés.",
        "Responsable administratif",
        "À chaque dossier",
      ),
      [processIds.planning]: def(
        "Planifier les leçons en combinant disponibilités élèves, enseignants, véhicules et contraintes pédagogiques.",
        "Nouvelle réservation, annulation ou changement de capacité.",
        "Un planning faisable limitant les trous, retards et heures perdues.",
        "Responsable planning",
        "Quotidienne",
      ),
      [processIds.progress]: def(
        "Faire progresser chaque élève jusqu’à une présentation à l’examen cohérente avec son niveau.",
        "Leçon, bilan, réussite au code ou disponibilité d’une place.",
        "Une progression tracée et une décision de présentation justifiable.",
        "Responsable pédagogique",
        "Hebdomadaire",
      ),
      [processIds.vehicles]: def(
        "Maintenir chaque véhicule pédagogique disponible, assuré, conforme et sûr.",
        "Contrôle quotidien, échéance, panne ou incident.",
        "Un véhicule utilisable ou une solution de remplacement documentée.",
        "Référent parc",
        "Hebdomadaire",
      ),
      [processIds.team]: def(
        "Répartir les élèves et la charge entre enseignants sans dégrader le suivi pédagogique.",
        "Revue de planning, absence ou pic d’activité.",
        "Des responsabilités, charges et remplacements visibles.",
        "Responsable pédagogique",
        "Hebdomadaire",
      ),
      [processIds.onboard]: def(
        "Rendre un nouveau collaborateur autonome sur les élèves, outils, véhicules et règles de l’établissement.",
        "Arrivée ou remplacement.",
        "Une prise de poste vérifiée avant autonomie complète.",
        "Responsable d’agence",
        "À chaque arrivée",
      ),
      [processIds.profitability]: def(
        "Connaître ce qui reste réellement sur chaque formule après les heures et coûts consommés.",
        "Heure réalisée, encaissement ou clôture mensuelle.",
        "Des prix, capacités et relances corrigés avant dérive durable.",
        "Dirigeant ou responsable financier",
        "Mensuelle",
      ),
      [processIds.payables]: def(
        "Payer fournisseurs et échéances à partir de pièces contrôlées.",
        "Facture ou échéance.",
        "Des paiements validés, affectés et rapprochés.",
        "Responsable administratif",
        "Hebdomadaire",
      ),
      [processIds.financing]: def(
        "Suivre les dossiers financés et les impayés sans commencer une prestation non sécurisée.",
        "Demande de financement, échéance ou rejet.",
        "Un financement justifié et des créances avec prochaine action.",
        "Responsable administratif",
        "Hebdomadaire",
      ),
      [processIds.compliance]: def(
        "Maintenir les agréments, contrats, registres, assurances et preuves obligatoires de l’établissement.",
        "Échéance, contrôle, changement de véhicule ou évolution réglementaire.",
        "Des obligations à jour, attribuées et retrouvables.",
        "Exploitant ou référent conformité",
        "Mensuelle",
      ),
    },
    contentByProcessId: {
      [processIds.cap]: [
        item("implementation_action", "Choisir les catégories de permis, formules, zones et publics à développer selon la demande locale"),
        item("implementation_action", "Fixer les objectifs d’inscriptions, heures vendues, délai de formation, réussite, chiffre d’affaires et marge"),
        item("recurring_control", "Comparer chaque mois demandes, inscriptions, heures planifiées, heures réalisées, examens et encaissements"),
        item("operating_rule", "Ne pas lancer une formule sans prix, capacité moniteur-véhicule, parcours pédagogique et résultat attendu"),
      ],
      [processIds.decisions]: [
        item("implementation_action", "Écrire qui peut déplacer une leçon, remplacer un moniteur, affecter un véhicule ou accorder un geste commercial"),
        item("operational_step", "Classer l’arbitrage selon sécurité, examen proche, obligation administrative, impact élève et coût"),
        item("operational_step", "Appliquer la solution autorisée puis prévenir immédiatement l’élève et le moniteur concernés"),
        item("operating_rule", "Escalader sans délai accident, défaut d’assurance, enseignant non autorisé, donnée exposée ou conflit grave"),
      ],
      [processIds.access]: [
        item("implementation_action", "Créer un registre des accès au logiciel métier, ANTS, RdvPermis, livret numérique, CPF, banque et messagerie"),
        item("operational_step", "Attribuer un compte nominatif limité aux tâches réellement exercées"),
        item("operational_step", "Retirer ou réattribuer les droits le jour d’un départ ou changement de poste"),
        item("recurring_control", "Tester chaque mois les accès critiques, doubles authentifications et procédures de récupération"),
      ],
      [processIds.visibility]: [
        item("implementation_action", "Créer une vue par élève avec dossier, formule, heures prévues et réalisées, solde, niveau et prochaine action"),
        item("operational_step", "Identifier avant la revue les dossiers ANTS bloqués, soldes échus, élèves sans leçon et examens à risque"),
        item("operational_step", "Affecter à chaque écart une action, un responsable et une échéance"),
        item("recurring_control", "Revoir chaque semaine capacité moniteurs-véhicules, annulations, progression, places RdvPermis et trésorerie"),
      ],
      [processIds.acquisition]: [
        item("implementation_action", "Optimiser Google Business Profile avec catégories enseignées, horaires, téléphone, photos et lien d’inscription"),
        item("implementation_action", "Créer une page locale claire par offre avec prix ou composition, délais réalistes et bouton de contact"),
        item("operational_step", "Qualifier âge, catégorie visée, code obtenu, NEPH, disponibilité, échéance et financement envisagé"),
        item("recurring_control", "Mesurer chaque semaine appels, formulaires, rendez-vous, inscriptions et coût par canal"),
        item("operating_rule", "Ne pas annoncer une date d’examen ni un délai de permis sans dossier, niveau et disponibilité vérifiés"),
      ],
      [processIds.sell]: [
        item("implementation_action", "Créer une trame d’entretien comparant boîte manuelle, automatique, AAC, conduite supervisée et besoins réels"),
        item("operational_step", "Réaliser l’évaluation préalable et expliquer le volume prévisionnel de formation"),
        item("operational_step", "Présenter séparément prestations du forfait, prestations à l’unité, frais autorisés, échéancier et conditions"),
        item("operational_step", "Faire signer le contrat applicable et vérifier mandat, rétractation, résiliation, médiation et données personnelles"),
        item("recurring_control", "Analyser chaque mois propositions, signatures, refus, délais de décision et motifs de perte"),
      ],
      [processIds.complaint]: [
        item("implementation_action", "Créer un registre avec élève, contrat, faits, heures, paiements, pièces, réponse et correction"),
        item("operational_step", "Accuser réception puis sécuriser immédiatement examen, accès au dossier ou continuité de formation"),
        item("operational_step", "Comparer contrat, planning, livret, heures réalisées, échanges et sommes facturées avant de répondre"),
        item("recurring_control", "Vérifier la correction puis analyser chaque mois délais, causes et réclamations réouvertes"),
      ],
      [processIds.dossiers]: [
        item("implementation_action", "Créer une checklist d’inscription avec identité, justificatifs, e-photo, catégorie, mandat, contrat et financement"),
        item("operational_step", "Vérifier l’existence et la cohérence du NEPH ou déposer la demande correcte sur France Titres"),
        item("operational_step", "Faire finaliser à l’élève son compte et les confirmations requises sans conserver ses identifiants personnels"),
        item("operational_step", "Relancer chaque pièce bloquante avec responsable, date limite et conséquence sur le démarrage"),
        item("recurring_control", "Contrôler avant première leçon et examen la validité du dossier, du code et des autorisations nécessaires"),
      ],
      [processIds.planning]: [
        item("implementation_action", "Créer un planning partagé reliant élève, objectif, enseignant autorisé, véhicule, lieu et durée"),
        item("operational_step", "Planifier les leçons selon progression, régularité, disponibilités et date cible réaliste"),
        item("operational_step", "Confirmer la séance puis appliquer une règle écrite aux annulations tardives et absences"),
        item("operational_step", "Réaffecter immédiatement les créneaux libérés aux élèves prioritaires compatibles"),
        item("recurring_control", "Contrôler chaque jour conflits, temps de trajet, trous de planning, véhicules indisponibles et heures non affectées"),
      ],
      [processIds.progress]: [
        item("implementation_action", "Créer un suivi individuel reliant compétences, heures, observations, objectifs et prochaine leçon"),
        item("operational_step", "Renseigner le livret d’apprentissage numérique après l’activité réellement réalisée"),
        item("operational_step", "Déclencher un bilan quand l’élève stagne, annule souvent ou dépasse le volume prévu"),
        item("operational_step", "Vérifier niveau, code valide, dossier complet et disponibilité avant toute réservation RdvPermis"),
        item("recurring_control", "Revoir chaque semaine élèves sans progression, examens proches, échecs et besoins de repositionnement"),
      ],
      [processIds.vehicles]: [
        item("implementation_action", "Créer une fiche par véhicule avec assurance, entretien, contrôle technique applicable, kilométrage et équipements"),
        item("operational_step", "Faire un contrôle visuel avant prise de poste : pneus, feux, niveaux, double commande, propreté et documents"),
        item("operational_step", "Immobiliser le véhicule en cas de défaut de sécurité et affecter une solution de remplacement"),
        item("operational_step", "Déclarer accident ou panne avec conducteur, élève, circonstances, photos, assurance et actions"),
        item("recurring_control", "Revoir chaque semaine alertes tableau de bord, entretiens, sinistres, coûts et jours d’immobilisation"),
      ],
      [processIds.team]: [
        item("implementation_action", "Créer une vue de charge avec enseignants, catégories autorisées, élèves, horaires, véhicules et absences"),
        item("operational_step", "Affecter chaque élève à un référent pédagogique et prévoir un remplaçant identifiable"),
        item("operational_step", "Faire une passation avec niveau, difficultés, prochaines compétences et échéance d’examen"),
        item("recurring_control", "Revoir chaque semaine surcharge, heures disponibles, absences, besoins de recrutement et continuité des élèves"),
      ],
      [processIds.onboard]: [
        item("implementation_action", "Créer un parcours d’intégration couvrant agrément, autorisation d’enseigner, outils, véhicules et procédures"),
        item("operational_step", "Vérifier les titres, autorisations, pièces contractuelles et catégories enseignables avant planification"),
        item("recurring_control", "Valider sur une situation réelle la tenue du livret, la sécurité, la relation élève et la remontée d’incident"),
      ],
      [processIds.profitability]: [
        item("implementation_action", "Créer un suivi par élève et formule avec prix, heures incluses, heures consommées, solde et coût enseignant-véhicule"),
        item("operational_step", "Rapprocher chaque semaine leçons planifiées, réalisées, annulées, facturées et payées"),
        item("operational_step", "Affecter carburant, entretien, assurance, location, logiciel et temps administratif aux bonnes catégories"),
        item("recurring_control", "Comparer chaque mois marge prévue et réelle par formule, enseignant, véhicule et catégorie"),
        item("operating_rule", "Réviser prix, composition ou capacité avant de masquer une dérive par des heures non tracées"),
      ],
      [processIds.payables]: [
        item("implementation_action", "Créer un échéancier avec fournisseur, contrat, pièce, validation, montant et date de paiement"),
        item("operational_step", "Comparer facture, abonnement, entretien ou prestation à la commande et à la réalisation"),
        item("recurring_control", "Revoir chaque semaine carburant, véhicules, assurances, loyers, logiciels, doublons et litiges"),
      ],
      [processIds.financing]: [
        item("implementation_action", "Créer un suivi séparant paiement personnel, échéancier, aide locale, permis à un euro et dossier CPF admissible"),
        item("operational_step", "Vérifier l’éligibilité et les règles de financement en vigueur avant d’annoncer une prise en charge"),
        item("operational_step", "Relancer avec montant, échéance, pièce manquante, interlocuteur et prochaine action"),
        item("recurring_control", "Revoir chaque semaine dossiers en attente, services faits, rejets, impayés et trésorerie à huit semaines"),
      ],
      [processIds.compliance]: [
        item("implementation_action", "Créer un registre avec agrément, autorisations d’enseigner, assurances, véhicules, affichages et échéances"),
        item("operational_step", "Vérifier que le numéro d’agrément figure sur les documents et publicités concernés"),
        item("operational_step", "Contrôler affichage des prix, contrat applicable, notes, médiateur et restitution gratuite du dossier"),
        item("operational_step", "Archiver mandat, contrat, évaluation, livret, heures, examens, paiements et incidents avec droits d’accès limités"),
        item("recurring_control", "Auditer chaque mois les échéances et chaque année un échantillon complet de dossiers élèves et véhicules"),
      ],
    },
  };
}
