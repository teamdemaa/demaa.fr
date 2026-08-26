import type {
  AcademyContentDefinition,
  AcademyProcessGuide,
} from "@/lib/academy-course-content";

type ProcessGuideInput = {
  slug: string;
  title: string;
  cardTitle?: string;
  shortTitle: string;
  category: string;
  promise: string;
  durationMinutes?: number;
  guide: AcademyProcessGuide;
};

function defineProcessGuide(input: ProcessGuideInput): AcademyContentDefinition {
  return {
    version: "1.0",
    kind: "case-study",
    status: "ready",
    identity: {
      slug: input.slug,
      title: input.title,
      shortTitle: input.shortTitle,
      category: input.category,
      promise: input.promise,
      audience: "Dirigeants de TPE qui veulent rendre leur organisation plus simple et plus fiable",
      durationMinutes: input.durationMinutes ?? 7,
      card: {
        section: "Organiser",
        title: input.cardTitle ?? input.title,
        meta: `${input.durationMinutes ?? 7} min de lecture`,
        image: null,
        imageAlt: `Processus présenté dans l’article : ${input.guide.steps.map((step) => step.label).join(", ")}.`,
      },
    },
    lessons: [],
    recap: {
      title: "À mettre en place",
      points: input.guide.checklist,
    },
    quiz: {
      title: "",
      questions: [],
    },
    action: null,
    processGuide: input.guide,
  };
}

export const ORGANISER_PROCESS_GUIDES: AcademyContentDefinition[] = [
  defineProcessGuide({
    slug: "organiser-entreprise-plomberie",
    title: "Comment organiser une entreprise de plomberie, de la demande à la facture",
    shortTitle: "Organiser une entreprise de plomberie",
    category: "Planning et interventions",
    promise:
      "Un processus simple pour que chaque intervention avance avec un responsable, une prochaine action et un statut clair, sans que la direction reste le point de passage obligatoire.",
    guide: {
      sector: "Organisation d’une entreprise de plomberie",
      company: {
        profile:
          "Cette entreprise de plomberie compte cinq personnes. Trois techniciens réalisent une quinzaine d’interventions par semaine. Les demandes arrivent par téléphone, SMS et WhatsApp.",
        friction:
          "Le problème n’est pas le nombre de canaux. L’entreprise dépend encore de sa direction pour retrouver l’adresse, évaluer l’urgence, choisir un technicien puis vérifier que l’intervention a bien été facturée. Dès que la direction n’est pas disponible, l’information circule mal.",
      },
      processTitle: "Le processus d’intervention à mettre en place",
      processIntroduction:
        "Le client conserve ses habitudes. À l’intérieur de l’entreprise, chaque demande devient une fiche unique qui progresse jusqu’à la facture.",
      steps: [
        {
          label: "Demande reçue",
          title: "Centraliser sans imposer un nouveau canal au client",
          input:
            "Un appel, un SMS, un message WhatsApp ou un formulaire décrivant un besoin d’intervention.",
          description:
            "Téléphone, message ou WhatsApp peuvent rester ouverts. La règle est interne : toute demande reçue doit immédiatement produire une trace exploitable par le reste de l’équipe.",
          owner: "La personne qui reçoit la demande",
          output:
            "Une demande horodatée avec le client, le lieu, le motif et le canal de réponse.",
          control:
            "En fin de journée, aucun appel ou message professionnel ne doit rester sans trace dans la file commune.",
        },
        {
          label: "Fiche créée",
          title: "Transformer le message en travail identifiable",
          input:
            "La demande tracée et les premiers éléments transmis par le client ou le donneur d’ordre.",
          description:
            "La fiche regroupe le client, l’adresse, le problème, les disponibilités et les photos utiles. Elle porte aussi un responsable et une prochaine action.",
          owner: "L’accueil ou la personne de permanence",
          output:
            "Une fiche complète, attribuée et suffisamment précise pour être qualifiée sans rechercher le message d’origine.",
          control:
            "La fiche ne passe pas à l’étape suivante si l’adresse, le contact, le problème ou la prochaine action manque.",
        },
        {
          label: "Priorité définie",
          title: "Appliquer la même règle de décision",
          input:
            "Une fiche complète avec le problème observé, les conséquences, la disponibilité du client et les contraintes connues.",
          description:
            "La demande est classée urgente, à planifier, soumise à devis ou bloquée par une information manquante. L’équipe ne réinvente pas la priorité à chaque appel.",
          owner: "Le responsable planning ou la personne habilitée",
          output:
            "Une priorité explicite, une décision de traitement et une échéance de prochaine action.",
          control:
            "Toute urgence doit correspondre à un critère écrit ; les autres demandes conservent une date de traitement visible.",
        },
        {
          label: "Intervention planifiée",
          title: "Affecter un créneau et un technicien",
          input:
            "Une demande qualifiée, sa priorité, les compétences nécessaires et les disponibilités du client et de l’équipe.",
          description:
            "Le planning indique qui intervient, quand, avec quelles informations et, si nécessaire, quelles pièces doivent être préparées avant le déplacement.",
          owner: "Le responsable planning",
          output:
            "Un rendez-vous confirmé avec un technicien, un créneau, une adresse et les moyens à préparer.",
          control:
            "Le technicien doit pouvoir préparer son déplacement depuis la fiche, sans rappeler la direction pour retrouver les informations essentielles.",
        },
        {
          label: "Intervention clôturée",
          title: "Faire remonter un résultat utilisable",
          input:
            "L’intervention réalisée, les constats terrain, les pièces utilisées et les éventuelles suites à prévoir.",
          description:
            "Le technicien confirme le travail réalisé, le temps passé, les pièces utilisées, les photos et la suite éventuelle. Une intervention non renseignée reste ouverte.",
          owner: "Le technicien intervenant",
          output:
            "Un compte rendu exploitable indiquant le résultat, le temps, les pièces, les preuves et la suite éventuelle.",
          control:
            "Le statut Terminé reste impossible tant que les informations nécessaires à la facturation ou au prochain passage ne sont pas renseignées.",
        },
        {
          label: "Facture envoyée",
          title: "Déclencher la facturation sans nouvelle recherche",
          input:
            "Une intervention clôturée avec le temps facturable, les fournitures, les conditions convenues et le compte rendu validé.",
          description:
            "La clôture fournit les éléments nécessaires à la facture. L’entreprise peut alors suivre l’envoi puis le paiement sans revenir vers le technicien ou la direction.",
          owner: "L’administration ou la personne chargée de facturer",
          output:
            "Une facture envoyée, rattachée à l’intervention, avec une échéance de paiement suivie.",
          control:
            "La liste des interventions terminées sans facture est contrôlée chaque semaine et toute exception reçoit un responsable.",
        },
      ],
      rulesTitle: "Les cinq règles qui évitent les demandes perdues",
      rules: [
        {
          title: "Une demande crée toujours une fiche",
          description:
            "Nom, téléphone, adresse, problème, disponibilité et photos éventuelles suffisent pour commencer.",
        },
        {
          title: "La priorité suit une règle commune",
          description:
            "Urgent, à planifier, devis nécessaire ou informations manquantes : l’équipe ne réinvente pas la décision à chaque appel.",
        },
        {
          title: "Cinq statuts rendent le travail visible",
          description: "Nouveau → Qualifié → Planifié → Terminé → Facturé.",
        },
        {
          title: "Chaque fiche a un responsable",
          description:
            "La personne qui doit agir maintenant et la prochaine action attendue sont toujours indiquées.",
        },
        {
          title: "La direction traite uniquement les exceptions",
          description:
            "Elle intervient si le devis dépasse un seuil convenu, si la demande est bloquée ou si une réclamation exige une décision.",
        },
      ],
      implementation: {
        startingPoint:
          "Commencez avec une seule file de demandes et une fiche minimale, même si le planning ou la facturation restent dans les outils actuels. Testez le flux pendant deux semaines avec l’équipe avant d’ajouter des champs, des statuts ou des automatisations.",
        cadence:
          "La personne au planning contrôle la file au début et à la fin de chaque journée. Une revue hebdomadaire de quinze minutes traite les interventions sans responsable, les clôtures incomplètes, les factures non envoyées et les exceptions récurrentes à transformer en règle.",
        escalation:
          "La direction intervient pour un engagement financier au-dessus du seuil convenu, une urgence qui déplace plusieurs clients, un litige, un risque de sécurité ou une demande bloquée malgré la règle commune. Les cas courants restent traités par l’équipe.",
      },
      example: {
        title: "une fuite signalée par WhatsApp",
        body:
          "L’assistante crée la fiche, applique la règle d’urgence et réserve un créneau. Le technicien reçoit l’adresse et les photos, puis ajoute son compte rendu. La fiche passe automatiquement dans la file « À facturer ».",
      },
      tools: [
        {
          slug: "organilog",
          name: "Organilog",
          description:
            "Pour centraliser les demandes, planifier les techniciens, compléter les rapports et préparer la facturation dans le même outil.",
        },
        {
          slug: "obat",
          name: "Obat",
          description:
            "À privilégier lorsque l’activité repose davantage sur les devis, les chantiers et la facturation que sur les dépannages quotidiens.",
        },
      ],
      system: {
        slug: "plomberie-chauffage",
        label: "Plomberie et chauffage",
      },
      checklist: [
        "Créer les cinq statuts dans l’outil utilisé par l’équipe.",
        "Définir les six informations obligatoires d’une nouvelle fiche.",
        "Attribuer un responsable à chaque étape du processus.",
        "Définir les trois situations qui nécessitent la direction.",
        "Tester le circuit avec une demande récente.",
      ],
      faqs: [
        {
          question: "Quel est le meilleur logiciel pour une petite entreprise de plomberie ?",
          answer:
            "Le bon choix dépend surtout du flux dominant. Pour des interventions terrain nombreuses, privilégiez le planning, les fiches d’intervention et les comptes rendus mobiles. Pour des chantiers plus longs, donnez davantage de poids aux devis, aux achats et au suivi de marge.",
        },
        {
          question: "Faut-il imposer un formulaire aux clients ?",
          answer:
            "Non. Le client peut continuer à appeler ou à écrire sur WhatsApp. L’important est que la personne qui reçoit la demande la transforme immédiatement en fiche structurée.",
        },
        {
          question: "À partir de combien de techniciens faut-il formaliser ce processus ?",
          answer:
            "Dès que plusieurs personnes peuvent recevoir, planifier ou réaliser une demande. Le signal le plus clair est simple : l’équipe doit-elle encore demander à la direction où en est une intervention ?",
        },
      ],
      conclusion:
        "Une demande entre une seule fois dans l’organisation et avance jusqu’à la facture, avec la bonne information au bon moment.",
      editorialReview: {
        clarity: 4,
        realism: 4,
        immediateUsefulness: 4,
        exampleQuality: 2,
        toolRelevance: 2,
        consistency: 2,
        readability: 1,
        reviewedAt: "2026-08-25",
      },
    },
  }),
  defineProcessGuide({
    slug: "organiser-demandes-devis-renovation",
    title: "Comment organiser les demandes de devis d’une entreprise de rénovation, du premier contact à la signature",
    cardTitle: "Comment organiser les demandes de devis d’une entreprise de rénovation ?",
    shortTitle: "Devis d’une entreprise de rénovation",
    category: "Devis et commandes",
    promise:
      "Un processus pour qualifier les projets avant de se déplacer, produire les devis utiles et relancer sans perdre les bonnes demandes.",
    guide: {
      sector: "Demandes de devis en rénovation",
      company: {
        profile:
          "Cette entreprise de rénovation intérieure compte huit personnes et reçoit une vingtaine de demandes par mois par téléphone, formulaire et recommandation.",
        friction:
          "Les visites sont acceptées trop tôt, parfois sans budget, sans calendrier ni périmètre précis. Les devis prennent du temps et les relances dépendent de la mémoire de la direction.",
      },
      processTitle: "Le processus de devis à mettre en place",
      processIntroduction:
        "Chaque contact doit être qualifié avant la visite, puis avancer avec une décision ou une prochaine relance datée.",
      steps: [
        { label: "Demande reçue", title: "Créer une trace unique", input: "Un appel, un formulaire ou une recommandation mentionnant un projet de rénovation.", description: "Le contact, le bien, la nature des travaux et la source de la demande sont enregistrés dès le premier échange.", owner: "La personne qui reçoit le contact", output: "Une fiche projet avec les coordonnées, le bien, le besoin initial et une date de réponse.", control: "Chaque nouveau contact apparaît dans la file commune avant la fin de la demi-journée." },
        { label: "Projet qualifié", title: "Vérifier l’adéquation", input: "La fiche projet et un premier échange avec la personne qui décide ou coordonne les travaux.", description: "Budget, délai, localisation, décisionnaires et niveau de précision permettent de décider si une visite est pertinente.", owner: "Le responsable commercial ou le dirigeant selon le seuil", output: "Une décision explicite : visite pertinente, informations à compléter, refus motivé ou orientation vers un partenaire.", control: "Aucune visite n’est ouverte sans budget indicatif, calendrier, localisation, périmètre et décisionnaire identifiés." },
        { label: "Visite préparée", title: "Arriver avec les bonnes questions", input: "Un projet qualifié, les documents disponibles et les inconnues qui empêchent encore de chiffrer.", description: "La visite est planifiée avec les documents, mesures et points techniques à confirmer sur place.", owner: "La personne chargée du chiffrage", output: "Un rendez-vous confirmé avec un objectif, une liste de mesures et les pièces à obtenir.", control: "La veille, le dossier précise l’accès, les interlocuteurs présents et les points techniques à lever." },
        { label: "Devis construit", title: "Transformer la visite en périmètre", input: "Le compte rendu de visite, les mesures, les choix client et les prix fournisseurs nécessaires.", description: "Lots, hypothèses, exclusions, délais et conditions de paiement sont explicités avant l’envoi.", owner: "Le responsable du chiffrage", output: "Un devis compréhensible avec périmètre, hypothèses, exclusions, calendrier et conditions de règlement.", control: "Une seconde lecture vérifie quantités, marge, cohérence technique et correspondance avec la demande qualifiée." },
        { label: "Relance planifiée", title: "Ne laisser aucun devis sans suite", input: "Le devis envoyé et la prochaine étape convenue avec le prospect.", description: "La date et l’objectif de la prochaine relance sont fixés dès l’envoi du devis.", owner: "Le responsable de la relation commerciale", output: "Une date de relance, un objectif d’échange et un statut partagé dans le portefeuille de devis.", control: "La revue hebdomadaire signale tout devis envoyé sans réponse, prochaine date ou motif de clôture." },
        { label: "Devis signé", title: "Confirmer l’engagement", input: "Un accord client sur le périmètre, le prix, les délais et les conditions de réalisation.", description: "Signature, acompte et fenêtre de démarrage déclenchent la préparation du chantier.", owner: "L’administration ou le responsable commercial", output: "Un engagement complet avec devis signé, acompte reçu et fenêtre de démarrage validée.", control: "Le projet ne devient pas un chantier planifiable tant que signature, acompte et coordonnées de facturation ne sont pas contrôlés." },
      ],
      rulesTitle: "Les règles qui protègent le temps de chiffrage",
      rules: [
        { title: "Une visite se mérite", description: "Aucune visite n’est planifiée sans localisation, type de travaux, échéance et ordre de grandeur du budget." },
        { title: "Un devis décrit aussi ce qui est exclu", description: "Les hypothèses et exclusions réduisent les incompréhensions et les modifications tardives." },
        { title: "Chaque devis a une prochaine date", description: "Envoyé ne signifie pas terminé : la relance est prévue avant de fermer la fiche." },
        { title: "La signature ne suffit pas", description: "Le chantier n’entre au planning qu’après validation des conditions et de l’acompte convenu." },
      ],
      implementation: {
        startingPoint: "Prenez les vingt dernières demandes et identifiez les informations qui auraient permis de refuser, compléter ou planifier une visite plus vite. Ces observations deviennent la fiche de qualification initiale et la checklist de visite, sans commencer par changer de logiciel.",
        cadence: "Le portefeuille est revu deux fois par semaine : nouvelles demandes à qualifier, visites à préparer, devis à terminer, relances datées et décisions en attente. Les devis perdus sont relus chaque mois pour corriger un critère de qualification ou une hypothèse de chiffrage.",
        escalation: "La direction arbitre les projets hors zone, les marges sous le seuil, les travaux techniquement incertains, les délais incompatibles avec la capacité ou les négociations qui modifient fortement le périmètre. Une relance ordinaire ne doit pas dépendre d’elle.",
      },
      example: {
        title: "Une rénovation complète d’appartement",
        body: "Une demande arrive pour rénover un appartement de 70 m². Avant la visite, l’entreprise confirme le budget, le délai souhaité et les lots concernés. La visite sert alors à mesurer et à lever les inconnues techniques. Le devis est envoyé avec ses hypothèses et une relance fixée sept jours plus tard. Après ajustement du périmètre, la signature et l’acompte ouvrent la préparation du chantier.",
      },
      tools: [
        { slug: "obat", name: "Obat", description: "Pour construire, envoyer et suivre les devis et factures d’une activité BTP." },
        { slug: "tolteck", name: "Tolteck", description: "Pour une gestion légère des devis et factures lorsque le besoin principal reste le chiffrage." },
      ],
      system: { slug: "renovation-interieur", label: "Rénovation intérieure" },
      checklist: ["Définir les critères qui autorisent une visite.", "Créer une fiche unique par projet.", "Standardiser les hypothèses et exclusions des devis.", "Planifier la relance au moment de l’envoi.", "Conditionner le démarrage à la signature et à l’acompte."],
      faqs: [
        { question: "Quelles informations demander avant une visite ?", answer: "Le lieu, le type de bien, les travaux envisagés, le calendrier, les décisionnaires et un budget indicatif." },
        { question: "Quand relancer un devis ?", answer: "Fixez la date selon ce qui a été convenu avec le prospect, généralement entre trois et sept jours après l’envoi." },
        { question: "Comment réduire les devis sans réponse ?", answer: "Qualifiez davantage avant la visite et convenez d’une prochaine étape avant d’envoyer le devis." },
      ],
      conclusion: "L’entreprise protège son temps lorsqu’elle qualifie avant de se déplacer et donne à chaque devis une suite datée jusqu’à la décision.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 1, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-chantier-menuiserie",
    title: "Comment organiser un chantier de menuiserie, du devis signé à la réception",
    shortTitle: "Organiser un chantier de menuiserie",
    category: "Réalisation et suivi",
    promise:
      "Un flux commun pour passer du devis signé aux mesures, à la fabrication, à la pose et à la réception sans information perdue.",
    guide: {
      sector: "Organisation d’un chantier de menuiserie",
      company: { profile: "Cette menuiserie-agencement emploie six personnes entre atelier, pose et administratif, avec plusieurs chantiers en parallèle.", friction: "Les mesures, choix de finition et dates changent entre le devis, l’atelier et la pose. Les informations restent dans des messages ou sur des feuilles différentes." },
      processTitle: "Le processus chantier à mettre en place",
      processIntroduction: "Le dossier chantier devient la référence commune depuis la signature jusqu’à la levée des réserves.",
      steps: [
        { label: "Devis signé", title: "Ouvrir un dossier exécutable", input: "Le devis accepté, les choix retenus, les échanges commerciaux et la preuve de l’acompte.", description: "Le périmètre vendu, les options retenues, l’acompte et la fenêtre de réalisation sont confirmés.", owner: "Le chargé d’affaires", output: "Un dossier chantier numéroté avec périmètre, client, adresse, échéances et responsable désigné.", control: "Le dossier est comparé au devis signé avant toute prise de mesures destinée à la fabrication." },
        { label: "Mesures validées", title: "Figer les données de fabrication", input: "Le dossier chantier, le relevé sur site, les contraintes d’accès et les choix de finition.", description: "Les côtes, contraintes du site, plans et validations client sont regroupés dans le dossier.", owner: "Le métreur ou le conducteur de travaux", output: "Un relevé daté et une version validée des plans, côtes, finitions et contraintes techniques.", control: "Les dimensions critiques sont vérifiées deux fois et toute modification client laisse une nouvelle version identifiable." },
        { label: "Fabrication lancée", title: "Autoriser l’atelier", input: "Les mesures validées, le plan approuvé, la nomenclature et les délais fournisseurs confirmés.", description: "Une validation explicite déclenche les achats et la fabrication à partir de la dernière version approuvée.", owner: "Le responsable atelier", output: "Un ordre de fabrication relié à la bonne version et des achats spécifiques autorisés.", control: "L’atelier refuse tout lancement sans statut Bon pour fabrication, version, date et approbateur visibles." },
        { label: "Pose préparée", title: "Prévoir le chantier avant le départ", input: "Les éléments fabriqués, le créneau client, les contraintes du site et les besoins de pose.", description: "Équipe, accès, matériel, livraisons et protection du site sont vérifiés avant la date de pose.", owner: "Le conducteur de travaux ou le responsable pose", output: "Une intervention confirmée avec équipe, chargement, matériel, protections, accès et interlocuteur sur place.", control: "La checklist de départ est terminée avant chargement ; tout manque critique bloque la confirmation du chantier." },
        { label: "Pose réalisée", title: "Documenter le résultat", input: "Le dossier de pose, les éléments contrôlés, le matériel et les consignes de protection du site.", description: "Les éléments posés, ajustements et éventuelles réserves sont enregistrés sur le dossier.", owner: "Le chef d’équipe de pose", output: "Un compte rendu avec ouvrages posés, ajustements, photos, temps et réserves éventuelles.", control: "Le chef d’équipe compare le résultat au plan validé et fait corriger ou déclarer tout écart avant départ." },
        { label: "Réception signée", title: "Clôturer avec le client", input: "Le chantier terminé, le compte rendu de pose et la liste des écarts encore ouverts.", description: "La réception, les réserves et leur date de levée rendent la fin du chantier incontestable.", owner: "Le chargé d’affaires ou le conducteur de travaux", output: "Un procès-verbal signé et, si besoin, une liste de réserves attribuées avec échéances.", control: "Le dossier ne se clôture qu’après signature, levée documentée des réserves et déclenchement du solde facturable." },
      ],
      rulesTitle: "Les règles qui évitent les reprises",
      rules: [
        { title: "Une seule version est bonne à fabriquer", description: "Plans et mesures disposent d’un statut validé et d’une date." },
        { title: "La fabrication nécessite un feu vert", description: "Aucun achat spécifique ni lancement atelier sans validation du dossier." },
        { title: "La pose possède sa propre checklist", description: "Accès, protections, matériel et disponibilité du client sont confirmés avant le départ." },
        { title: "Une réserve a un responsable et une date", description: "Elle ne reste jamais dans un message isolé après la réception." },
      ],
      implementation: {
        startingPoint: "Choisissez un chantier représentatif et rassemblez dans un même dossier le devis, les plans, les mesures, les validations et la préparation de pose. Notez chaque recherche d’information ou reprise : elle révèle le prochain champ, contrôle ou changement de version à formaliser.",
        cadence: "Le conducteur de travaux vérifie chaque semaine les dossiers en attente de mesures, de validation, de fabrication ou de réception. L’atelier tient un point court sur les lancements autorisés et les blocages ; les réserves ouvertes restent visibles jusqu’à leur levée prouvée.",
        escalation: "La direction tranche une modification client qui change prix ou délai, un écart de mesure engageant une refabrication, un retard fournisseur critique, un risque de sécurité ou une réserve contestée. Les ajustements prévus restent gérés par le responsable du chantier.",
      },
      example: { title: "Un agencement sur mesure", body: "Après signature, le conducteur de travaux ouvre le dossier et organise la prise de mesures. Le plan final est validé par le client avant l’achat des panneaux. L’atelier travaille uniquement sur cette version. Deux jours avant la pose, les accès et le matériel sont confirmés. La réception signale un réglage de porte, affecté au poseur avec une date de retour, puis le dossier est clôturé après levée de la réserve." },
      tools: [
        { slug: "alobees", name: "Alobees", description: "Pour coordonner planning d’équipe, suivi de chantier et remontées terrain." },
        { slug: "obat", name: "Obat", description: "Pour conserver la continuité entre devis, chantier et facturation." },
      ],
      system: { slug: "menuiserie-agencement", label: "Menuiserie et agencement" },
      checklist: ["Créer un dossier unique dès la signature.", "Identifier la version validée des plans et mesures.", "Ajouter un feu vert avant fabrication.", "Préparer une checklist de pose.", "Affecter chaque réserve avec une date."],
      faqs: [
        { question: "Qui valide les mesures finales ?", answer: "Le rôle doit être nommé dans l’entreprise ; la validation client est ajoutée lorsque les choix visibles ou le périmètre évoluent." },
        { question: "Quand lancer les achats spécifiques ?", answer: "Après validation des mesures, des finitions et de la version de plan destinée à la fabrication." },
        { question: "Comment gérer les réserves ?", answer: "Dans le dossier chantier, avec une description, un responsable, une échéance et une preuve de levée." },
      ],
      conclusion: "Le chantier devient plus fiable lorsque chaque passage, de la mesure à la réception, exige une validation observable et une version commune.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-interventions-nettoyage",
    title: "Comment organiser les interventions récurrentes d’une société de nettoyage",
    shortTitle: "Interventions de nettoyage",
    category: "Planning et interventions",
    promise: "Un processus récurrent pour transformer chaque contrat en planning exécutable, contrôler la qualité et traiter les écarts avant la réclamation.",
    guide: {
      sector: "Interventions récurrentes de nettoyage",
      company: { profile: "Cette société de nettoyage compte douze agents répartis sur vingt sites récurrents, souvent tôt le matin ou en soirée.", friction: "Les consignes changent selon les sites, les remplacements se décident dans l’urgence et les écarts sont connus seulement quand le client se plaint." },
      processTitle: "Le cycle d’intervention à répéter",
      processIntroduction: "Chaque contrat devient un cycle visible qui prépare l’intervention, confirme son exécution et transforme les écarts en actions suivies.",
      steps: [
        { label: "Contrat cadré", title: "Traduire la vente en consignes", input: "Le contrat signé, la visite du site et les engagements pris auprès du client.", description: "Fréquences, zones, tâches, horaires, accès, consommables et critères de qualité sont formalisés.", owner: "Le responsable de secteur", output: "Une fiche site exploitable avec prestations, fréquences, accès, matériel, risques et critères de contrôle.", control: "La fiche est relue avec le client et l’exploitation avant le premier passage puis datée à chaque modification." },
        { label: "Planning publié", title: "Rendre les affectations visibles", input: "Les fiches site, les fréquences contractuelles, les compétences et les disponibilités des agents.", description: "Chaque site possède ses créneaux, son agent titulaire et une solution de remplacement.", owner: "Le responsable planning", output: "Un planning partagé précisant site, horaire, durée, titulaire, remplaçant et contraintes d’accès.", control: "Chaque contrat actif possède tous ses passages ; les absences et conflits apparaissent avant la période concernée." },
        { label: "Agent affecté", title: "Partager la bonne fiche site", input: "Un passage planifié et la dernière version validée de la fiche du site.", description: "L’agent reçoit les consignes à jour, les codes d’accès et les points de vigilance.", owner: "Le responsable de secteur", output: "Un agent confirmé qui dispose des accès, produits, matériels et consignes nécessaires.", control: "Avant une première affectation ou un remplacement, l’accès à la fiche et les habilitations sont vérifiés." },
        { label: "Passage confirmé", title: "Tracer l’exécution", input: "L’intervention planifiée, les consignes du site et les anomalies observées pendant le passage.", description: "Le passage, les anomalies et les consommables manquants remontent sans attendre la fin de semaine.", owner: "L’agent intervenant", output: "Une preuve de passage avec heure, tâches réalisées, anomalies, photos utiles et besoins de consommables.", control: "Tout passage prévu sans confirmation ou motif d’absence génère une alerte le jour même." },
        { label: "Qualité contrôlée", title: "Vérifier avant la plainte", input: "Les critères du contrat, les confirmations de passage et les écarts signalés depuis le dernier contrôle.", description: "Un contrôle court porte sur les critères convenus avec le client.", owner: "Le responsable de secteur ou le contrôleur qualité", output: "Un contrôle daté avec critères observés, conformité, écarts et éléments de preuve.", control: "La fréquence dépend du risque et du contrat ; aucun contrôle ne se limite à une appréciation générale non traçable." },
        { label: "Écart corrigé", title: "Boucler l’amélioration", input: "Un écart déclaré par l’agent, observé au contrôle ou signalé par le client.", description: "Chaque écart reçoit une action, un responsable et une date de vérification.", owner: "Le responsable de secteur", output: "Une correction réalisée, expliquée à l’équipe et vérifiée à une date précise.", control: "L’écart reste ouvert tant que la preuve de correction et le contrôle d’efficacité ne sont pas enregistrés." },
      ],
      rulesTitle: "Les règles qui sécurisent le récurrent",
      rules: [
        { title: "La fiche site est la référence", description: "Les consignes ne reposent ni sur la mémoire de l’agent ni sur un ancien message." },
        { title: "Chaque absence a un plan de remplacement", description: "La direction ne cherche pas une solution depuis zéro à chaque imprévu." },
        { title: "Le contrôle porte sur des critères convenus", description: "La qualité devient observable et non une impression générale." },
        { title: "Un écart déclenche une action", description: "La note seule ne suffit pas : responsable et date de contrôle ferment la boucle." },
      ],
      implementation: {
        startingPoint: "Commencez par trois sites différents : un simple, un sensible et un souvent remplacé. Construisez leurs fiches avec les agents qui y travaillent, puis faites-les utiliser par un remplaçant. Les questions qu’il pose montrent les consignes encore implicites.",
        cadence: "Le planning et les absences sont contrôlés chaque jour. Le responsable de secteur examine chaque semaine les passages non confirmés et les anomalies, puis réalise les contrôles qualité selon le risque contractuel. Un point mensuel recherche les écarts qui reviennent malgré les corrections.",
        escalation: "La direction intervient lors d’une absence sans remplacement possible, d’un risque pour les personnes ou les locaux, d’une réclamation contractuelle, d’un écart répété après correction ou d’un besoin qui dépasse le contrat. Le reste appartient au responsable de secteur.",
      },
      example: { title: "Un site de bureaux trois fois par semaine", body: "Le contrat est transformé en fiche site avec zones, tâches et accès. Le planning récurrent affecte l’agent titulaire et son remplaçant. Après chaque passage, l’agent confirme l’exécution et signale un consommable manquant. Le responsable réalise un contrôle mensuel, affecte une correction si nécessaire puis vérifie sa réalisation avant le prochain point client." },
      tools: [{ slug: "organilog", name: "Organilog", description: "Pour planifier les interventions récurrentes, partager les fiches site et suivre les retours terrain." }],
      system: { slug: "nettoyage-professionnel", label: "Nettoyage professionnel" },
      checklist: ["Créer une fiche standard pour chaque site.", "Nommer un titulaire et un remplaçant.", "Publier le planning récurrent.", "Définir une preuve simple de passage.", "Planifier les contrôles qualité et le suivi des écarts."],
      faqs: [
        { question: "Que doit contenir une fiche site ?", answer: "Les accès, horaires, zones, tâches, produits, matériel, interlocuteurs et critères de contrôle." },
        { question: "Faut-il contrôler chaque intervention ?", answer: "Non. La confirmation de passage est systématique ; le contrôle qualité suit une fréquence adaptée au risque et au contrat." },
        { question: "Comment organiser les remplacements ?", answer: "Préparez les compétences, disponibilités et accès des remplaçants avant l’absence, dans le même planning." },
      ],
      conclusion: "Le contrat récurrent devient maîtrisable lorsque les consignes, le planning, la preuve de passage et la correction des écarts forment une seule boucle. L’objectif est que le responsable voie le problème avant le client et sache immédiatement qui doit agir.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-parcours-client-garage",
    title: "Comment organiser le parcours client d’un garage, du rendez-vous au paiement",
    shortTitle: "Parcours client d’un garage",
    category: "Parcours client",
    promise: "Un processus atelier pour relier rendez-vous, diagnostic, accord client, réparation, restitution et paiement dans un dossier unique.",
    guide: {
      sector: "Parcours client d’un garage automobile",
      company: { profile: "Ce garage indépendant compte quatre mécaniciens et reçoit une dizaine de véhicules par jour pour entretien, panne et réparation.", friction: "Les informations du rendez-vous ne suivent pas toujours le véhicule. Les travaux complémentaires sont validés oralement et la restitution dépend de plusieurs appels internes." },
      processTitle: "Le parcours atelier à mettre en place",
      processIntroduction: "Un dossier véhicule accompagne le client depuis la prise de rendez-vous jusqu’au règlement et conserve chaque décision.",
      steps: [
        { label: "Rendez-vous pris", title: "Préparer l’arrivée", input: "Un appel, une demande en ligne ou une recommandation concernant un véhicule et un besoin.", description: "Client, véhicule, motif, symptômes, disponibilité et contraintes de mobilité sont enregistrés.", owner: "Le conseiller service ou la personne à l’accueil", output: "Un rendez-vous avec identité du véhicule, demande, créneau, durée estimée et informations à préparer.", control: "Les rendez-vous incomplets sont rappelés avant le jour prévu ; le planning ne doit pas découvrir le motif à l’arrivée." },
        { label: "Véhicule réceptionné", title: "Confirmer l’état et la demande", input: "Le véhicule présenté, le rendez-vous préparé, les clés et les déclarations du client.", description: "Le kilométrage, l’état visible, les clés et le périmètre autorisé sont validés avec le client.", owner: "Le conseiller service", output: "Un ordre de réparation signé avec état d’entrée, demande confirmée, autorisation initiale et contact joignable.", control: "Le client et l’accueil valident ensemble le kilométrage, l’état visible, les objets confiés et la limite d’engagement." },
        { label: "Diagnostic validé", title: "Produire une décision claire", input: "L’ordre de réparation, les constats du mécanicien, les mesures et les contrôles réalisés.", description: "Le diagnostic distingue travaux nécessaires, recommandations et éléments à surveiller.", owner: "Le mécanicien référent puis le chef d’atelier", output: "Un diagnostic relu avec travaux proposés, pièces, temps, risques et niveau de priorité.", control: "Le chef d’atelier vérifie la cohérence technique et sépare les faits observés des recommandations avant chiffrage." },
        { label: "Accord obtenu", title: "Tracer l’autorisation", input: "Le diagnostic, le devis complémentaire, le délai révisé et les coordonnées du client.", description: "Prix, délai et travaux complémentaires sont acceptés avant l’exécution.", owner: "Le conseiller service", output: "Une autorisation datée indiquant périmètre, montant, délai et canal d’accord du client.", control: "Aucun travail hors ordre initial n’est lancé sans accord traçable, sauf mesure de sécurité explicitement prévue et documentée." },
        { label: "Véhicule restitué", title: "Expliquer le travail réalisé", input: "Les travaux terminés, les contrôles finaux, les pièces remplacées et les recommandations encore ouvertes.", description: "La restitution reprend les réparations, contrôles, recommandations et prochaine échéance.", owner: "Le conseiller service ou le mécanicien référent", output: "Un véhicule rendu avec explication, documents, recommandations et prochaine action comprises par le client.", control: "Avant remise des clés, l’ordre de réparation, le contrôle final et la facture doivent décrire le même périmètre." },
        { label: "Paiement enregistré", title: "Clôturer le dossier", input: "La facture définitive, le véhicule restitué et le moyen de règlement convenu.", description: "Facture, règlement et éventuel suivi après intervention sont rattachés au véhicule.", owner: "L’accueil ou la caisse", output: "Un règlement enregistré, une facture remise et les rappels futurs rattachés au dossier véhicule.", control: "La clôture quotidienne rapproche véhicules restitués, factures, règlements et dossiers encore ouverts pour une suite." },
      ],
      rulesTitle: "Les règles qui évitent les malentendus",
      rules: [
        { title: "Le dossier suit le véhicule", description: "Les informations ne se dispersent pas entre l’accueil, l’atelier et la caisse." },
        { title: "Un complément exige un accord", description: "Le montant, le travail et le délai sont confirmés avant toute intervention hors périmètre." },
        { title: "La restitution est préparée", description: "Le client reçoit une explication cohérente, même si son interlocuteur initial est absent." },
        { title: "La clôture prévoit la suite", description: "Une recommandation non réalisée devient un rappel daté, pas une note oubliée." },
      ],
      implementation: {
        startingPoint: "Testez la fiche véhicule sur une semaine d’entrées atelier et comparez-la aux questions réellement posées aux mécaniciens. Gardez seulement les informations qui préparent une décision, une autorisation ou une restitution ; les champs sans usage ralentissent l’accueil sans fiabiliser le parcours.",
        cadence: "Le chef d’atelier passe en revue les véhicules au début, au milieu et avant la fin de journée : diagnostic attendu, accord client, pièce manquante, heure de restitution et dossier bloqué. La clôture quotidienne rapproche les véhicules sortis, factures et règlements.",
        escalation: "La direction ou le chef d’atelier arbitre un risque de sécurité, un diagnostic incertain, un dépassement important, une immobilisation non prévue, un désaccord client ou une remise commerciale hors seuil. Les compléments ordinaires suivent le circuit d’accord documenté.",
      },
      example: { title: "Un véhicule déposé pour une révision", body: "Le rendez-vous enregistre le modèle, le kilométrage et le motif. À la réception, l’accueil confirme l’état du véhicule. L’atelier détecte des plaquettes à remplacer et envoie le montant et le délai au client. L’accord est enregistré avant les travaux. À la restitution, la facture reprend les opérations et une échéance de contrôle est ajoutée au dossier." },
      tools: [
        { slug: "keralpha", name: "Keralpha", description: "Pour centraliser planning, véhicules, atelier et suivi client." },
        { slug: "autoprogestion", name: "AutoProGestion", description: "Pour gérer rendez-vous, devis, factures et stocks dans un même dossier garage." },
      ],
      system: { slug: "garage-automobile", label: "Garage automobile" },
      checklist: ["Créer un dossier par véhicule et intervention.", "Standardiser la réception du véhicule.", "Tracer chaque accord complémentaire.", "Préparer la restitution depuis le dossier.", "Enregistrer le règlement et les rappels futurs."],
      faqs: [
        { question: "Comment tracer un accord client ?", answer: "Conservez le montant, le périmètre, le délai, la date et le canal d’acceptation dans le dossier véhicule." },
        { question: "Que vérifier à la réception ?", answer: "Identité du véhicule, kilométrage, état visible, objets ou clés confiés, demande et limite d’autorisation." },
        { question: "Comment réduire les appels de suivi ?", answer: "Définissez des statuts atelier et un moment prévu pour informer le client lorsque le diagnostic ou le délai change." },
      ],
      conclusion: "Le client perçoit un service plus fiable lorsque l’accueil, l’atelier et la restitution travaillent à partir du même dossier et des mêmes décisions tracées. L’équipe réduit aussi les appels internes et les travaux lancés sans accord clair.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 1, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-commandes-stocks-restaurant",
    title: "Comment organiser les commandes et les stocks d’un restaurant",
    shortTitle: "Commandes et stocks d’un restaurant",
    category: "Commandes et stocks",
    promise: "Un cycle simple pour transformer les ventes et les besoins de production en commandes fournisseurs, réceptions contrôlées et stock fiable.",
    guide: {
      sector: "Commandes et stocks d’un restaurant",
      company: { profile: "Ce restaurant sert environ quatre-vingts couverts par jour et travaille avec une quinzaine de fournisseurs de frais, boissons et épicerie.", friction: "Les commandes reposent sur l’habitude. Les ruptures apparaissent en plein service tandis que certains produits sont surstockés ou perdus." },
      processTitle: "Le cycle d’approvisionnement à mettre en place",
      processIntroduction: "Les besoins partent du menu, des prévisions et du stock disponible, puis reviennent dans un stock contrôlé après réception.",
      steps: [
        { label: "Besoin estimé", title: "Partir de la production prévue", input: "Le menu, les fiches techniques, les réservations, les ventes récentes et les événements annoncés.", description: "Couverts, réservations, ventes passées, événements et fiches techniques donnent un besoin réaliste.", owner: "Le chef de cuisine avec le responsable de salle", output: "Une prévision de production par famille de produits et période de service.", control: "Les hypothèses exceptionnelles sont notées et comparées aux ventes réelles pour améliorer la prochaine estimation." },
        { label: "Stock compté", title: "Vérifier ce qui est réellement disponible", input: "La liste des produits à compter, le stock théorique et les zones de rangement concernées.", description: "Les produits sensibles sont comptés selon une fréquence adaptée avant la commande.", owner: "Le responsable désigné pour chaque zone", output: "Un stock réel daté avec quantités utilisables, pertes identifiées et produits proches de leur limite.", control: "Les produits chers, périssables ou critiques sont recomptés en cas d’écart important avec le stock théorique." },
        { label: "Commande préparée", title: "Calculer le manque utile", input: "Le besoin prévu, le stock réel, les livraisons déjà attendues et les conditionnements fournisseurs.", description: "Besoin, stock, sécurité et conditionnement fournisseur déterminent les quantités.", owner: "Le chef ou le responsable des achats", output: "Une proposition de commande par fournisseur avec quantités, prix attendus et date nécessaire.", control: "Les quantités inhabituelles, substitutions et dépassements de seuil sont revus avant envoi par la personne habilitée." },
        { label: "Commande envoyée", title: "Conserver une preuve commune", input: "La proposition validée, les coordonnées du fournisseur et le créneau de livraison accepté.", description: "Quantités, prix, date et livraison attendue sont visibles par cuisine et gestion.", owner: "La personne chargée des achats", output: "Une commande horodatée et accessible avec références, quantités, prix, livraison et confirmation fournisseur.", control: "Toute commande orale est retranscrite ; le planning de réception doit correspondre aux commandes confirmées." },
        { label: "Livraison contrôlée", title: "Vérifier avant de ranger", input: "La marchandise livrée, la commande attendue, le bon de livraison et le matériel de contrôle.", description: "Quantité, qualité, température, prix et écart sont contrôlés à la réception.", owner: "La personne formée qui réceptionne", output: "Une livraison acceptée, refusée ou acceptée avec réserve, accompagnée des écarts et preuves utiles.", control: "Température, intégrité, dates, quantités et prix sont vérifiés avant rangement et signature du bon." },
        { label: "Stock mis à jour", title: "Rendre le prochain calcul fiable", input: "Les quantités acceptées, les substitutions, les refus et les écarts enregistrés à la réception.", description: "Les quantités reçues et écarts validés alimentent le stock disponible.", owner: "Le réceptionnaire ou le responsable de stock", output: "Un stock disponible actualisé et des litiges fournisseurs attribués avec prochaine action.", control: "La mise à jour est rapprochée du bon accepté ; aucun écart ne disparaît dans le rangement sans traitement." },
      ],
      rulesTitle: "Les règles qui réduisent ruptures et pertes",
      rules: [
        { title: "Chaque famille a sa fréquence", description: "Le frais n’est pas compté comme l’épicerie ou les boissons." },
        { title: "La commande part d’un besoin", description: "On ne commande pas seulement pour revenir au niveau de la semaine précédente." },
        { title: "La réception précède le rangement", description: "Une livraison non contrôlée rend les stocks et les coûts faux." },
        { title: "Un écart fournisseur est documenté", description: "Manquant, substitution ou variation de prix déclenche une décision visible." },
      ],
      implementation: {
        startingPoint: "Sélectionnez vingt références qui coûtent cher, se perdent vite ou provoquent une rupture visible en service. Pendant deux semaines, reliez prévision, comptage, commande et réception uniquement sur ce périmètre. Étendez ensuite la méthode par famille, pas référence par référence au hasard.",
        cadence: "Les besoins sont estimés selon le calendrier des commandes ; les produits critiques suivent un comptage plus fréquent. Chaque livraison est contrôlée immédiatement. Une revue hebdomadaire compare ruptures, pertes, écarts de prix et surstocks pour ajuster les seuils ou les prévisions.",
        escalation: "La direction arbitre un changement de fournisseur, un dépassement d’achat, une rupture qui impose de modifier la carte, un problème sanitaire, une variation de prix importante ou un écart répété. Les quantités habituelles restent décidées dans le cadre validé.",
      },
      example: { title: "Préparer le service du week-end", body: "Le jeudi, la cuisine estime les besoins à partir des réservations et des ventes des derniers week-ends. Les produits frais et les boissons prioritaires sont comptés. La commande complète seulement l’écart avec un stock de sécurité défini. À la livraison, les quantités et températures sont contrôlées avant rangement ; un produit manquant est remplacé dans le plan de production et le stock est mis à jour." },
      tools: [
        { slug: "lightspeed", name: "Lightspeed", description: "Pour relier ventes, inventaire, commandes et pilotage lorsque le restaurant utilise déjà une caisse intégrée." },
        { slug: "zelty", name: "Zelty", description: "Pour centraliser commandes, encaissement et opérations dans les établissements orientés restauration." },
      ],
      system: { slug: "restaurant", label: "Restaurant" },
      checklist: ["Définir les produits et fréquences de comptage.", "Relier les besoins aux prévisions de production.", "Formaliser le calcul de quantité à commander.", "Contrôler toute livraison avant rangement.", "Mettre à jour le stock et traiter les écarts."],
      faqs: [
        { question: "Faut-il compter tout le stock chaque jour ?", answer: "Non. Comptez fréquemment les produits chers, périssables ou critiques et espacez les familles plus stables." },
        { question: "Comment définir un stock de sécurité ?", answer: "Tenez compte du délai fournisseur, de la variabilité des ventes, du conditionnement et du coût d’une rupture." },
        { question: "Qui valide les commandes ?", answer: "Le rôle dépend de la taille du restaurant, mais le seuil de validation et les exceptions doivent être écrits." },
      ],
      conclusion: "Le stock devient fiable lorsque le besoin, le comptage, la commande et la réception forment un cycle continu plutôt que quatre tâches séparées.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 1, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-suivi-administratif-formation",
    title: "Comment organiser le suivi administratif d’un organisme de formation, de l’inscription à l’attestation",
    shortTitle: "Suivi administratif d’une formation",
    category: "Documents et administration",
    promise: "Un dossier unique pour suivre inscription, convention, convocations, présence, évaluation et attestation sans reconstruire les documents à chaque session.",
    guide: {
      sector: "Suivi administratif d’un organisme de formation",
      company: { profile: "Cet organisme de formation organise plusieurs sessions inter et intra-entreprise chaque mois avec des financeurs et formats différents.", friction: "Les informations de l’apprenant, du client et de la session sont recopiées dans plusieurs documents. Les pièces manquantes sont découvertes au moment de facturer ou d’un contrôle." },
      processTitle: "Le dossier de formation à mettre en place",
      processIntroduction: "Une inscription ouvre un dossier qui produit les documents attendus au bon moment et conserve les preuves jusqu’à la clôture.",
      steps: [
        { label: "Inscription reçue", title: "Créer le dossier", input: "Un bulletin, un accord client ou une demande individuelle rattachée à une action de formation.", description: "Apprenant, client, session, financement, besoins et contacts sont centralisés.", owner: "L’administration des formations", output: "Un dossier identifié avec apprenant, commanditaire, session, financement, besoins et prochaine pièce attendue.", control: "Les doublons, coordonnées incomplètes et incohérences entre client, participant et session sont traités dès l’ouverture." },
        { label: "Dossier validé", title: "Vérifier les prérequis", input: "Le dossier ouvert, le programme, les exigences du financeur et les besoins déclarés par l’apprenant.", description: "Convention ou contrat, financement, prérequis et aménagements sont confirmés avant convocation.", owner: "Le référent administratif avec le référent pédagogique", output: "Un dossier autorisé à participer, avec accord contractuel, financement, prérequis et aménagements confirmés.", control: "Une checklist bloque la convocation si une pièce obligatoire, un accord ou un besoin d’adaptation reste sans décision." },
        { label: "Convocation envoyée", title: "Préparer la participation", input: "Le dossier validé, les informations logistiques définitives et les consignes propres à la session.", description: "Dates, lieu, accès, horaires, programme et contact sont transmis et tracés.", owner: "L’administration des formations", output: "Une convocation envoyée au bon destinataire avec toutes les informations nécessaires et une preuve d’envoi.", control: "Avant envoi, dates, horaires, adresse ou lien, programme et contacts sont rapprochés de la session publiée." },
        { label: "Présence enregistrée", title: "Conserver la preuve d’exécution", input: "La liste attendue, le déroulé réel de la session et les justificatifs transmis par le formateur.", description: "Émargements, absences et incidents sont rattachés à la session.", owner: "Le formateur puis l’administration", output: "Une présence consolidée par participant avec horaires, absences, incidents et justificatifs disponibles.", control: "Les émargements sont rapprochés de la liste attendue rapidement, tant que les personnes peuvent confirmer les écarts." },
        { label: "Évaluation collectée", title: "Mesurer et documenter", input: "Les participants réellement présents, les objectifs pédagogiques et les modalités d’évaluation prévues.", description: "Évaluations des acquis et satisfaction sont collectées selon le dispositif prévu.", owner: "Le formateur et le référent pédagogique", output: "Des résultats d’acquis et de satisfaction rattachés à la bonne personne et à la bonne session.", control: "Les évaluations manquantes ou incohérentes sont signalées avant production des attestations et clôture pédagogique." },
        { label: "Attestation envoyée", title: "Clôturer le dossier", input: "Les présences validées, les résultats disponibles, les conditions contractuelles et les données de facturation.", description: "Attestation, facture et pièces finales sont générées à partir des informations déjà validées.", owner: "L’administration des formations", output: "Une attestation exacte, les pièces de clôture envoyées, la facture déclenchée et le dossier archivé.", control: "La checklist finale rapproche identité, intitulé, dates, durée, présence, financeur, facture et règles de conservation." },
      ],
      rulesTitle: "Les règles qui fiabilisent les dossiers",
      rules: [
        { title: "Une donnée possède une source", description: "Nom, session ou financeur ne sont pas corrigés séparément dans chaque document." },
        { title: "Chaque pièce a une échéance", description: "Manquante devient une action attribuée, pas une surprise de fin de session." },
        { title: "La présence est rapprochée rapidement", description: "Les écarts sont traités tant que formateur et participants peuvent encore les confirmer." },
        { title: "La clôture suit une checklist", description: "Attestation, évaluation, facture et archivage sont vérifiés avant de fermer le dossier." },
      ],
      implementation: {
        startingPoint: "Prenez une session récemment clôturée et reconstruisez la chronologie de chaque pièce. Identifiez les données recopiées, les documents obtenus trop tard et les preuves recherchées après coup. Cette analyse définit la fiche source, les échéances et la checklist de clôture.",
        cadence: "L’administration contrôle les nouveaux dossiers chaque jour, les pièces avant convocation, les présences juste après la session et les clôtures au moins chaque semaine. Le référent pédagogique examine périodiquement les évaluations et incidents afin de transformer les écarts récurrents en amélioration documentée.",
        escalation: "La direction ou le référent compétent intervient pour un financement incertain, un prérequis non respecté, un besoin d’aménagement non résolu, une preuve manquante, une réclamation ou une situation susceptible d’affecter la conformité. Les relances documentaires ordinaires restent attribuées.",
      },
      example: { title: "Une session intra-entreprise de douze participants", body: "L’accord du client ouvre la session et les douze dossiers participants. Les prérequis et besoins d’aménagement sont vérifiés avant l’envoi groupé des convocations. Le formateur transmet les présences le jour même. Les évaluations sont rapprochées de la liste réelle, puis les attestations et la facture sont produites depuis les données validées avant archivage." },
      tools: [
        { slug: "digiforma", name: "Digiforma", description: "Pour centraliser gestion administrative, documents, évaluations et suivi Qualiopi." },
        { slug: "dendreo", name: "Dendreo", description: "Pour piloter sessions, apprenants, documents et obligations d’un organisme de formation." },
      ],
      system: { slug: "organisme-de-formation", label: "Organisme de formation" },
      checklist: ["Définir les données sources d’un dossier.", "Lister les pièces et leurs échéances.", "Automatiser les documents depuis les données validées.", "Rapprocher les présences après chaque session.", "Créer une checklist de clôture et d’archivage."],
      faqs: [
        { question: "Quels documents centraliser ?", answer: "Contrat ou convention, programme, convocation, éléments de financement, présence, évaluations, attestation et facture selon le cas." },
        { question: "Quand contrôler les pièces manquantes ?", answer: "À l’ouverture, avant la session, juste après la session et au moment de la clôture, avec un responsable à chaque contrôle." },
        { question: "Comment éviter les doubles saisies ?", answer: "Définissez une fiche source par apprenant et session, puis générez les documents depuis ces informations." },
      ],
      conclusion: "Le suivi administratif devient plus léger lorsque chaque document est le résultat d’un dossier vivant plutôt qu’un fichier recréé séparément. Les contrôles deviennent alors prévisibles, les pièces manquantes visibles et la clôture ne dépend plus d’une reconstruction tardive.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "organiser-mission-agence",
    title: "Comment organiser une mission d’agence, du brief à la facturation",
    shortTitle: "Organiser une mission d’agence",
    category: "Réalisation et suivi",
    promise: "Un processus commun pour cadrer le brief, planifier la production, obtenir les validations et facturer sans perdre le périmètre vendu.",
    guide: {
      sector: "Organisation d’une mission d’agence",
      company: { profile: "Cette agence de huit personnes mène en parallèle des projets de stratégie, création et acquisition pour une quinzaine de clients.", friction: "Les briefs sont incomplets, les retours arrivent dans plusieurs canaux et les demandes supplémentaires se glissent dans la production sans arbitrage de délai ou de budget." },
      processTitle: "Le processus de mission à mettre en place",
      processIntroduction: "Le brief validé devient le point de départ d’un flux qui protège le périmètre, rend les validations visibles et prépare la facturation.",
      steps: [
        { label: "Brief validé", title: "Aligner le résultat attendu", input: "La demande du client, le contexte disponible, les contraintes et les personnes qui participeront aux décisions.", description: "Objectif, cible, livrables, contraintes, interlocuteurs et critères de réussite sont confirmés.", owner: "Le responsable de compte ou de mission", output: "Un brief approuvé avec objectif, cible, livrables, contraintes, décisionnaire et critères de réussite.", control: "L’agence reformule les zones ambiguës et obtient une validation explicite avant chiffrage détaillé ou production." },
        { label: "Périmètre cadré", title: "Traduire le brief en engagement", input: "Le brief validé, l’estimation de charge, les dépendances externes et les conditions commerciales.", description: "Livrables inclus, exclusions, hypothèses, nombre de retours, budget et calendrier sont visibles.", owner: "Le responsable de mission avec la personne qui engage l’agence", output: "Un périmètre accepté avec inclusions, exclusions, hypothèses, retours, prix, jalons et responsabilités client.", control: "Chaque livrable peut être relié à un critère d’acceptation, une échéance et une condition de facturation." },
        { label: "Production planifiée", title: "Affecter charge et jalons", input: "Le périmètre accepté, les compétences disponibles, les dépendances et les dates de validation client.", description: "Responsables, dépendances, dates internes et dates client sont organisés avant le démarrage.", owner: "Le chef de projet", output: "Un planning réaliste avec responsables, charge, jalons internes, validations client et risques visibles.", control: "La capacité de l’équipe et les dépendances critiques sont vérifiées avant de confirmer les dates externes." },
        { label: "Livrable produit", title: "Contrôler avant d’envoyer", input: "Le brief, le périmètre, les éléments source, la version produite et les critères d’acceptation.", description: "Une revue interne vérifie cohérence, qualité et respect du brief avant présentation au client.", owner: "Le producteur du livrable puis un relecteur nommé", output: "Une version prête à présenter, nommée, relue et accompagnée des décisions attendues du client.", control: "La revue interne vérifie fond, forme, sources, périmètre et cohérence avant tout envoi externe." },
        { label: "Validation obtenue", title: "Fermer la boucle de retours", input: "Le livrable présenté, les retours reçus dans le canal convenu et le nombre de cycles prévu.", description: "Les commentaires sont regroupés, arbitrés et transformés en validation explicite.", owner: "Le chef de projet avec le décisionnaire client", output: "Une validation datée ou une liste consolidée de modifications, avec impact décidé sur délai, budget ou périmètre.", control: "Les retours contradictoires et demandes hors périmètre sont arbitrés avant d’ouvrir une nouvelle version." },
        { label: "Facture envoyée", title: "Relier livraison et facturation", input: "Le jalon validé, les conditions de facturation et les éventuels compléments acceptés pendant la mission.", description: "Le jalon validé déclenche la facture prévue et la clôture ou la suite de la mission.", owner: "L’administration ou le responsable de compte", output: "Une facture envoyée avec référence au jalon, échéance suivie et prochaine phase clairement ouverte ou clôturée.", control: "La revue de mission rapproche validations, temps, compléments, factures prévues et factures réellement émises." },
      ],
      rulesTitle: "Les règles qui protègent le périmètre",
      rules: [
        { title: "Un brief se valide", description: "La production ne commence pas sur une intention encore ambiguë." },
        { title: "Les retours ont un canal et une date", description: "L’agence ne consolide pas en permanence des commentaires contradictoires." },
        { title: "Une demande hors périmètre se décide", description: "Elle modifie le budget, le délai ou un autre livrable ; elle n’est pas absorbée silencieusement." },
        { title: "La validation déclenche la suite", description: "Facturation et prochain jalon ne dépendent pas d’un rappel manuel informel." },
      ],
      implementation: {
        startingPoint: "Choisissez une mission en cours et rassemblez le brief, le devis, le planning, les versions et les retours au même endroit. Demandez à une personne extérieure au projet d’identifier la version validée et la prochaine décision : toute hésitation révèle une règle manquante.",
        cadence: "Le chef de projet contrôle chaque semaine charge, jalons, dépendances, validations et demandes hors périmètre. Un point court précède chaque envoi client. À la fin du jalon, temps passé, retours consommés, marge et facturation sont rapprochés avant d’ouvrir la suite.",
        escalation: "La direction arbitre un changement de résultat attendu, une demande hors périmètre significative, un retard qui affecte plusieurs missions, une marge sous le seuil ou un désaccord sur la validation. Les retours prévus sont pilotés par le chef de projet.",
      },
      example: { title: "Une campagne de lancement", body: "Le brief précise l’offre, la cible, les canaux et les résultats attendus. L’agence cadre les livrables, deux cycles de retours et les jalons de validation. La production est affectée par compétence, puis relue en interne. Le client centralise ses commentaires dans un retour unique. La validation finale déclenche la facture du jalon et l’archivage des fichiers approuvés." },
      tools: [
        { slug: "furious", name: "Furious", description: "Pour relier projets, charge, temps, rentabilité et facturation dans une agence." },
        { slug: "everwin", name: "Everwin", description: "Pour suivre missions, temps, budgets et facturation dans une organisation de services." },
      ],
      system: { slug: "agence-marketing", label: "Agence marketing" },
      checklist: ["Valider le brief avant production.", "Écrire inclusions, exclusions et cycles de retours.", "Affecter responsables et jalons.", "Centraliser les retours client.", "Relier chaque validation au jalon de facturation."],
      faqs: [
        { question: "Que doit contenir un brief exploitable ?", answer: "Objectif, cible, message, livrables, contraintes, ressources disponibles, décisionnaires, calendrier et critères de réussite." },
        { question: "Comment traiter une demande hors périmètre ?", answer: "Décrivez son impact, puis faites choisir entre un ajustement du budget, du délai ou du périmètre existant." },
        { question: "Quand une mission est-elle terminée ?", answer: "Quand les livrables prévus sont validés, les fichiers transmis, les suites attribuées et la facturation déclenchée." },
      ],
      conclusion: "L’agence gagne en marge et en sérénité lorsque le brief, le périmètre, les validations et la facturation appartiennent au même processus.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 1, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "centraliser-demandes-telephone-sms-whatsapp",
    title: "Comment centraliser les demandes reçues par téléphone, SMS et WhatsApp ?",
    shortTitle: "Centraliser les demandes clients",
    category: "Demandes et interventions",
    promise:
      "Une méthode pour conserver les canaux préférés des clients tout en transformant chaque message en demande visible, attribuée et suivie jusqu’à sa clôture.",
    guide: {
      sector: "Centralisation des demandes clients",
      company: {
        profile:
          "Cette entreprise de maintenance compte six techniciens et reçoit vingt-cinq à quarante demandes par semaine par téléphone, SMS ou WhatsApp.",
        friction:
          "L’entreprise ne possède pas de file commune. Une photo reste dans un téléphone, une urgence est transmise oralement et la direction doit reconstituer la situation puis relancer l’équipe.",
      },
      processTitle: "Le processus de centralisation à mettre en place",
      processIntroduction:
        "Il n’est pas nécessaire d’imposer un formulaire aux clients. La discipline est interne : quel que soit le canal d’entrée, chaque demande devient une fiche unique avec une priorité, un responsable et une prochaine action.",
      steps: [
        {
          label: "Demande reçue",
          title: "Accueillir la demande sur le canal choisi",
          input:
            "Un appel téléphonique, un SMS, un message WhatsApp, une photo ou un message vocal envoyé à une personne de l’entreprise.",
          description:
            "La personne qui reçoit le contact confirme sa prise en compte sans promettre un délai qu’elle ne maîtrise pas, puis conserve le message jusqu’à la création de la trace commune.",
          owner: "La personne qui reçoit le message ou l’appel",
          output:
            "Une demande reconnue avec l’identité du client, son moyen de contact, le lieu concerné et le motif exprimé.",
          control:
            "Toute demande professionnelle reçue sur un téléphone personnel ou partagé doit être enregistrée avant la fin de la demi-journée.",
        },
        {
          label: "Fiche créée",
          title: "Transformer l’échange en travail visible",
          input:
            "Le message initial, les coordonnées disponibles, l’adresse d’intervention et les photos ou documents déjà transmis.",
          description:
            "Une fiche unique extrait les faits utiles : client, site, demande, contraintes connues et date de réponse attendue.",
          owner: "L’accueil ou la personne qui a reçu la demande",
          output:
            "Une fiche horodatée avec un identifiant, un demandeur, un site, un besoin résumé et les pièces jointes utiles.",
          control:
            "La fiche reste incomplète si le client, le moyen de le rappeler, le lieu ou le besoin observable ne peuvent pas être identifiés.",
        },
        {
          label: "Urgence qualifiée",
          title: "Appliquer des critères communs",
          input:
            "La fiche créée, les conséquences décrites par le client, les risques éventuels et les engagements contractuels applicables.",
          description:
            "Une règle écrite distingue sécurité, activité bloquée, planification, devis ou information manquante. Le ton du message ne décide pas seul de la priorité.",
          owner: "La personne de permanence ou le responsable du planning",
          output:
            "Une priorité justifiée, un délai de première réponse et une décision claire sur le traitement à engager.",
          control:
            "Chaque priorité urgente doit correspondre à un critère vérifiable ; les autres fiches conservent une échéance visible de réponse.",
        },
        {
          label: "Responsable affecté",
          title: "Donner la prochaine action à une personne",
          input:
            "Une demande qualifiée, la compétence requise, la disponibilité de l’équipe et les informations restant à obtenir.",
          description:
            "La fiche est attribuée à la personne qui doit agir maintenant. La prochaine action et son échéance sont écrites au même endroit.",
          owner: "Le responsable du planning ou du service concerné",
          output:
            "Un responsable actuel, une prochaine action datée et, lorsque cela est possible, la personne prévue pour la suite.",
          control:
            "Aucune fiche ouverte ne peut rester sans responsable ni date. Les absences entraînent une réaffectation explicite, jamais une attente implicite.",
        },
        {
          label: "Réponse suivie",
          title: "Conserver la continuité avec le client",
          input:
            "La fiche attribuée, l’action réalisée, les informations nouvelles et le canal sur lequel le client attend une réponse.",
          description:
            "L’équipe répond sur le canal approprié puis note le résultat. Tout rappel, demande de photo ou proposition de créneau devient une action datée.",
          owner: "Le responsable actuel de la demande",
          output:
            "Un échange client tracé, un statut à jour et soit une décision, soit une prochaine action avec une échéance.",
          control:
            "La file des demandes sans mouvement depuis le délai convenu est revue chaque jour et chaque retard reçoit une décision documentée.",
        },
        {
          label: "Demande clôturée",
          title: "Fermer avec un résultat compréhensible",
          input:
            "La dernière action réalisée, la réponse du client, le compte rendu éventuel et les suites administratives associées.",
          description:
            "La demande est clôturée lorsque le résultat est connu : intervention terminée, devis envoyé, refus motivé, doublon fusionné ou transfert suivi.",
          owner: "La personne responsable au moment du résultat final",
          output:
            "Une demande fermée avec un motif, une date, le résultat transmis au client et une suite éventuelle clairement rattachée.",
          control:
            "Une revue hebdomadaire repère les demandes fermées sans résultat, les doublons et les motifs récurrents qui justifient une nouvelle règle.",
        },
      ],
      rulesTitle: "Les cinq règles qui empêchent les messages de se perdre",
      rules: [
        {
          title: "Tous les canaux aboutissent à une seule file",
          description:
            "Les clients gardent leurs canaux, mais l’équipe consulte un seul endroit pour savoir ce qui attend une réponse.",
        },
        {
          title: "La fiche résume les faits utiles",
          description:
            "Elle contient demandeur, lieu, besoin, pièces utiles, priorité et prochaine action, sans recopier toute la conversation.",
        },
        {
          title: "Une priorité se justifie",
          description:
            "Sécurité, activité bloquée, engagement contractuel ou délai convenu sont des critères ; l’insistance seule n’en est pas un.",
        },
        {
          title: "Chaque demande ouverte a un responsable",
          description:
            "Le nom indique qui doit agir maintenant et change lorsque le travail passe réellement à une autre personne.",
        },
        {
          title: "Clôturer signifie obtenir un résultat",
          description:
            "Une réponse envoyée ne suffit pas si une action reste attendue. La fiche se ferme avec un motif compréhensible et une suite éventuelle.",
        },
      ],
      implementation: {
        startingPoint:
          "Pendant cinq jours, notez le canal, le destinataire et le lieu de suivi de chaque demande. Créez ensuite une fiche avec client, contact, site, besoin, priorité et prochaine action. Centralisez avant d’automatiser.",
        cadence:
          "Contrôlez la file au début et à la fin de la journée. Une revue hebdomadaire examine les fiches anciennes, les doublons et les motifs récurrents afin d’ajuster les règles.",
        escalation:
          "La direction intervient pour un risque de sécurité, un engagement financier important, une réclamation sensible ou une demande bloquée malgré la règle. L’équipe traite les cas courants.",
      },
      example: {
        title: "un message WhatsApp avec la photo d’une panne",
        body:
          "Un client envoie une photo à un technicien, qui crée la fiche. Le bureau qualifie la demande, l’attribue et propose un créneau par WhatsApp. Après l’intervention, le compte rendu est rattaché, le client est informé et la fiche est clôturée.",
      },
      tools: [
        {
          slug: "organilog",
          name: "Organilog",
          description:
            "Pour convertir les demandes en interventions, attribuer les actions, planifier les techniciens et conserver les comptes rendus dans un même flux.",
        },
        {
          slug: "praxedo",
          name: "Praxedo",
          description:
            "Pour des équipes terrain plus structurées qui ont besoin de distribuer les interventions et de faire remonter leur résultat depuis le mobile.",
        },
      ],
      system: {
        slug: "batiment",
        label: "Bâtiment",
      },
      checklist: [
        "Lister tous les numéros et comptes qui reçoivent des demandes clients.",
        "Créer une file commune et une fiche avec les six informations minimales.",
        "Écrire les critères qui distinguent urgence, planification, devis et information manquante.",
        "Attribuer un responsable et une échéance à chaque fiche ouverte.",
        "Revoir chaque semaine les demandes sans résultat ou restées trop longtemps ouvertes.",
      ],
      faqs: [
        {
          question: "Faut-il supprimer WhatsApp pour mieux organiser les demandes ?",
          answer:
            "Non. WhatsApp peut rester pratique. Le risque apparaît lorsque le message constitue l’unique trace : une fiche commune doit être créée dès qu’une demande exploitable arrive.",
        },
        {
          question: "Qui doit créer la fiche lorsqu’un technicien reçoit directement le message ?",
          answer:
            "La personne qui reçoit la demande crée au moins la trace minimale. Le bureau peut ensuite la compléter, la qualifier et l’affecter.",
        },
        {
          question: "Comment éviter de saisir deux fois les mêmes informations ?",
          answer:
            "Recopiez uniquement les données nécessaires et rattachez les pièces à la fiche. Une intégration peut créer le brouillon, mais la qualification humaine reste nécessaire.",
        },
      ],
      conclusion:
        "Les clients continuent à appeler ou à écrire comme ils le souhaitent, mais aucune demande ne dépend plus d’un téléphone ou de la mémoire d’une seule personne.",
      editorialReview: {
        clarity: 4,
        realism: 4,
        immediateUsefulness: 4,
        exampleQuality: 2,
        toolRelevance: 2,
        consistency: 2,
        readability: 1,
        reviewedAt: "2026-08-25",
      },
    },
  }),
  defineProcessGuide({
    slug: "organiser-planning-plusieurs-techniciens",
    title: "Comment organiser le planning de plusieurs techniciens ?",
    shortTitle: "Planning de plusieurs techniciens",
    category: "Planning et interventions",
    promise: "Une méthode pour affecter les interventions selon les priorités, les compétences et les trajets, puis absorber les urgences sans reconstruire tout le planning.",
    guide: {
      sector: "Planning d’une équipe technique",
      company: {
        profile: "Cette entreprise de services techniques emploie huit techniciens. Elle combine visites récurrentes, dépannages urgents et interventions nécessitant des compétences ou du matériel précis.",
        friction: "Le planning est construit dans un agenda partagé puis corrigé par téléphone. Les durées, trajets et absences sont connus séparément. Chaque urgence oblige la direction à déplacer plusieurs rendez-vous et à prévenir elle-même les clients.",
      },
      processTitle: "Le processus de planification à mettre en place",
      processIntroduction: "Le planning ne commence pas par des cases vides à remplir. Il commence par une file d’interventions suffisamment préparées pour être comparées, affectées et confirmées selon des règles communes.",
      steps: [
        { label: "Interventions prêtes", title: "Séparer les demandes planifiables", input: "Les demandes qualifiées, les contrats récurrents, les retours à effectuer et les travaux déjà acceptés par les clients.", description: "Seules les interventions dont le lieu, le besoin, la durée estimée et la prochaine décision sont connus entrent dans la file à planifier.", owner: "Le responsable du planning", output: "Une file de travail planifiable avec site, client, durée estimée, échéance et nature de l’intervention.", control: "Toute fiche incomplète retourne à la qualification au lieu d’occuper provisoirement un créneau impossible à confirmer." },
        { label: "Contraintes vérifiées", title: "Rendre visibles les conditions réelles", input: "La file planifiable, les compétences requises, les pièces nécessaires, les accès, les disponibilités clients et les absences.", description: "Chaque intervention reçoit les contraintes qui limitent son affectation : habilitation, véhicule, matériel, binôme, fenêtre client ou dépendance externe.", owner: "Le responsable du planning avec l’appui technique", output: "Une intervention enrichie des compétences, moyens, disponibilités et dépendances nécessaires à sa réalisation.", control: "Une contrainte bloquante doit être résolue ou recevoir une action avant que l’intervention soit proposée à un technicien." },
        { label: "Priorités classées", title: "Arbitrer avant de remplir le calendrier", input: "Les interventions prêtes, leurs échéances contractuelles, leur niveau de risque et leur impact pour le client.", description: "Une règle distingue sécurité, activité bloquée, engagement daté, intervention récurrente et confort. L’ancienneté départage les demandes de même niveau.", owner: "Le responsable du planning selon les règles validées", output: "Une file ordonnée avec une priorité justifiée, une date limite et les interventions réellement déplaçables.", control: "Les priorités exceptionnelles sont accompagnées d’un motif ; une urgence commerciale ne remplace pas silencieusement une urgence de sécurité." },
        { label: "Techniciens affectés", title: "Associer la bonne capacité au bon travail", input: "La file priorisée, les contraintes vérifiées, les horaires disponibles, les zones géographiques et la charge de chaque technicien.", description: "Les créneaux sont attribués en combinant priorité, compétence, durée et trajet. Les marges prévues évitent qu’un retard mineur désorganise toute la journée.", owner: "Le responsable du planning", output: "Un planning provisoire avec technicien, ordre de passage, durée, trajet et marge pour chaque intervention.", control: "Aucun technicien n’est affecté sans compétence requise, temps de déplacement réaliste ni accès aux informations de préparation." },
        { label: "Planning confirmé", title: "Partager un engagement réalisable", input: "Le planning provisoire, les disponibilités confirmées des techniciens et les fenêtres acceptables pour les clients.", description: "L’équipe valide le lendemain ou la semaine utile, puis les clients reçoivent le créneau et les consignes. Une modification devient visible pour tous.", owner: "Le responsable du planning puis chaque technicien", output: "Un planning publié, des clients informés et des fiches accessibles avec adresse, contact, besoin et préparation.", control: "Chaque technicien confirme sa lecture ; les rendez-vous non confirmés par le client restent signalés et possèdent une relance attribuée." },
        { label: "Écarts replanifiés", title: "Traiter les imprévus sans repartir de zéro", input: "Une urgence nouvelle, une absence, un retard, une pièce manquante ou une intervention dont la durée réelle dépasse l’estimation.", description: "L’écart est enregistré, puis la règle choisit quoi déplacer. Les clients affectés sont prévenus et les interventions reportées conservent leur priorité et leur historique.", owner: "Le responsable du planning ; la direction seulement pour les arbitrages majeurs", output: "Un planning mis à jour, des changements expliqués et chaque intervention déplacée rattachée à une nouvelle date.", control: "La revue hebdomadaire compare prévu et réalisé afin d’ajuster durées, marges, secteurs et critères d’escalade." },
      ],
      rulesTitle: "Les cinq règles d’un planning qui reste fiable",
      rules: [
        { title: "On ne planifie que du travail préparé", description: "Une demande incomplète reçoit une action de qualification ; elle ne bloque pas un créneau fictif dans le calendrier." },
        { title: "La priorité précède la disponibilité", description: "Le premier technicien libre n’est pas toujours le bon. Risque, engagement et ancienneté guident d’abord l’ordre." },
        { title: "Compétences et trajets sont des contraintes", description: "Ils apparaissent dans la fiche et ne reposent pas sur la connaissance personnelle de la direction." },
        { title: "Le planning conserve une marge", description: "Un taux de remplissage maximal et des créneaux tampons absorbent les écarts normaux sans promesses irréalistes." },
        { title: "Tout déplacement préserve une trace", description: "Le motif, la nouvelle date et l’information du client restent visibles pour éviter les oublis et reports successifs." },
      ],
      implementation: {
        startingPoint: "Prenez la semaine passée et comparez chaque intervention prévue à sa réalisation. Notez les retards, déplacements, compétences manquantes et temps de trajet. Définissez ensuite la fiche minimale et quatre niveaux de priorité avant de refaire un planning.",
        cadence: "Préparez le lendemain à heure fixe et la semaine à un niveau moins détaillé. Un point court traite les écarts chaque matin. La revue hebdomadaire compare charge, durée prévue, durée réelle, kilomètres et reports.",
        escalation: "La direction arbitre une urgence qui déplace plusieurs clients, une surcharge durable, un engagement contractuel menacé ou un manque de compétence. Les ajustements ordinaires restent au responsable du planning.",
      },
      example: { title: "une panne urgente au milieu d’une journée chargée", body: "La demande entre avec un critère d’activité bloquée. Le planning identifie le technicien habilité dans la même zone et le rendez-vous déplaçable selon la règle. Le client concerné accepte un nouveau créneau, les deux fiches sont mises à jour et les techniciens voient immédiatement le nouvel ordre de passage." },
      tools: [
        { slug: "organilog", name: "Organilog", description: "Pour relier demandes, planning, fiches d’intervention et comptes rendus dans une petite équipe terrain." },
        { slug: "synchroteam", name: "Synchroteam", description: "Pour optimiser l’affectation et le suivi d’équipes mobiles lorsque les volumes, zones et contraintes augmentent." },
      ],
      system: { slug: "batiment", label: "Bâtiment" },
      checklist: ["Créer une file séparée des interventions réellement planifiables.", "Écrire les quatre niveaux de priorité et leurs critères.", "Renseigner compétences, durée, zone et matériel nécessaires.", "Définir la marge quotidienne à conserver pour les imprévus.", "Comparer chaque semaine le planning prévu au travail réalisé."],
      faqs: [
        { question: "Faut-il remplir chaque journée à 100 % ?", answer: "Non. Un planning sans marge transforme chaque retard en cascade. Le niveau de marge dépend de la fréquence des urgences, des trajets et de la variabilité des interventions." },
        { question: "Qui décide quelle intervention déplacer ?", answer: "Le responsable du planning applique les priorités et les règles de déplacement. La direction intervient uniquement lorsque plusieurs engagements importants entrent réellement en conflit." },
        { question: "Comment planifier quand les durées sont incertaines ?", answer: "Utilisez des durées de référence par type d’intervention, conservez une marge puis comparez prévu et réel. Les estimations deviennent progressivement plus fiables." },
      ],
      conclusion: "Le planning devient un engagement collectif fondé sur des règles visibles, et non un puzzle que la direction doit reconstruire à chaque imprévu.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "bon-intervention-facture-sans-ressaisie",
    title: "Comment passer d’un bon d’intervention à la facture sans ressaisie ?",
    shortTitle: "Bon d’intervention sans ressaisie",
    category: "Documents et facturation",
    promise: "Un circuit pour recueillir les bonnes données sur le terrain, contrôler les écarts et produire la facture depuis un bon d’intervention réellement exploitable.",
    guide: {
      sector: "Facturation des interventions",
      company: {
        profile: "Cette entreprise de maintenance réalise cinquante à quatre-vingts interventions par mois. Les techniciens remplissent encore des bons papier ou des PDF envoyés au bureau.",
        friction: "L’administration ressaisit le client, les heures, les pièces et les prestations dans le logiciel de facturation. Les écritures illisibles, références absentes et travaux supplémentaires imposent des appels aux techniciens et retardent l’envoi.",
      },
      processTitle: "Le processus du bon signé à la facture",
      processIntroduction: "Supprimer la ressaisie ne consiste pas seulement à numériser le bon. Les données terrain doivent être structurées, contrôlées et reliées aux conditions commerciales avant de déclencher la facture.",
      steps: [
        { label: "Bon signé", title: "Capturer la preuve sur le terrain", input: "L’intervention réalisée, la fiche de mission, le client présent et les informations relevées par le technicien.", description: "Le bon identifie l’intervention, décrit le travail, enregistre temps, pièces, observations et signature ou motif d’absence du client.", owner: "Le technicien qui réalise l’intervention", output: "Un bon horodaté rattaché à l’intervention avec résultat, temps, fournitures, réserves et preuve de passage.", control: "La clôture terrain reste bloquée si le résultat, le temps, les pièces ou le statut de signature nécessaires manquent." },
        { label: "Données contrôlées", title: "Vérifier la complétude avant transmission", input: "Le bon clôturé, les données du client, le contrat ou devis et les règles de facturation applicables.", description: "Des contrôles repèrent champs manquants, temps incohérents, références inconnues, signature absente et intervention sans base commerciale.", owner: "Le technicien pour la correction immédiate, puis l’administration", output: "Un bon complet ou une anomalie attribuée avec l’information précise à corriger et une échéance de retour.", control: "Les anomalies sont signalées avant que le technicien perde le contexte ; elles ne sont pas compensées par une ressaisie approximative." },
        { label: "Prestations validées", title: "Relier le réalisé au facturable", input: "Le bon complet, le devis, le contrat, le catalogue des prestations et les conditions propres au client.", description: "Chaque temps, forfait, déplacement et pièce est rapproché d’une ligne facturable ou identifié comme inclus, offert ou non facturable.", owner: "L’administration selon les règles commerciales validées", output: "Un ensemble de lignes facturables avec quantité, prix, taxe, rattachement contractuel et justification des éléments exclus.", control: "Aucune quantité ni tarif ne vient d’une interprétation libre du texte du technicien ; les écarts sont isolés pour décision." },
        { label: "Écarts traités", title: "Décider les cas non prévus", input: "Les prestations validées et la liste des travaux supplémentaires, temps inhabituels, pièces non prévues ou désaccords.", description: "Chaque écart reçoit une décision : facturer selon une règle, demander un accord, absorber, corriger le bon ou créer un devis complémentaire.", owner: "Le responsable commercial ou la direction selon le seuil", output: "Une décision tracée pour chaque écart avec montant, justification, accord éventuel et personne autorisant la suite.", control: "Les écarts au-dessus du seuil ne rejoignent pas la facture sans preuve d’accord ; les petits écarts suivent une règle commune." },
        { label: "Facture générée", title: "Créer le document depuis les données validées", input: "Les lignes facturables approuvées, l’identité client, les références obligatoires et les conditions de règlement.", description: "Le système compose le brouillon de facture depuis le bon et les règles commerciales sans recopier les informations déjà validées.", owner: "Le logiciel prépare ; l’administration vérifie", output: "Un brouillon rattaché au bon d’intervention avec lignes, taxes, références, échéance et pièces justificatives.", control: "Un contrôle final rapproche total, client, adresse de facturation, commande éventuelle et conditions avant validation comptable." },
        { label: "Facture envoyée", title: "Transmettre et ouvrir le suivi du paiement", input: "La facture validée, l’adresse ou le portail de dépôt du client et les justificatifs exigés par son processus achat.", description: "La facture et les pièces sont envoyées par le canal convenu. La date, l’échéance et le statut de transmission alimentent le suivi des règlements.", owner: "L’administration ou la comptabilité", output: "Une facture transmise avec preuve d’envoi, échéance, statut de paiement et relance planifiée si nécessaire.", control: "Chaque semaine, les interventions terminées sans facture et les factures rejetées sont rapprochées de leur bon d’origine." },
      ],
      rulesTitle: "Les cinq règles qui éliminent la ressaisie",
      rules: [
        { title: "Le bon contient des données, pas seulement du texte", description: "Temps, pièces, résultat et statuts utilisent des champs exploitables ; les commentaires servent uniquement à préciser le contexte." },
        { title: "Une donnée est saisie à sa source", description: "Le technicien confirme le réalisé, l’administration ne le reconstitue pas plusieurs jours plus tard." },
        { title: "Le catalogue relie terrain et facturation", description: "Les codes et règles permettent de transformer une prestation réalisée en ligne facturable sans interprétation libre." },
        { title: "Les écarts suivent un circuit séparé", description: "Travaux supplémentaires et temps exceptionnels sont décidés, pas noyés dans le flux normal ni supprimés sans trace." },
        { title: "La facture reste contrôlée", description: "L’automatisation prépare le document ; un contrôle proportionné vérifie l’identité, les montants et les exigences du client." },
      ],
      implementation: {
        startingPoint: "Prenez vingt bons récents et listez toutes les informations que l’administration a dû rechercher ou ressaisir. Transformez les plus fréquentes en champs obligatoires et reliez les prestations courantes au catalogue de facturation.",
        cadence: "Contrôlez les bons le jour même. Traitez quotidiennement les anomalies et générez les factures à fréquence fixe. Chaque mois, analysez les causes de rejet, les écarts et le délai entre intervention et envoi.",
        escalation: "La direction arbitre un travail non autorisé, un écart commercial important, un litige ou une remise hors règle. Les corrections de complétude restent entre technicien et administration.",
      },
      example: { title: "un remplacement de pièce non prévu", body: "Le technicien sélectionne l’équipement, renseigne son temps et ajoute la pièce avec la photo de l’accord client. Le bon signé arrive dans la file de contrôle. Le système reconnaît le forfait, isole la pièce supplémentaire puis applique la règle validée. Après vérification, la facture est générée et envoyée avec le bon en pièce jointe." },
      tools: [
        { slug: "organilog", name: "Organilog", description: "Pour relier fiches terrain, comptes rendus, temps, fournitures et préparation de la facturation." },
        { slug: "obat", name: "Obat", description: "Pour gérer devis et factures lorsque la continuité commerciale et administrative du BTP est prioritaire." },
      ],
      system: { slug: "plomberie-chauffage", label: "Plomberie et chauffage" },
      checklist: ["Analyser vingt bons et repérer chaque information ressaisie.", "Créer les champs obligatoires utiles à la facturation.", "Relier les prestations courantes à un catalogue de prix.", "Définir le circuit et les seuils des travaux supplémentaires.", "Mesurer le délai entre clôture terrain et facture envoyée."],
      faqs: [
        { question: "Une signature électronique est-elle toujours obligatoire ?", answer: "Cela dépend du contrat et de la preuve attendue. Si le client est absent, prévoyez un statut, des photos et un mode de validation adapté plutôt qu’une fausse signature." },
        { question: "Faut-il générer automatiquement la facture définitive ?", answer: "Commencez par un brouillon automatique contrôlé. La validation peut devenir plus légère lorsque les données, tarifs et exceptions sont suffisamment fiables." },
        { question: "Que faire des travaux supplémentaires ?", answer: "Isolez-les, rattachez une preuve d’accord et appliquez un seuil de décision. Ils ne doivent être ni facturés sans base ni absorbés silencieusement." },
      ],
      conclusion: "Le bon d’intervention devient la source fiable de la facture : le terrain renseigne le réalisé une fois, puis l’administration contrôle au lieu de reconstruire.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "quel-logiciel-quand-excel-ne-suffit-plus",
    title: "Quel logiciel choisir quand Excel ne suffit plus ?",
    shortTitle: "Choisir un logiciel après Excel",
    category: "Outils et organisation",
    promise: "Une méthode pour reconnaître les limites réelles d’Excel, cadrer le besoin et comparer les solutions sans remplacer trop vite un fichier qui fonctionne encore.",
    guide: {
      sector: "Choix d’un logiciel pour une TPE",
      company: {
        profile: "Cette TPE du bâtiment compte dix personnes et pilote demandes, planning et suivi client dans plusieurs fichiers Excel, complétés par des e-mails et un agenda partagé.",
        friction: "Le fichier principal reste utile, mais les versions se multiplient, les relances sont manuelles et personne ne sait toujours quelle ligne est à jour. Le dirigeant hésite entre réparer Excel, acheter plusieurs outils ou lancer un projet sur mesure.",
      },
      processTitle: "Le processus de choix à mettre en place",
      processIntroduction: "Le bon logiciel ne se choisit pas à partir d’une liste de fonctionnalités. Il se choisit en observant le travail réel, en mesurant ce qui bloque puis en comparant des options sur un même scénario.",
      steps: [
        { label: "Usage observé", title: "Regarder comment le fichier est réellement utilisé", input: "Les fichiers actifs, leurs propriétaires, les échanges associés et plusieurs dossiers récents suivis du début à la fin.", description: "L’équipe décrit qui saisit quoi, à quel moment, avec quelles sources et quelles décisions. Les contournements comptent autant que le fichier officiel.", owner: "La personne qui pilote le diagnostic avec les utilisateurs", output: "Une carte du flux actuel avec fichiers, rôles, passages manuels, décisions et canaux parallèles réellement utilisés.", control: "L’observation porte sur des cas récents et inclut les personnes qui saisissent, contrôlent et utilisent les informations." },
        { label: "Irritants recensés", title: "Distinguer gêne et blocage opérationnel", input: "La carte d’usage, les erreurs récentes, les recherches d’information, les doubles saisies et les relances effectuées.", description: "Chaque irritation est décrite par sa fréquence, les personnes touchées et sa conséquence : retard, erreur, travail inutile ou dépendance au dirigeant.", owner: "Le pilote du diagnostic avec l’équipe", output: "Une liste priorisée d’irritants observables avec fréquence, temps perdu, conséquence et cause probable.", control: "Une préférence d’interface n’est pas confondue avec un problème ; chaque irritant doit être relié à un cas réel." },
        { label: "Risques mesurés", title: "Identifier le moment où Excel devient fragile", input: "Les irritants recensés, les volumes, le nombre d’utilisateurs, les données sensibles et les conséquences d’une erreur.", description: "L’entreprise mesure versions concurrentes, droits insuffisants, historique absent, automatisations instables, dépendance à une personne et impossibilité de travailler simultanément.", owner: "Le dirigeant avec la personne responsable des données", output: "Un diagnostic distinguant les limites acceptables, les risques à corriger et les points qui imposent un changement d’outil.", control: "Le changement n’est justifié que si le coût ou le risque du système actuel dépasse clairement l’effort d’amélioration ou de migration." },
        { label: "Besoins cadrés", title: "Décrire le résultat avant les fonctionnalités", input: "Les problèmes prioritaires, les utilisateurs concernés, les règles du processus et les contraintes techniques ou réglementaires.", description: "Le besoin est formulé comme un flux : événement de départ, étapes, responsables, exceptions, résultat attendu et informations nécessaires.", owner: "Le pilote du projet avec les futurs utilisateurs", output: "Un scénario prioritaire, des critères obligatoires, des critères souhaitables, des contraintes et un volume de référence.", control: "Le périmètre tient dans une première version testable ; les demandes sans lien avec le scénario prioritaire restent hors sélection." },
        { label: "Options comparées", title: "Tester chaque solution sur le même scénario", input: "Le besoin cadré, une courte liste d’outils, un jeu de données réaliste et les personnes qui utiliseront la solution.", description: "Excel amélioré, outil existant, assemblage no-code ou application métier sont testés sur un dossier identique, pas comparés sur leurs pages marketing.", owner: "Deux utilisateurs représentatifs avec le décideur", output: "Une comparaison fondée sur usage, couverture, simplicité, coût total, migration, support et limites résiduelles.", control: "Chaque option réalise le scénario de bout en bout et expose ses compromis ; une démonstration guidée ne remplace pas le test utilisateur." },
        { label: "Décision prise", title: "Choisir avec un coût et une responsabilité visibles", input: "La comparaison, le budget, le temps de migration, les risques, les dépendances et l’impact attendu sur l’équipe.", description: "La décision précise ce qui change, ce qui reste, qui porte la mise en place, comment les données migrent et à quelle date le résultat sera évalué.", owner: "Le dirigeant avec le responsable de la mise en œuvre", output: "Une option choisie, un périmètre, un responsable, un budget complet, un calendrier et des critères de réussite.", control: "Une date de revue vérifie adoption, temps gagné, erreurs et qualité du suivi avant toute extension du périmètre." },
      ],
      rulesTitle: "Les cinq règles pour choisir sans suréquiper l’entreprise",
      rules: [
        { title: "Excel n’est pas le problème par principe", description: "Un fichier stable, compris et détenu par une petite équipe peut rester la solution la plus simple." },
        { title: "Le signal vient du processus", description: "Versions, droits, historique, relances et travail simultané indiquent une limite plus utile que le nombre de lignes." },
        { title: "Un scénario vaut mieux qu’une liste de fonctions", description: "Faites passer un vrai dossier de l’entrée au résultat pour révéler les ruptures et les manipulations cachées." },
        { title: "Le coût comprend la mise en place", description: "Licence, paramétrage, migration, formation, maintenance et temps interne doivent être comparés ensemble." },
        { title: "La première version reste étroite", description: "Résolvez le flux qui coûte le plus avant de centraliser tous les processus de l’entreprise." },
      ],
      implementation: {
        startingPoint: "Choisissez un seul fichier critique et suivez trois dossiers récents. Notez les saisies, recherches, relances, erreurs et décisions. Ne lancez aucune démonstration avant d’avoir formulé le scénario prioritaire.",
        cadence: "Cadrez le besoin en une semaine, testez au plus trois options, puis organisez une revue avec les utilisateurs. Après choix, mesurez chaque mois adoption, temps de traitement et erreurs.",
        escalation: "La direction arbitre le budget, les données sensibles, une dépendance fournisseur ou une modification de processus. Les préférences d’écran ne deviennent pas des exigences sans impact opérationnel." ,
      },
      example: { title: "un fichier de suivi des demandes devenu trop fragile", body: "L’équipe observe trois demandes et constate deux saisies, quatre relances manuelles et aucune trace des changements. Elle cadre un flux de la demande à la clôture, puis teste Excel amélioré, Airtable et un logiciel métier avec les mêmes données. L’outil métier couvre le planning mais pas une validation propre à l’activité ; ce compromis est chiffré avant décision." },
      tools: [
        { slug: "organilog", name: "Organilog", description: "Pour tester une solution métier qui relie demandes, planning, interventions et suivi terrain dans une petite équipe technique." },
        { slug: "airtable", name: "Airtable", description: "Pour structurer une base partagée et des vues par rôle lorsque le processus dépasse Excel sans nécessiter immédiatement une application dédiée." },
      ],
      toolsTitle: "Quelles solutions tester avant de quitter Excel ?",
      toolsIntroduction: "Testez chaque option avec le même dossier réel. Un outil n’est pertinent que s’il réduit les doubles saisies, clarifie les responsabilités et reste utilisable par l’équipe sans nouveau contournement.",
      system: { slug: "batiment", label: "Bâtiment" },
      checklist: ["Observer trois dossiers dans le fichier le plus critique.", "Mesurer fréquence et conséquence des irritants.", "Écrire un scénario prioritaire de bout en bout.", "Tester au maximum trois options avec les mêmes données.", "Comparer licence, mise en place, migration et maintenance."],
      faqs: [
        { question: "À partir de combien de lignes faut-il quitter Excel ?", answer: "Il n’existe pas de seuil universel. Les vrais signaux sont les versions concurrentes, les droits, le manque d’historique, les relances manuelles et le travail simultané." },
        { question: "Faut-il choisir un outil tout-en-un ?", answer: "Seulement s’il couvre correctement le flux prioritaire sans complexifier le quotidien. Un outil plus étroit et bien adopté vaut mieux qu’une suite complète contournée par l’équipe." },
        { question: "Peut-on améliorer Excel avant de migrer ?", answer: "Oui. Clarifier les règles, réduire les colonnes, protéger les données et attribuer la propriété du fichier peut suffire, ou préparer une migration beaucoup plus propre." },
      ],
      conclusion: "Le moment de quitter Excel arrive lorsque ses contournements coûtent plus que sa simplicité ; le choix se fait alors sur un processus réel, pas sur une promesse logicielle.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "rentabilite-application-metier",
    title: "À partir de quand une application métier devient-elle rentable ?",
    shortTitle: "Rentabilité d’une application métier",
    category: "Outils et rentabilité",
    promise: "Une méthode pour chiffrer le coût du fonctionnement actuel, estimer des gains crédibles et décider d’investir sans confondre automatisation et économie réelle.",
    guide: {
      sector: "Rentabilité d’une application métier",
      company: {
        profile: "Cette entreprise de services techniques compte huit personnes. Son équipe consacre environ douze heures par semaine à recopier des demandes, relancer des dossiers et produire des comptes rendus.",
        friction: "Le dirigeant voit le temps perdu mais ne sait pas quelle part une application supprimera réellement. Un devis paraît élevé face à un abonnement, tandis que les erreurs, les retards de facturation et la dépendance à la direction restent invisibles.",
      },
      processTitle: "Le calcul de rentabilité à mettre en place",
      processIntroduction: "Une application devient rentable lorsqu’elle réduit durablement un coût réel ou permet une capacité utile supérieure à son coût complet. Le calcul part du travail observé, puis applique des hypothèses prudentes.",
      steps: [
        { label: "Temps mesuré", title: "Observer le travail réellement consommé", input: "Un processus précis, plusieurs dossiers récents, les personnes qui interviennent et le temps consacré aux opérations manuelles.", description: "Pendant deux semaines, l’équipe mesure saisie, recherche, relance, correction, transmission et contrôle sans inclure le travail métier qui restera nécessaire.", owner: "Le pilote du diagnostic avec chaque rôle concerné", output: "Un volume mensuel, un temps moyen par opération, les personnes mobilisées et la part réellement automatisable.", control: "Les mesures viennent de dossiers réels et distinguent temps supprimable, temps réduit et temps indispensable à la décision humaine." },
        { label: "Erreurs chiffrées", title: "Rendre visibles les coûts autres que le temps", input: "Les corrections, oublis, déplacements inutiles, retards de facturation, remises commerciales et réclamations liés au processus.", description: "Chaque erreur reçoit une fréquence et une conséquence financière ou opérationnelle prudente. Les risques rares restent séparés des pertes récurrentes.", owner: "Le pilote avec l’administration et les responsables opérationnels", output: "Une estimation mensuelle des corrections, retards, pertes évitables et risques importants liés au fonctionnement actuel.", control: "Une erreur n’est comptée que si son lien avec le processus est démontrable ; les bénéfices hypothétiques restent identifiés comme tels." },
        { label: "Coût actuel calculé", title: "Établir la base de comparaison", input: "Les temps mesurés, les coûts horaires complets, les erreurs chiffrées et les abonnements ou outils déjà payés.", description: "Le coût mensuel additionne travail évitable, pertes récurrentes et outils concernés. La dépendance au dirigeant est valorisée avec son vrai coût d’opportunité.", owner: "Le dirigeant avec la personne qui suit les coûts", output: "Un coût actuel mensuel et annuel, détaillé par temps, erreur, retard et outil, avec hypothèses documentées.", control: "Le calcul évite de compter deux fois le même effet et conserve une version basse lorsque le montant reste incertain." },
        { label: "Gains estimés", title: "Appliquer un scénario d’amélioration prudent", input: "Le coût actuel, le périmètre de l’application, les étapes réellement couvertes et les changements attendus dans l’équipe.", description: "L’entreprise estime ce qui sera supprimé, réduit ou fiabilisé. Elle retire le temps de contrôle, d’apprentissage et de maintenance qui restera après lancement.", owner: "Le pilote du projet avec les futurs utilisateurs", output: "Trois scénarios de gains, prudent, central et haut, avec adoption, volume et réduction attendue par opération.", control: "La décision utilise le scénario prudent ; aucun gain ne dépasse la part du processus effectivement couverte par l’application." },
        { label: "Investissement comparé", title: "Inclure le coût complet de la solution", input: "Le devis ou les licences, le paramétrage, la migration, la formation, le temps interne, l’hébergement et la maintenance.", description: "Le coût initial et le coût récurrent sont comparés aux gains nets. Le calcul distingue trésorerie, délai de retour et valeur créée après amortissement.", owner: "Le dirigeant avec le prestataire ou l’éditeur", output: "Un investissement complet, un gain mensuel net, un délai de retour et un coût de fonctionnement après lancement.", control: "Les évolutions probables, le support et le temps interne sont inclus ; un prix d’achat isolé n’est jamais présenté comme le coût total." },
        { label: "Seuil validé", title: "Décider avec des conditions de réussite", input: "Les scénarios de gains, le coût complet, le délai de retour, les risques d’adoption et les priorités financières de l’entreprise.", description: "L’entreprise fixe le délai acceptable, le volume minimal et les indicateurs à atteindre. Elle peut investir, réduire le périmètre, différer ou renoncer.", owner: "Le dirigeant", output: "Une décision documentée avec périmètre, budget, seuil de rentabilité, indicateurs, responsable et date de revue.", control: "Après lancement, les gains réels sont mesurés aux mêmes endroits que la base initiale et les extensions dépendent des résultats obtenus." },
      ],
      rulesTitle: "Les cinq règles d’un calcul crédible",
      rules: [
        { title: "Mesurer un processus précis", description: "Le calcul porte sur un flux identifiable et un volume réel, pas sur une promesse générale de transformation numérique." },
        { title: "Valoriser le coût complet", description: "Temps interne, migration, formation, support et maintenance comptent autant que le prix affiché." },
        { title: "Utiliser une hypothèse prudente", description: "L’application ne supprime ni toutes les tâches ni toutes les erreurs ; l’adoption et le contrôle conservent un coût." },
        { title: "Séparer économie et capacité", description: "Du temps libéré ne devient une économie que s’il est supprimé ou réaffecté à un travail utile et réellement réalisé." },
        { title: "Mesurer après le lancement", description: "Le dossier d’investissement définit dès le départ les indicateurs et la date auxquels le résultat sera vérifié." },
      ],
      implementation: {
        startingPoint: "Choisissez un seul processus répétitif et mesurez-le pendant deux semaines. Comptez dossiers, minutes, corrections et délais. Construisez ensuite un scénario prudent avant de demander ou comparer des devis.",
        cadence: "Validez la base avec les utilisateurs, puis révisez les hypothèses au moment du cadrage. Après lancement, mesurez à un mois, trois mois et six mois avec la même méthode.",
        escalation: "La direction arbitre le délai de retour acceptable, les gains de capacité difficiles à valoriser et les risques stratégiques. Les estimations opérationnelles restent justifiées par les utilisateurs du processus.",
      },
      example: { title: "douze heures administratives par semaine", body: "L’entreprise mesure huit heures de ressaisie et quatre heures de relance. Le scénario prudent réduit seulement sept heures et conserve deux heures de contrôle. Après valorisation des erreurs évitées, le gain net estimé atteint 1 100 euros par mois. Un projet à 5 500 euros plus ses coûts récurrents atteint son seuil en environ six mois ; cette hypothèse devient l’objectif à vérifier." },
      tools: [
        { slug: "airtable", name: "Airtable", description: "Pour tester un flux structuré à coût limité et vérifier les usages avant d’engager une construction plus spécifique." },
        { slug: "make", name: "Make", description: "Pour automatiser des passages entre outils existants lorsque la rupture vient surtout de transferts manuels répétitifs." },
      ],
      toolsTitle: "Quels outils utiliser pour tester l’hypothèse ?",
      toolsIntroduction: "Un prototype ou une automatisation limitée permet de mesurer l’usage et le temps réellement gagné avant un investissement plus important. Ce test ne remplace pas le calcul du coût complet.",
      system: { slug: "batiment", label: "Bâtiment" },
      checklist: ["Choisir un seul processus et mesurer son volume.", "Séparer temps supprimable, réduit et indispensable.", "Chiffrer erreurs et retards sans double comptage.", "Inclure mise en place, adoption et maintenance.", "Fixer le seuil et les dates de mesure après lancement."],
      faqs: [
        { question: "Quel délai de retour viser ?", answer: "Il dépend de la trésorerie, du risque et de la durée de vie attendue. L’important est de fixer le délai avant la décision et de tester un scénario prudent." },
        { question: "Le temps gagné est-il toujours une économie ?", answer: "Non. Il devient une économie si une dépense disparaît, ou une capacité si l’équipe réalise davantage de travail utile sans augmenter ses moyens." },
        { question: "Comment valoriser le temps du dirigeant ?", answer: "Utilisez son coût complet ou la valeur du travail qu’il ne peut pas réaliser pendant ce temps. Gardez une hypothèse basse pour éviter de gonfler artificiellement le résultat." },
      ],
      conclusion: "Une application métier est rentable quand son gain prudent, mesuré sur un processus réel, couvre son coût complet dans un délai acceptable pour l’entreprise.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
  defineProcessGuide({
    slug: "logiciel-existant-ou-application-metier",
    title: "Faut-il choisir un logiciel existant ou construire son propre outil ?",
    shortTitle: "Logiciel existant ou outil propre",
    category: "Outils et organisation",
    promise: "Une méthode pour comparer couverture, adaptations, coût total et dépendances avant de choisir un logiciel du marché ou une application métier adaptée.",
    guide: {
      sector: "Choix entre logiciel et application métier",
      company: {
        profile: "Cette entreprise de services techniques de douze personnes a testé plusieurs logiciels standards pour gérer demandes, affectations, comptes rendus et facturation.",
        friction: "Chaque outil couvre une partie du travail, mais l’équipe revient aux messages et aux fichiers pour une validation propre à l’activité. Le dirigeant hésite entre accepter ce compromis, multiplier les connexions ou construire une application dédiée.",
      },
      processTitle: "Le processus de décision à mettre en place",
      processIntroduction: "La décision n’oppose pas une solution simple à une solution parfaite. Elle compare le coût des écarts au coût de l’adaptation, puis rend visibles les risques de mise en place et de dépendance.",
      steps: [
        { label: "Besoin cadré", title: "Définir le flux qui doit fonctionner", input: "Un processus prioritaire, des dossiers récents, les rôles concernés, les règles métier et le résultat attendu par l’entreprise.", description: "Le besoin décrit déclencheur, étapes, données, responsables, exceptions, volumes et contrôles. Les souhaits éloignés du problème principal restent hors périmètre.", owner: "Le pilote du projet avec les utilisateurs et le décideur", output: "Un scénario de référence, des critères obligatoires, des critères souhaitables, des volumes et des contraintes documentées.", control: "Chaque exigence est reliée à une action, un risque ou un résultat ; une préférence sans conséquence reste un critère secondaire." },
        { label: "Marché recherché", title: "Chercher d’abord les solutions disponibles", input: "Le besoin cadré, le secteur, la taille de l’équipe, le budget indicatif et les systèmes avec lesquels la solution doit communiquer.", description: "L’entreprise identifie trois à cinq solutions crédibles, consulte leur documentation et demande une démonstration fondée sur son scénario réel.", owner: "Le pilote du projet", output: "Une courte liste d’outils du marché capables de couvrir le cœur du besoin, avec prix, limites connues et conditions d’essai.", control: "La recherche inclut les logiciels métier spécialisés avant les outils génériques et écarte les options sans preuve sur le scénario prioritaire." },
        { label: "Écarts listés", title: "Mesurer ce que chaque option laisse dehors", input: "Les essais, le scénario de référence, les retours des utilisateurs et les possibilités de paramétrage ou d’intégration.", description: "Pour chaque solution, l’équipe note les étapes couvertes, les contournements, les doubles saisies, les adaptations et les limites qui resteront acceptables.", owner: "Deux utilisateurs représentatifs avec le pilote", output: "Une matrice d’écarts distinguant blocage, adaptation raisonnable, changement de pratique acceptable et fonction seulement souhaitée.", control: "Un écart est évalué par sa fréquence et son coût ; la construction n’est pas justifiée par une différence rare ou purement esthétique." },
        { label: "Coûts comparés", title: "Calculer le coût total sur la même période", input: "Les licences, devis, paramétrages, intégrations, migration, formation, hébergement, support, maintenance et temps interne.", description: "Les options sont comparées sur trois ans avec un scénario de volume cohérent. Le coût des contournements résiduels est ajouté au logiciel existant.", owner: "Le dirigeant avec le pilote et les fournisseurs", output: "Un coût total comparable par option, séparant investissement initial, fonctionnement récurrent et coût des écarts conservés.", control: "Les évolutions, la reprise de données et le temps de décision interne apparaissent ; un tarif mensuel n’est pas comparé seul à un devis complet." },
        { label: "Risques évalués", title: "Regarder au-delà des fonctionnalités", input: "Les options chiffrées, les conditions contractuelles, les modes d’export, la sécurité, le support et les compétences disponibles.", description: "L’entreprise évalue adoption, fiabilité du fournisseur, dépendance technique, évolutivité, réversibilité et capacité à maintenir une solution sur mesure.", owner: "Le dirigeant avec les responsables métier et technique", output: "Un registre de risques avec probabilité, impact, mesure de réduction, responsable et condition pouvant remettre en cause l’option.", control: "Une application dédiée n’est retenue sans propriétaire, maintenance et réversibilité ; un logiciel n’est retenu sans export et niveau de service compris." },
        { label: "Choix documenté", title: "Décider et préparer la première version", input: "La couverture, les écarts, les coûts, les risques, les préférences utilisateurs et les priorités stratégiques de l’entreprise.", description: "La décision peut être acheter, paramétrer, connecter, construire ou commencer par un hybride. Elle précise le périmètre, les compromis et les critères de réussite.", owner: "Le dirigeant", output: "Une décision argumentée, un budget, un responsable, un calendrier, une stratégie de données et un plan de première mise en service.", control: "La décision est revue après usage réel ; toute extension dépend de l’adoption, du résultat et des écarts encore observés." },
      ],
      rulesTitle: "Les cinq règles pour choisir sans biais",
      rules: [
        { title: "Chercher avant de construire", description: "Un logiciel métier existant mérite toujours un test réel avant d’engager un projet spécifique." },
        { title: "Comparer sur le même scénario", description: "Chaque option traite le même dossier, avec les mêmes utilisateurs et le même résultat attendu." },
        { title: "Chiffrer le coût des écarts", description: "Un contournement quotidien peut rendre une licence peu chère plus coûteuse qu’une adaptation bien ciblée." },
        { title: "Prévoir la vie après le lancement", description: "Support, maintenance, évolutions, sécurité, données et réversibilité appartiennent à la décision initiale." },
        { title: "Construire la différence, acheter le standard", description: "Le sur-mesure se concentre sur les règles propres à l’activité et s’appuie sur des services éprouvés pour le reste." },
      ],
      implementation: {
        startingPoint: "Cadrez un seul processus et testez deux logiciels métier avec trois dossiers réels. Listez les écarts avant de parler de construction. Si les écarts critiques persistent, faites chiffrer une première version limitée.",
        cadence: "Menez recherche, essais et comparaison dans une période courte. Après la décision, organisez des points hebdomadaires de mise en place puis des revues à un, trois et six mois.",
        escalation: "La direction arbitre les compromis de processus, les risques de données, le budget et la dépendance fournisseur. Les préférences d’interface restent au niveau de l’équipe projet." ,
      },
      example: { title: "une validation terrain absente des logiciels testés", body: "Deux logiciels couvrent demandes, planning et facturation, mais aucun ne gère la validation technique qui conditionne la suite. L’équipe chiffre le contournement à six heures par semaine et teste une intégration. Comme l’écart reste central, elle retient une application limitée à ce flux, connectée au logiciel comptable plutôt qu’une reconstruction de toutes les fonctions standards." },
      tools: [
        { slug: "organilog", name: "Organilog", description: "Pour tester une couverture métier existante des demandes, interventions, comptes rendus et opérations terrain." },
        { slug: "airtable", name: "Airtable", description: "Pour prototyper un flux propre à l’entreprise et vérifier les règles avant une éventuelle application plus dédiée." },
      ],
      toolsTitle: "Quels outils tester avant de construire ?",
      toolsIntroduction: "Commencez par éprouver un logiciel métier sur le scénario prioritaire. Un prototype sert ensuite à vérifier uniquement l’écart qui reste critique, pas à reconstruire toutes les fonctions standards.",
      system: { slug: "batiment", label: "Bâtiment" },
      checklist: ["Cadrer un scénario prioritaire et ses règles métier.", "Tester d’abord deux logiciels spécialisés avec de vraies données.", "Classer chaque écart par fréquence et conséquence.", "Comparer les coûts complets sur trois ans.", "Documenter maintenance, données, réversibilité et critères de réussite."],
      faqs: [
        { question: "Le sur-mesure coûte-t-il toujours plus cher ?", answer: "Son investissement initial est souvent supérieur, mais le coût total dépend des contournements, des licences, des intégrations et de la durée d’usage. Il faut comparer sur la même période." },
        { question: "Quand faut-il privilégier un logiciel existant ?", answer: "Lorsqu’il couvre le flux prioritaire avec des adaptations acceptables, que l’équipe peut l’adopter et que ses conditions de données, support et coût sont compatibles." },
        { question: "Peut-on combiner logiciel existant et application métier ?", answer: "Oui. C’est souvent le choix le plus raisonnable : conserver facturation ou comptabilité standard et construire uniquement le flux différenciant, avec une intégration maîtrisée." },
      ],
      conclusion: "Le bon choix conserve les fonctions standards lorsqu’elles existent et ne construit que ce qui réduit un écart métier fréquent, coûteux et réellement stratégique.",
      editorialReview: { clarity: 4, realism: 4, immediateUsefulness: 4, exampleQuality: 2, toolRelevance: 2, consistency: 2, readability: 1, reviewedAt: "2026-08-25" },
    },
  }),
];
