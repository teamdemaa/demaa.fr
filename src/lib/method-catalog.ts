export type MethodCategory = "Vendre" | "Reprendre" | "Structurer";

export type MethodSection = Readonly<{
  title: string;
  paragraphs: readonly string[];
  items?: readonly string[];
}>;

export type MethodSource = Readonly<{
  label: string;
  url: string;
}>;

export type MethodDefinition = Readonly<{
  format: "method";
  category: MethodCategory;
  slug: string;
  title: string;
  summary: string;
  thumbnailStatement: string;
  publishedAt: string;
  updatedAt: string;
  searchTerms: readonly string[];
  keyPoints: readonly string[];
  readingMinutes: number;
  answer: readonly string[];
  sections: readonly MethodSection[];
  example: Readonly<{
    title: string;
    paragraphs: readonly string[];
  }>;
  action: Readonly<{
    duration: string;
    title: string;
    introduction: string;
    steps: readonly string[];
    result: string;
  }>;
  professionalHelp: string;
  sources: readonly MethodSource[];
  cta: Readonly<{
    href: string;
    label: string;
    title: string;
    description: string;
  }>;
}>;

export const METHOD_ARTICLES = [
  {
    format: "method",
    category: "Structurer",
    slug: "entreprise-fonctionner-sans-dirigeant",
    title: "Votre entreprise peut-elle fonctionner un mois sans vous ?",
    summary:
      "Un test d’un mois pour mesurer les décisions et les opérations qui dépendent encore du dirigeant.",
    thumbnailStatement: "Pouvez-vous vous absenter un mois ?",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    readingMinutes: 6,
    searchTerms: ["dirigeant", "autonomie", "dépendance", "équipe", "transmission", "processus"],
    keyPoints: [
      "Le test mesure les décisions et les blocages qui apparaissent pendant votre absence.",
      "Une dépendance critique interrompt une vente, une livraison, un encaissement ou une décision importante.",
      "Commencez par le point de blocage qui affecte le plus l’activité.",
    ],
    answer: [
      "Votre entreprise peut fonctionner sans vous si l’équipe sait quoi décider, où trouver l’information et qui prend le relais lorsque la situation sort du cadre habituel.",
      "Pendant un mois, notez les sujets qui exigent réellement votre intervention. Vous obtenez la carte exacte des dépendances à traiter.",
    ],
    sections: [
      {
        title: "Définissez ce que « fonctionner » veut dire",
        paragraphs: [
          "L’entreprise doit continuer à vendre, livrer, facturer, encaisser et traiter les incidents courants pendant votre absence. L’équipe peut suivre ses propres méthodes dès lors que ces fonctions restent assurées.",
          "Avant le test, fixez les quelques événements qui seraient réellement graves : un devis important bloqué, une intervention non affectée, un client prioritaire sans réponse, une facture impossible à émettre ou une dépense indispensable non validée.",
        ],
      },
      {
        title: "Observez cinq signaux",
        paragraphs: [
          "Pendant un mois, conservez une note unique. Chaque fois que l’on vous sollicite, classez la demande selon son effet concret.",
        ],
        items: [
          "Décision : personne ne connaît la règle ou la limite d’engagement.",
          "Information : une donnée, un document ou un historique n’existe que chez vous.",
          "Relation : le client, le fournisseur ou le partenaire n’accepte de parler qu’avec vous.",
          "Autorisation : un accès, une signature ou un moyen de paiement vous est réservé.",
          "Compétence : vous seul savez réaliser ou contrôler une étape critique.",
        ],
      },
      {
        title: "Séparez présence utile et dépendance dangereuse",
        paragraphs: [
          "Les arbitrages rares, les recrutements clés et les engagements importants relèvent naturellement du dirigeant. Les opérations fréquentes et prévisibles doivent disposer d’un relais identifié.",
          "Pour chaque sollicitation, identifiez l’élément manquant : une règle, une information, un responsable, un accès ou une décision de direction. Cette qualification indique le correctif à mettre en place.",
        ],
      },
      {
        title: "Traitez le blocage qui coûte le plus",
        paragraphs: [
          "Comptez les occurrences, estimez leur conséquence et choisissez un seul sujet. Une matrice de délégation pour les remises commerciales peut suffire à débloquer les devis concernés.",
          "Le correctif doit tenir en quatre éléments : la situation de départ, la personne responsable, la règle de décision et l’endroit où tracer le résultat. Testez-le ensuite sur trois cas réels avant de passer au suivant.",
        ],
      },
    ],
    example: {
      title: "Une agence de 9 personnes qui attendait chaque devis",
      paragraphs: [
        "Pendant huit jours, la dirigeante a été sollicitée 31 fois. Vingt demandes concernaient les remises et les délais annoncés aux clients. L’équipe ignorait jusqu’où elle pouvait s’engager.",
        "L’entreprise a défini trois niveaux de remise, un délai standard par type de mission et un responsable de validation au-delà d’un seuil. La semaine suivante, quatre sollicitations ont nécessité la dirigeante. La règle a été intégrée directement au processus de devis.",
      ],
    },
    action: {
      duration: "20 minutes",
      title: "Créez votre registre de dépendances",
      introduction: "Ouvrez une note partagée intitulée « Ce qui attend encore le dirigeant ».",
      steps: [
        "Créez quatre colonnes : demande, conséquence si elle attend, personne capable de reprendre, élément manquant.",
        "Pendant cinq jours, ajoutez uniquement les demandes qui bloquent une action réelle.",
        "À la fin de la semaine, choisissez la ligne la plus fréquente ou la plus coûteuse.",
      ],
      result: "Vous terminez avec une priorité de structuration vérifiable et reliée à l’activité réelle.",
    },
    professionalHelp:
      "Faites-vous accompagner lorsque les responsabilités sont contestées, que plusieurs métiers doivent être réorganisés ou que la délégation touche des pouvoirs juridiques, bancaires ou réglementés.",
    sources: [
      {
        label: "Bpifrance Création — Diagnostiquer l’entreprise à reprendre",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/diagnostiquer-lentreprise-a",
      },
      {
        label: "INPI — Tracer et protéger le savoir-faire",
        url: "https://www.inpi.fr/actualites/dossiers-thematiques/6-outils-et-services-pour-tracer-votre-savoir-faire-et-garder-votre-avantage-concurrentiel",
      },
    ],
    cta: {
      href: "/accompagnement",
      label: "Être accompagné",
      title: "Un blocage dépend encore trop de vous ?",
      description: "Nous le transformons avec votre équipe en fonctionnement clair, attribué et réellement utilisé.",
    },
  },
  {
    format: "method",
    category: "Vendre",
    slug: "presenter-entreprise-repreneur-une-page",
    title: "Comment présenter son entreprise à un repreneur en une page ?",
    summary:
      "La trame d’une page pour qualifier l’intérêt d’un repreneur tout en protégeant les informations sensibles.",
    thumbnailStatement: "Que doit comprendre un repreneur en une page ?",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    readingMinutes: 6,
    searchTerms: ["cession", "repreneur", "présentation", "teaser", "PME", "confidentialité"],
    keyPoints: [
      "La première page doit permettre de comprendre l’activité, sa taille et sa logique économique.",
      "Elle permet de qualifier l’intérêt tout en gardant l’identité et le fichier clients confidentiels.",
      "Chaque chiffre présenté doit être expliqué et comparable aux comptes.",
    ],
    answer: [
      "Une bonne présentation d’une page répond à six questions : que vend l’entreprise, à qui, où, avec quelle équipe, pour quels résultats et pourquoi le dirigeant envisage-t-il la transmission ?",
      "Cette page permet à un repreneur sérieux de décider rapidement s’il souhaite signer un engagement de confidentialité et poursuivre l’échange.",
    ],
    sections: [
      {
        title: "Commencez par une phrase compréhensible",
        paragraphs: [
          "Écrivez ce que l’entreprise réalise, pour quel client et dans quelle zone : « Maintenance préventive et dépannage de cuisines professionnelles en Île-de-France » est immédiatement exploitable. Les formules comme « acteur de référence » ou « solution globale » n’apportent aucune information.",
          "Ajoutez l’ancienneté, la zone couverte et la forme de clientèle uniquement s’ils aident à comprendre la stabilité de l’activité.",
        ],
      },
      {
        title: "Montrez l’économie de l’activité",
        paragraphs: [
          "Retenez le chiffre d’affaires du dernier exercice, une mesure de résultat cohérente avec vos comptes et leur évolution sur trois ans. Précisez si les revenus sont récurrents, contractuels, saisonniers ou concentrés sur quelques clients.",
          "Accompagnez tout résultat « retraité » d’une ligne expliquant l’ajustement. Les chiffres de la page devront pouvoir être rapprochés des comptes transmis plus tard.",
        ],
      },
      {
        title: "Rendez l’organisation visible",
        paragraphs: [
          "Indiquez le nombre de salariés, les fonctions clés et le rôle opérationnel actuel du dirigeant. Un repreneur cherche à savoir ce qu’il reprend réellement et ce qu’il devra assurer dès le premier jour.",
          "Mentionnez uniquement les actifs utiles à la compréhension du fonctionnement : contrats structurants, équipement spécifique, agréments, logiciel métier, méthodes documentées ou marque.",
        ],
      },
      {
        title: "Expliquez factuellement le projet de cession",
        paragraphs: [
          "Une formulation factuelle suffit : départ à la retraite, nouveau projet, rapprochement ou volonté d’adossement. Ajoutez le type de transmission envisagé si vous l’avez arrêté et la disponibilité prévue pour la passation.",
          "Terminez par deux ou trois points qui rendent la continuité crédible : portefeuille récurrent, équipe expérimentée, demande locale, capacité disponible ou savoir-faire distinctif. Chaque point doit pouvoir être démontré ensuite.",
        ],
      },
      {
        title: "Protégez ce qui identifie l’entreprise",
        paragraphs: [
          "Avant engagement de confidentialité, masquez la raison sociale, l’adresse précise, le nom des clients, les tarifs individualisés et toute donnée permettant d’identifier immédiatement l’entreprise. Utilisez des ordres de grandeur lorsque le chiffre exact créerait un risque.",
          "La page sert à sélectionner les bons interlocuteurs. Le dossier détaillé, les contrats et les données nominatives viennent après, dans un cadre de confidentialité adapté.",
        ],
      },
    ],
    example: {
      title: "Le résumé d’une société de maintenance",
      paragraphs: [
        "« Entreprise de maintenance d’équipements professionnels, active depuis 14 ans dans deux départements. 1,35 M€ de chiffre d’affaires, dont 62 % sous contrats récurrents, avec une progression moyenne de 6 % sur trois ans. Équipe de 11 personnes : huit techniciens, une planificatrice, une commerciale et le dirigeant. »",
        "« Le dirigeant supervise les achats importants et cinq comptes majeurs ; il prévoit une passation de six mois. La transmission est motivée par un changement de projet. Les points forts vérifiables sont le parc sous contrat, la qualification de l’équipe et un délai d’intervention court. » Cette version permet de décider d’un échange tout en gardant l’entreprise et ses clients confidentiels.",
      ],
    },
    action: {
      duration: "30 minutes",
      title: "Rédigez six blocs, puis arrêtez-vous",
      introduction: "Prenez une page blanche. Commencez par le fond et utilisez des faits.",
      steps: [
        "Activité et clientèle en une phrase.",
        "Zone, ancienneté et raison de la transmission.",
        "Chiffre d’affaires, résultat retenu et évolution sur trois ans.",
        "Part de revenus récurrents et niveau de concentration clients.",
        "Effectif, fonctions clés et rôle réel du dirigeant.",
        "Trois forces démontrables et modalités de passation envisagées.",
      ],
      result: "Vous obtenez une base qualifiante à diffuser après contrôle des chiffres et retrait des éléments identifiants.",
    },
    professionalHelp:
      "Faites relire la présentation lorsqu’elle comporte un retraitement financier, des informations sensibles ou un périmètre de cession encore à définir — titres, branche d’activité ou actifs.",
    sources: [
      {
        label: "CCI — Réaliser les diagnostics de son entreprise",
        url: "https://www.cci.fr/ressources/ceder-votre-entreprise/realiser-les-diagnostics-de-votre-entreprise/pre-diagnostic-transmission-en-ligne",
      },
      {
        label: "Bpifrance Création — Réussir sa reprise-transmission",
        url: "https://bpifrance-creation.fr/boiteaoutils/reussir-reprise-transmission-guide-complet",
      },
    ],
    cta: {
      href: "/transmettre",
      label: "Présenter mon entreprise",
      title: "Vous envisagez de vendre ?",
      description: "Nous présentons gratuitement votre entreprise à des repreneurs dont le projet correspond.",
    },
  },
  {
    format: "method",
    category: "Vendre",
    slug: "premiere-estimation-realiste-entreprise",
    title: "Comment obtenir une première estimation réaliste de son entreprise ?",
    summary:
      "Une méthode pour construire une fourchette fondée sur la rentabilité transmissible et les risques de l’entreprise.",
    thumbnailStatement: "Combien vaut votre entreprise ?",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    readingMinutes: 7,
    searchTerms: ["estimation", "valorisation", "prix", "cession", "EBE", "rentabilité"],
    keyPoints: [
      "La valeur dépend des résultats futurs transférables, de leur stabilité et du niveau de risque.",
      "Une estimation sérieuse croise plusieurs méthodes et présente une fourchette.",
      "Les retraitements doivent être justifiés un par un et compatibles avec le fonctionnement futur.",
    ],
    answer: [
      "Commencez par fiabiliser trois années de chiffres, isolez les éléments exceptionnels et estimez la rentabilité réellement transmissible. Comparez ensuite le résultat obtenu à des transactions ou références cohérentes avec le secteur, la taille et le risque de l’entreprise.",
      "Le résultat prend la forme d’une fourchette argumentée. Le prix final dépendra aussi de la dette, de la trésorerie, du besoin en fonds de roulement, des garanties et des conditions de la négociation.",
    ],
    sections: [
      {
        title: "Choisissez le bon périmètre",
        paragraphs: [
          "Avant tout calcul, précisez ce qui serait vendu : les titres de la société, une branche d’activité ou certains actifs. Le montant perçu par le vendeur intègre ensuite la dette, la trésorerie et les modalités de l’opération.",
          "Listez séparément la dette financière, la trésorerie disponible et les éléments hors exploitation. Cette séparation évite de comparer un prix de titres avec une référence exprimée avant dette et trésorerie.",
        ],
      },
      {
        title: "Reconstituez une performance soutenable",
        paragraphs: [
          "Partez des comptes des trois derniers exercices et du réalisé récent. Identifiez les charges ou produits réellement exceptionnels, la rémunération du dirigeant à normaliser et les dépenses personnelles éventuelles. Documentez chaque correction avec son montant et sa preuve.",
          "Intégrez les charges nécessaires au fonctionnement futur. Si le repreneur doit recruter pour remplacer le dirigeant, ce coût entre dans le calcul. La performance retenue reflète les conditions normales après la transmission.",
        ],
      },
      {
        title: "Croisez au moins deux regards",
        paragraphs: [
          "L’approche par la rentabilité relie la valeur à un résultat représentatif et à un niveau de risque. L’approche comparative observe des références de marché réellement comparables. Une approche patrimoniale peut fournir un plancher ou être centrale lorsque les actifs ont un poids important.",
          "Avant d’utiliser un multiple, vérifiez sa définition, la taille des sociétés observées, la période et le périmètre du prix. Un même multiple appliqué à l’EBE, à l’EBITDA ou à un résultat retraité produit des valeurs différentes.",
        ],
      },
      {
        title: "Mesurez ce qui élargit ou réduit la fourchette",
        paragraphs: [
          "La concentration clients, la dépendance au dirigeant, la stabilité de l’équipe, la visibilité du carnet de commandes, les investissements à venir et la qualité du reporting modifient le risque perçu. Leur analyse sert à choisir et défendre l’hypothèse retenue.",
          "Présentez un scénario bas, central et haut. Pour chacun, indiquez la performance utilisée, la référence de marché et les conditions nécessaires. La fourchette devient alors une base de discussion contrôlable.",
        ],
      },
    ],
    example: {
      title: "Du résultat publié au résultat transmissible",
      paragraphs: [
        "Une PME affiche 180 000 € d’EBE. Après retrait d’un produit exceptionnel de 25 000 €, ajout d’un loyer sous-évalué de 12 000 € et prise en compte de 45 000 € pour remplacer une partie du travail opérationnel du dirigeant, la performance transmissible retenue tombe à 98 000 €.",
        "La performance transmissible de 98 000 € est ensuite confrontée à des références comparables, au besoin d’investissement, à la dette, à la trésorerie et aux risques commerciaux. Ces éléments construisent la fourchette de valeur.",
      ],
    },
    action: {
      duration: "30 minutes",
      title: "Préparez le pont vers le résultat transmissible",
      introduction: "Une feuille unique suffit pour cette première analyse.",
      steps: [
        "Inscrivez l’EBE ou le résultat d’exploitation des trois derniers exercices.",
        "Ajoutez une ligne par élément exceptionnel ou non reproductible, avec le montant et la preuve disponible.",
        "Ajoutez le coût réaliste des fonctions du dirigeant qu’un repreneur devra remplacer.",
        "Calculez un résultat bas, central et haut. Réservez l’application des multiples à l’étape suivante.",
      ],
      result: "Vous obtenez la donnée de départ à faire vérifier et la liste des hypothèses qui la font varier.",
    },
    professionalHelp:
      "Faites intervenir un expert-comptable ou un évaluateur pour valider les retraitements, choisir les méthodes et traiter dette, trésorerie et besoin en fonds de roulement. Un conseil juridique doit préciser le périmètre et les conséquences de l’opération.",
    sources: [
      {
        label: "Bpifrance Création — Évaluation d’entreprise",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/evaluation-dentreprise",
      },
      {
        label: "Bpifrance Création — Méthodes d’évaluation",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/methode-devaluation-dentreprise",
      },
      {
        label: "Bpifrance Création — Diagnostic financier d’une reprise",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/diagnostic-financier-reprise-dun",
      },
    ],
    cta: {
      href: "/transmettre?intent=valuation",
      label: "Estimer mon entreprise",
      title: "Vous voulez confronter votre première fourchette ?",
      description: "Demandez une première estimation et identifiez les hypothèses qui méritent d’être approfondies.",
    },
  },
  {
    format: "method",
    category: "Reprendre",
    slug: "questions-analyser-entreprise-a-reprendre",
    title: "Les 10 questions à poser avant d’étudier une entreprise à reprendre",
    summary:
      "Dix questions pour décider rapidement si une opportunité mérite une analyse approfondie.",
    thumbnailStatement: "Faut-il poursuivre l’analyse ?",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    readingMinutes: 7,
    searchTerms: ["reprise", "acquéreur", "questions", "audit", "PME", "opportunité"],
    keyPoints: [
      "Le premier échange doit permettre de décider si l’analyse mérite d’être poursuivie.",
      "Les réponses utiles relient les chiffres, les clients, l’équipe et le rôle du dirigeant.",
      "Les réponses doivent pouvoir être expliquées et vérifiées.",
    ],
    answer: [
      "Avant de mobiliser des conseils et de demander des dizaines de documents, vérifiez l’adéquation du projet, la qualité des revenus, la rentabilité transférable et les dépendances majeures.",
      "Ces dix questions doivent produire des réponses courtes, chiffrées lorsque c’est pertinent, et cohérentes entre elles. Les diagnostics et les audits approfondiront ensuite les points identifiés.",
    ],
    sections: [
      {
        title: "Le projet de transmission",
        paragraphs: [
          "Commencez par comprendre le contexte. Une réponse claire permet d’interpréter les informations qui suivent et d’identifier les risques à examiner.",
        ],
        items: [
          "1. Pourquoi le dirigeant souhaite-t-il vendre, et quel calendrier envisage-t-il ?",
          "2. Que comprend exactement la cession : titres, actifs, contrats, immobilier, trésorerie ou dette ?",
        ],
      },
      {
        title: "Les revenus et la rentabilité",
        paragraphs: [
          "Évaluez la qualité économique à travers les tendances, leurs causes et la composition des revenus. Les pièces détaillées viendront confirmer les réponses.",
        ],
        items: [
          "3. Comment le chiffre d’affaires a-t-il évolué sur trois ans, et qu’est-ce qui explique les variations ?",
          "4. Quelle part dépend des cinq premiers clients, de contrats récurrents ou d’appels d’offres ?",
          "5. Quel résultat resterait après remplacement du travail opérationnel du dirigeant et retrait des éléments exceptionnels ?",
        ],
      },
      {
        title: "Le fonctionnement réel",
        paragraphs: [
          "Une activité rentable peut être difficile à reprendre si les décisions, les relations ou le savoir-faire reposent sur une seule personne.",
        ],
        items: [
          "6. Que fait personnellement le dirigeant chaque semaine dans la vente, la production et la gestion ?",
          "7. Qui sont les personnes clés, depuis combien de temps sont-elles présentes et que savent-elles décider seules ?",
          "8. Quels processus, outils, accès et indicateurs permettent aujourd’hui de faire fonctionner l’activité ?",
        ],
      },
      {
        title: "Les risques et la transition",
        paragraphs: [
          "Terminez par ce qui pourrait empêcher la continuité. Notez chaque sujet à examiner pendant les audits.",
        ],
        items: [
          "9. Quels contrats, agréments, litiges, investissements ou dépendances fournisseurs pourraient changer après la cession ?",
          "10. Quelle passation le dirigeant est-il prêt à assurer, pendant combien de temps et avec quel rôle ?",
        ],
      },
      {
        title: "Lisez aussi la qualité des réponses",
        paragraphs: [
          "Une réponse imprécise peut venir d’une information encore peu structurée, comme la concentration clients ou le rôle opérationnel du dirigeant. Demandez comment elle sera vérifiée et dans quel délai elle sera disponible.",
          "Traitez comme points d’audit explicites toute réponse qui change selon l’interlocuteur, tout chiffre impossible à rapprocher des comptes et tout refus persistant d’expliquer une dépendance. Consignez le fait observé ; son explication devra être vérifiée.",
        ],
      },
    ],
    example: {
      title: "Une opportunité incompatible avec le projet du repreneur",
      paragraphs: [
        "Un repreneur recherche une entreprise pilotable avec une équipe en place. La cible étudiée réalise 1,8 M€ de chiffre d’affaires et une bonne marge. Le dirigeant signe tous les devis, détient seul la relation avec trois clients représentant 54 % des ventes et prévoit un mois de passation.",
        "Le niveau de dépendance et la durée de passation dépassent les critères fixés par le repreneur. Trois réponses obtenues en vingt minutes suffisent pour arrêter l’analyse avant d’engager des frais d’audit.",
      ],
    },
    action: {
      duration: "20 minutes",
      title: "Choisissez vos trois critères d’arrêt",
      introduction: "Avant le prochain échange, décidez ce qui rendrait l’opportunité incompatible avec votre projet.",
      steps: [
        "Fixez votre niveau maximal de concentration clients.",
        "Définissez le rôle opérationnel que vous acceptez d’assumer la première année.",
        "Déterminez la durée minimale de passation nécessaire.",
        "Posez d’abord les questions 4, 6 et 10. Poursuivez lorsque les réponses restent compatibles avec vos critères.",
      ],
      result: "Vous réservez votre temps d’analyse aux opportunités compatibles avec votre projet.",
    },
    professionalHelp:
      "Dès qu’un intérêt sérieux se confirme, faites cadrer les audits financier, juridique, fiscal, social et opérationnel par les professionnels adaptés. Les réponses initiales orientent le périmètre de leur travail.",
    sources: [
      {
        label: "Bpifrance Création — Diagnostiquer l’entreprise à reprendre",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/diagnostiquer-lentreprise-a",
      },
      {
        label: "Bpifrance Création — Diagnostic financier d’une reprise",
        url: "https://bpifrance-creation.fr/encyclopedie/reprendre-entreprise-etapes/diagnostiquer-evaluer/diagnostic-financier-reprise-dun",
      },
    ],
    cta: {
      href: "/a-reprendre",
      label: "Voir les entreprises",
      title: "Vous cherchez une entreprise à reprendre ?",
      description: "Consultez les opportunités et confiez-nous vos critères pour être contacté lorsqu’un projet correspond.",
    },
  },
  {
    format: "method",
    category: "Vendre",
    slug: "transmettre-clients-savoir-faire-responsabilites",
    title: "Que transmettre à un repreneur ?",
    summary:
      "Les éléments nécessaires pour préserver les clients, piloter l’équipe et poursuivre l’activité après la cession.",
    thumbnailStatement: "Que devra savoir le repreneur dès le premier jour ?",
    publishedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    readingMinutes: 7,
    searchTerms: ["passation", "clients", "savoir-faire", "responsabilités", "repreneur", "transmission"],
    keyPoints: [
      "La transmission porte d’abord sur les décisions, les relations et les situations à risque.",
      "Chaque élément transmis doit être utilisé et vérifié par l’équipe.",
      "Les données clients, les accès et les engagements doivent être transmis dans un cadre juridique sécurisé.",
    ],
    answer: [
      "Un repreneur doit recevoir ce qui lui permet de préserver les clients, piloter l’équipe, livrer le travail et prendre les décisions récurrentes. La transmission couvre les documents, les outils, les relations et les pratiques de l’équipe.",
      "Le meilleur support est souvent le fonctionnement déjà utilisé par l’équipe : responsables identifiés, routines courtes, outils à jour, indicateurs lisibles et calendrier de passation testé sur des cas réels.",
    ],
    sections: [
      {
        title: "Les clients et les engagements en cours",
        paragraphs: [
          "Pour les clients importants, rassemblez le contexte de la relation, les interlocuteurs, les contrats, les conditions particulières, les dossiers ouverts et la prochaine échéance. Ajoutez ce qui pourrait surprendre le repreneur : promesse orale, litige latent, remise inhabituelle ou dépendance à une personne.",
          "Planifiez qui présente le repreneur, à quel moment et avec quel message. Communiquez la base clients dans le respect du cadre contractuel et des règles de protection des données.",
        ],
      },
      {
        title: "Le savoir-faire qui change le résultat",
        paragraphs: [
          "Documentez les étapes où une mauvaise décision crée une perte, un retard, un défaut de qualité ou un risque. Pour chacune, conservez le déclencheur, les critères de décision, un exemple réel et la preuve attendue.",
          "Le savoir-faire peut aussi résider dans une séquence commerciale, un diagnostic, une estimation, un réglage ou une façon d’affecter les équipes. Faites réaliser l’étape par la personne qui la reprendra et vérifiez le résultat sur un cas réel.",
        ],
      },
      {
        title: "Les rôles et les limites de décision",
        paragraphs: [
          "Écrivez qui décide quoi pour les ventes, les achats, la planification, les recrutements, les paiements et les incidents. Ajoutez les seuils d’escalade : montant, niveau de risque, délai ou type de client.",
          "Le repreneur voit ainsi les responsabilités déjà portées par l’équipe, celles qu’il devra reprendre et les fonctions informelles encore assumées par le dirigeant.",
        ],
      },
      {
        title: "Les outils, accès et données de pilotage",
        paragraphs: [
          "Dressez la liste des outils indispensables, de leur propriétaire, du mode d’authentification, des droits administrateur, du renouvellement et de la procédure de récupération. Transférez les accès par un canal sécurisé au moment prévu.",
          "Conservez un tableau de bord court : trésorerie, facturation, carnet de commandes, marge ou capacité selon l’activité. Pour chaque chiffre, indiquez sa source, sa fréquence et la personne qui le met à jour.",
        ],
      },
      {
        title: "Une passation orientée situations réelles",
        paragraphs: [
          "Organisez la passation autour du calendrier de l’entreprise : clôture mensuelle, revue commerciale, planification, commande importante, incident client et renouvellement de contrat. Le repreneur observe d’abord, conduit ensuite avec le cédant, puis agit seul avec un point de contrôle.",
          "Fixez par écrit la durée, la disponibilité, les sujets couverts et les limites d’intervention du cédant. Ce cadre permet au repreneur de prendre progressivement les décisions à sa charge.",
        ],
      },
    ],
    example: {
      title: "Trois routines qui ont sécurisé la passation",
      paragraphs: [
        "Une entreprise de services avait préparé dix classeurs de procédures. Les règles d’arbitrage des urgences clients, d’ajustement du planning et de refus des affaires restaient absentes.",
        "L’équipe a créé une matrice d’arbitrage, une revue hebdomadaire de 30 minutes et cinq fiches clients à risque. Le repreneur a conduit ces routines pendant la passation. La continuité est devenue observable.",
      ],
    },
    action: {
      duration: "25 minutes",
      title: "Listez les dix décisions qui reviennent",
      introduction: "Commencez par les décisions qui doivent continuer après le départ du dirigeant.",
      steps: [
        "Notez dix décisions fréquentes prises aujourd’hui par le dirigeant ou une personne clé.",
        "Pour chacune, indiquez le futur responsable et la règle qui l’aide à trancher.",
        "Ajoutez le prochain cas réel sur lequel la personne pourra s’exercer.",
        "Conservez les lignes qui affectent le client, l’argent, le délai, la qualité ou le risque.",
      ],
      result: "Vous obtenez un ordre de travail fondé sur les décisions réelles de l’entreprise.",
    },
    professionalHelp:
      "Faites cadrer par vos conseils le transfert des contrats, des données personnelles, des droits de propriété intellectuelle, des autorisations et des pouvoirs. Ils doivent être cohérents avec l’acte de cession et son calendrier.",
    sources: [
      {
        label: "Bpifrance Création — Transmettre son entreprise étape par étape",
        url: "https://bpifrance-creation.fr/moment-de-vie/transmettre-entreprise-etape-etape",
      },
      {
        label: "INPI — Tracer et protéger le savoir-faire",
        url: "https://www.inpi.fr/actualites/dossiers-thematiques/6-outils-et-services-pour-tracer-votre-savoir-faire-et-garder-votre-avantage-concurrentiel",
      },
      {
        label: "CNIL — Vente de fichiers clients : les règles",
        url: "https://www.cnil.fr/fr/vente-de-fichiers-clients-la-cnil-rappelle-les-regles",
      },
      {
        label: "Service Public — Rédiger l’acte définitif de cession",
        url: "https://entreprendre.service-public.fr/vosdroits/F36101",
      },
    ],
    cta: {
      href: "/accompagnement",
      label: "Préparer la transmission",
      title: "Votre fonctionnement repose encore sur quelques personnes ?",
      description: "Nous mettons en place avec l’équipe les systèmes réellement utiles avant la transmission.",
    },
  },
] as const satisfies readonly MethodDefinition[];
