export const CONTENT_CATEGORIES = [
  "Clients & ventes",
  "Planning & opérations",
  "Administration & facturation",
  "Outils & automatisation",
  "Gestion & conformité",
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export type ContentSurface = "contenus" | "organisation";

export type ContentSource = Readonly<{
  label: string;
  href: string;
}>;

export type ContentArticleSection = Readonly<{
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}>;

export type ContentCatalogEntry = Readonly<{
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  category: ContentCategory;
  surfaces: readonly ContentSurface[];
  tags: readonly string[];
  status: "draft" | "published";
  publishedAt: string;
  updatedAt: string;
  verifiedAt: string;
  relatedSystemSlugs: readonly string[];
  academyFundamentalSlugs: readonly string[];
  media: Readonly<{
    slides?: readonly string[];
    youtubeId?: string;
    youtubeThumbnail?: string;
    duration?: string;
  }>;
  keyPoints: readonly string[];
  article: readonly ContentArticleSection[];
  sources: readonly ContentSource[];
}>;

type OrganisationContentInput = Readonly<{
  category: ContentCategory;
  checklist: readonly string[];
  friction: readonly string[];
  result: readonly string[];
  slug: string;
  steps: readonly string[];
  summary: string;
  tags: readonly string[];
  title: string;
  withChatGpt: readonly string[];
}>;

function defineOrganisationContent(
  input: OrganisationContentInput,
): ContentCatalogEntry {
  return {
    slug: input.slug,
    title: input.title,
    shortTitle: input.title,
    summary: input.summary,
    category: input.category,
    surfaces: ["organisation"],
    tags: input.tags,
    status: "published",
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    verifiedAt: "2026-09-02",
    relatedSystemSlugs: [],
    academyFundamentalSlugs: [],
    media: {},
    keyPoints: input.checklist.slice(0, 4),
    article: [
      {
        heading: "Ce qui bloque aujourd’hui",
        paragraphs: input.friction,
      },
      {
        heading: "Le résultat à obtenir",
        paragraphs: input.result,
      },
      {
        heading: "La méthode, étape par étape",
        items: input.steps,
      },
      {
        heading: "Construire le système avec ChatGPT",
        paragraphs: input.withChatGpt,
      },
      {
        heading: "La checklist de mise en place",
        items: input.checklist,
      },
    ],
    sources: [],
  };
}

const FACTURATION_ELECTRONIQUE_SLIDES = Array.from(
  { length: 9 },
  (_, index) => `/images/courses/facturation-electronique/${String(index + 1).padStart(2, "0")}.png`,
);

const contentCatalog = [
  defineOrganisationContent({
    slug: "gerer-les-urgences-sans-subir",
    title: "Comment ne plus passer ses journées à gérer les urgences ?",
    summary:
      "Construisez une liste de travail commune pour trier les demandes, attribuer la prochaine action et ne plus décider seul de chaque urgence.",
    category: "Planning & opérations",
    tags: ["urgences", "priorités", "demandes", "équipe", "organisation"],
    friction: [
      "Prenons un cas courant : une équipe reçoit ses demandes par téléphone, e-mail et messagerie. Une même demande peut être transmise deux fois, rester sans réponse ou devenir « urgente » simplement parce que personne ne sait où elle en est.",
      "Le tutoriel traite précisément la réception et le suivi de ces demandes. Il ne cherche pas à réorganiser toute l’entreprise en une fois.",
    ],
    result: [
      "Une liste de travail unique contient chaque demande à traiter avec dix informations : date, demandeur, sujet, moyen de réception, impact, priorité, responsable, prochaine action, échéance et statut.",
      "Trois règles suffisent pour commencer : P1 bloque un client, la sécurité ou un paiement et se traite le jour même ; P2 menace un engagement de la semaine et se traite sous 48 heures ; P3 attend la prochaine revue.",
    ],
    steps: [
      "Rassemblez 20 demandes réelles reçues la semaine précédente, sans données sensibles, et notez comment elles sont arrivées.",
      "Créez les dix informations de la liste commune : date, demandeur, sujet, moyen de réception, impact, priorité, responsable, prochaine action, échéance et statut.",
      "Classez les 20 exemples en P1, P2 ou P3 avec les trois règles ci-dessus. Si deux personnes ne classent pas une demande de la même manière, précisez la règle.",
      "Définissez un responsable unique et une prochaine action formulée avec un verbe pour chaque demande ouverte.",
      "Testez cette façon de travailler pendant cinq jours avec un seul type de demandes avant de l’étendre aux autres moyens de réception.",
      "À la fin de la semaine, gardez les règles utiles, corrigez les ambiguïtés et automatisez seulement les transferts devenus prévisibles.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec des exemples sans informations confidentielles : « Voici 20 demandes reçues par notre équipe. Regroupe-les en cinq catégories maximum. Pour chacune, propose une priorité P1, P2 ou P3 selon ces règles : P1 bloque un client, la sécurité ou un paiement ; P2 menace un engagement de la semaine ; P3 peut attendre la revue. Signale les cas ambigus sans inventer de responsable ni d’échéance. Présente le résultat en tableau avec : demande, catégorie, priorité, justification et prochaine action à valider. »",
      "Relisez chaque proposition avec la personne qui traite les demandes. ChatGPT prépare le tri ; l’équipe valide l’impact, le responsable et la date avant toute connexion aux outils.",
    ],
    checklist: [
      "Cinq demandes peuvent être ajoutées sans demander où les enregistrer.",
      "Deux personnes classent les mêmes demandes avec la même priorité.",
      "Chaque demande ouverte possède un responsable, une prochaine action et une échéance.",
      "Un membre de l’équipe identifie les deux priorités du jour sans interroger le dirigeant.",
      "Une demande est clôturée de bout en bout et reste traçable dans la file commune.",
    ],
  }),
  defineOrganisationContent({
    slug: "rassembler-les-taches-dispersees",
    title: "Comment centraliser ses tâches sans changer tous ses outils ?",
    summary:
      "Créez un tableau de suivi commun pour retrouver les tâches, leur responsable et leur prochaine échéance sans remplacer tous vos outils.",
    category: "Outils & automatisation",
    tags: ["tâches", "outils", "centralisation", "automatisation", "organisation"],
    friction: [
      "Les tâches se trouvent dans les e-mails, les messages, un tableur et le logiciel métier. Chacun conserve sa propre liste et le dirigeant doit ouvrir plusieurs outils pour comprendre ce qui reste à faire.",
      "L’objectif n’est pas de tout migrer. Il est de créer un tableau commun qui renvoie vers les informations déjà présentes au bon endroit.",
    ],
    result: [
      "Un tableau de suivi réunit chaque tâche avec sept informations : action, client ou dossier, lien vers l’information d’origine, responsable, échéance, statut et date de dernière mise à jour.",
      "Chaque outil garde un rôle précis : le tableau commun sert à suivre le travail, tandis que les documents, échanges et données métier restent dans les outils où l’équipe les utilise déjà.",
    ],
    steps: [
      "Choisissez dix tâches réelles réparties dans au moins trois outils et notez où chacune est aujourd’hui suivie.",
      "Pour chaque outil, écrivez une seule fonction : communiquer, stocker un document, gérer une donnée métier ou piloter une action.",
      "Créez le tableau commun avec les sept informations : action, dossier, lien vers l’origine, responsable, échéance, statut et dernière mise à jour.",
      "Ajoutez les dix tâches en conservant un lien vers leur source au lieu de recopier toutes les informations.",
      "Définissez un seul endroit où modifier le statut et une règle simple pour les nouvelles tâches entrantes.",
      "Testez le tableau pendant une semaine, puis automatisez uniquement une recopie fréquente dont l’origine et la destination sont stables.",
    ],
    withChatGpt: [
      "Copiez ce prompt : « Voici dix tâches et les outils dans lesquels elles sont suivies. Construis un tableau simple de notre fonctionnement. Pour chaque tâche, indique l’outil d’origine, l’information à conserver dans le tableau commun, le lien à garder et les doublons probables. Ne propose aucune migration. Termine par une liste des décisions que l’équipe doit valider. »",
      "Utilisez la réponse pour préparer le tableau, puis contrôlez chaque lien et chaque statut avec l’équipe. Une automatisation n’est ajoutée qu’après une semaine de fonctionnement manuel sans ambiguïté.",
    ],
    checklist: [
      "Chaque outil possède un rôle écrit en une phrase.",
      "Les dix tâches tests apparaissent dans le tableau avec un lien valide vers leur origine.",
      "Une seule personne est responsable de chaque tâche ouverte.",
      "Un collègue retrouve le prochain travail à faire sans ouvrir tous les outils.",
      "Le statut d’une tâche test reste cohérent après sa clôture dans le travail réel.",
    ],
  }),
  defineOrganisationContent({
    slug: "transformer-reunions-en-actions",
    title: "Comment transformer ses réunions en décisions et en actions ?",
    summary:
      "Transformez chaque réunion en un relevé court de décisions et d’actions attribuées, datées et réellement suivies.",
    category: "Planning & opérations",
    tags: ["réunions", "décisions", "actions", "compte rendu", "suivi"],
    friction: [
      "La réunion se termine avec plusieurs pages de notes, mais personne ne sait distinguer ce qui a été décidé de ce qui a seulement été discuté. Les mêmes sujets reviennent et les actions sans responsable restent ouvertes.",
      "Le tutoriel construit un relevé opérationnel, pas un compte rendu exhaustif de chaque prise de parole.",
    ],
    result: [
      "Un tableau de suivi unique contient quatre types d’éléments : décision prise, action à réaliser, question encore ouverte et information à conserver.",
      "Chaque action comporte un verbe, un responsable unique, une échéance, un statut et un lien vers la réunion ou le dossier concerné.",
    ],
    steps: [
      "Avant la réunion, écrivez l’objectif et les deux ou trois décisions qui doivent être prises.",
      "Pendant l’échange, marquez chaque note avec D pour décision, A pour action, Q pour question ou I pour information.",
      "Reformulez chaque action avec un verbe, un responsable unique, une date et le dossier concerné.",
      "Réservez les cinq dernières minutes pour relire uniquement les décisions, les actions et les questions ouvertes.",
      "Transférez les actions validées dans le tableau commun et envoyez son lien, pas une nouvelle copie du compte rendu.",
      "Au point suivant, affichez les actions ouvertes et clôturez-les avant d’ajouter de nouveaux sujets.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec vos notes : « Transforme ces notes en quatre listes : décisions prises, actions, questions ouvertes et informations. Pour chaque action, reprends uniquement le responsable et l’échéance explicitement mentionnés. Écris “à confirmer” si l’un manque. N’invente aucune décision. Termine par les trois points à valider avant diffusion. »",
      "Relisez la synthèse avec les participants avant de quitter la réunion. ChatGPT structure les notes ; les personnes présentes confirment ce qui engage réellement l’équipe.",
    ],
    checklist: [
      "L’objectif et les décisions attendues sont visibles avant la réunion.",
      "Aucune discussion n’est présentée comme une décision sans validation explicite.",
      "Chaque action possède un verbe, un responsable unique et une date.",
      "Le relevé validé est accessible depuis un seul lien dans les 24 heures.",
      "Quarante-huit heures plus tard, un participant sait retrouver ce qu’il doit faire sans relire toutes les notes.",
    ],
  }),
  defineOrganisationContent({
    slug: "rendre-equipe-autonome-decisions",
    title: "Comment rendre son équipe plus autonome sans perdre le contrôle ?",
    summary:
      "Créez des règles de décision simples pour que l’équipe agisse seule dans un cadre clair et ne remonte que les vrais cas particuliers.",
    category: "Planning & opérations",
    tags: ["équipe", "délégation", "décision", "autonomie", "dirigeant"],
    friction: [
      "Les responsabilités existent sur le papier, mais leurs limites restent floues. Par sécurité, l’équipe demande une validation pour un geste commercial, un achat, un délai ou un imprévu déjà rencontré plusieurs fois.",
      "Le dirigeant devient le passage obligé de décisions fréquentes et faciles à corriger qui pourraient être prises sans lui.",
    ],
    result: [
      "Un tableau de règles décrit chaque décision récurrente avec sept informations : situation, personne autorisée, informations nécessaires, limite, délai de réponse, cas où prévenir le dirigeant et trace à conserver.",
      "Chaque situation suit l’un de ces trois niveaux : décider seul, décider puis informer, ou faire valider avant d’agir.",
    ],
    steps: [
      "Notez pendant une semaine les 20 demandes de validation reçues par le dirigeant et leur réponse finale.",
      "Regroupez-les par situation et commencez par trois décisions fréquentes, peu risquées et faciles à corriger.",
      "Pour chacune, choisissez un niveau : décider seul, décider puis informer, ou faire valider avant d’agir.",
      "Complétez les sept informations du tableau et ajoutez deux exemples : un cas que l’équipe peut gérer seule et un cas où elle doit prévenir le dirigeant.",
      "Présentez les règles aux personnes concernées, puis testez-les pendant deux semaines sur des situations réelles.",
      "Analysez les cas particuliers avec l’équipe et modifiez la règle plutôt que de reprendre toutes les décisions au dirigeant.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec des demandes sans informations confidentielles : « Regroupe ces demandes de validation par type de décision. Pour chaque groupe, indique la fréquence, le risque si la décision est mauvaise, si elle peut être facilement corrigée et les informations utilisées par le dirigeant pour répondre. Propose ensuite un premier classement : décider seul, décider puis informer, ou faire valider. Signale chaque supposition. »",
      "Le dirigeant valide ensuite les limites, les montants et les risques avec les personnes concernées. La proposition de ChatGPT sert à repérer les répétitions, jamais à déléguer une responsabilité automatiquement.",
    ],
    checklist: [
      "Trois décisions récurrentes possèdent une règle écrite et un niveau d’autonomie.",
      "Chaque limite et chaque motif pour prévenir le dirigeant reposent sur un fait observable.",
      "L’équipe dispose d’un exemple autorisé et d’un exemple où elle doit demander de l’aide pour chaque règle.",
      "Cinq décisions tests sont prises correctement sans solliciter le dirigeant.",
      "Les cas particuliers observés servent à corriger le tableau après deux semaines.",
    ],
  }),
  defineOrganisationContent({
    slug: "retrouver-informations-documents",
    title: "Comment organiser ses informations pour que l’équipe les retrouve seule ?",
    summary:
      "Construisez un point d’accès clair pour que l’équipe retrouve la bonne information et la bonne version sans solliciter son créateur.",
    category: "Outils & automatisation",
    tags: ["documents", "informations", "recherche", "drive", "classement"],
    friction: [
      "Les documents sont répartis entre les dossiers personnels, la messagerie, le Drive et les outils métier. Les noms varient, plusieurs versions circulent et une partie de l’équipe demande toujours à la même personne où chercher.",
      "Tout ne doit pas être rangé dans Drive : les documents y restent, tandis que les statuts, échéances et autres données structurées restent dans l’outil qui les pilote.",
    ],
    result: [
      "Un tableau indique pour chaque information : son nom, son type, l’endroit où trouver la bonne version, la personne responsable, les personnes autorisées, sa date de révision et les mots-clés utiles pour la retrouver.",
      "Une règle commune pour nommer les fichiers et une structure de dossiers courte permettent d’identifier la bonne version sans connaître la logique personnelle de son créateur.",
    ],
    steps: [
      "Demandez à l’équipe de noter pendant une semaine les dix informations ou documents qu’elle cherche le plus souvent.",
      "Pour chacun, décidez s’il s’agit d’un document à conserver, d’une donnée à suivre ou d’un échange à retrouver.",
      "Créez le tableau avec les sept informations : nom, type, emplacement, personne responsable, accès, date de révision et mots-clés.",
      "Construisez une structure de dossiers de trois niveaux maximum autour des clients, du travail courant et de l’administratif.",
      "Appliquez la même règle pour nommer dix documents tests et archivez les doublons uniquement après validation de la personne responsable.",
      "Demandez à une personne qui n’a pas créé le classement de retrouver cinq éléments ; corrigez chaque étape qui dépasse deux minutes.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec une liste sans informations confidentielles : « Classe ces éléments en trois types : document à conserver, donnée à suivre, ou échange à retrouver. Propose ensuite une structure de dossiers de trois niveaux maximum et une règle simple pour nommer les fichiers. Identifie les doublons probables, mais ne recommande aucune suppression automatique. »",
      "Validez la proposition avec les personnes qui produisent et utilisent les documents. ChatGPT peut préparer le classement et la recherche ; aucun déplacement, changement d’accès ou archivage ne doit être fait sans contrôle humain.",
    ],
    checklist: [
      "Les dix informations les plus recherchées apparaissent dans le tableau.",
      "Chaque élément indique où trouver la bonne version et qui en est responsable.",
      "La structure ne dépasse pas trois niveaux de dossiers avant d’atteindre un document utile.",
      "Les dix documents tests suivent la même règle de nom et d’accès.",
      "Une personne extérieure au classement retrouve cinq éléments en moins de deux minutes chacun.",
    ],
  }),
  defineOrganisationContent({
    slug: "automatiser-reporting-recurrent",
    title: "Comment automatiser ses tâches administratives sans multiplier les erreurs ?",
    summary:
      "Stabilisez une tâche administrative récurrente, testez son résultat puis automatisez uniquement les étapes fiables.",
    category: "Administration & facturation",
    tags: ["reporting", "administration", "automatisation", "données", "tableau de bord"],
    friction: [
      "Prenons comme exemple un rapport hebdomadaire : les mêmes chiffres sont extraits, copiés, remis en forme, contrôlés puis envoyés. La procédure reste dans la tête de la personne qui la réalise et la vérification recommence chaque semaine.",
      "La méthode s’applique ensuite à une relance, une préparation de documents ou toute autre tâche répétitive dont l’entrée et le résultat attendu sont observables.",
    ],
    result: [
      "Une fiche d’exécution décrit l’origine des informations, le responsable, le moment où la tâche commence, les étapes, les contrôles, le résultat attendu, le destinataire et la trace à conserver.",
      "Avec les mêmes données, les calculs doivent toujours donner le même résultat. L’automatisation prépare le travail et signale les écarts ; une personne valide les cas particuliers avant diffusion.",
    ],
    steps: [
      "Chronométrez une exécution réelle et notez chaque entrée, manipulation, contrôle, sortie et destinataire.",
      "Supprimez les étapes qui ne changent ni le résultat ni le niveau de contrôle attendu.",
      "Créez la fiche d’exécution avec les huit informations : origine, responsable, moment où la tâche commence, étapes, contrôles, résultat, destinataire et trace.",
      "Réalisez deux cycles manuels avec la même fiche et comparez les valeurs obtenues aux sources.",
      "Automatisez une première étape stable, puis provoquez volontairement une donnée manquante pour vérifier que l’erreur reste visible.",
      "Mesurez le temps du nouveau cycle et gardez une validation humaine sur les écarts, les montants ou les destinataires sensibles.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec un exemple sans informations confidentielles : « Transforme cette description de tâche récurrente en procédure. Présente : ce qui lance la tâche, informations de départ, étapes, contrôles, résultat attendu, destinataire et erreurs possibles. Distingue ce qui peut être automatisé de ce qui exige une validation humaine. N’invente aucune règle de calcul. »",
      "Utilisez ensuite ChatGPT pour produire un brouillon de synthèse à partir de données structurées. Comparez les chiffres aux sources et vérifiez le destinataire avant chaque envoi automatisé.",
    ],
    checklist: [
      "La fiche d’exécution permet à une autre personne de réaliser la tâche.",
      "Deux cycles manuels produisent le même résultat à partir des mêmes données.",
      "Chaque calcul et chaque source peuvent être contrôlés séparément.",
      "Une donnée manquante déclenche une erreur visible au lieu d’un résultat silencieusement faux.",
      "Le temps avant et après est mesuré et les cas particuliers restent validés par une personne.",
    ],
  }),
  defineOrganisationContent({
    slug: "organiser-relances-equipe",
    title: "Comment organiser les relances sans courir après son équipe ?",
    summary:
      "Mettez en place un suivi des engagements qui rappelle la bonne personne au bon moment et réserve les interventions du dirigeant aux vrais blocages.",
    category: "Planning & opérations",
    tags: ["relances", "équipe", "échéances", "suivi", "organisation"],
    friction: [
      "Une décision est prise, une tâche est confiée, puis le dirigeant doit demander plusieurs fois où elle en est. Les rappels partent par message, oralement ou pendant une réunion et personne ne conserve une vision complète.",
      "Le problème n’est pas un manque de bonne volonté. L’engagement, sa date et la règle de relance ne sont simplement pas visibles au même endroit.",
    ],
    result: [
      "Un tableau de suivi des relances contient sept informations : engagement, dossier, responsable, échéance, statut, dernière relance et prochaine relance.",
      "La règle est connue : rappel avant l’échéance pour préparer, le jour prévu pour confirmer, puis intervention du dirigeant uniquement lorsque le retard bloque un client, une équipe ou un paiement.",
    ],
    steps: [
      "Rassemblez 15 engagements qui ont nécessité une relance au cours des deux dernières semaines.",
      "Créez le tableau avec les sept informations : engagement, dossier, responsable, échéance, statut, dernière relance et prochaine relance.",
      "Définissez trois statuts simples : à faire, en attente et bloqué, puis précisez qui peut les modifier.",
      "Écrivez une règle de rappel avant l’échéance, une règle en cas de retard et un seul cas où prévenir le dirigeant.",
      "Testez le système pendant sept jours sur une équipe ou un type d’engagement sans changer les autres habitudes.",
      "Supprimez les rappels devenus inutiles et automatisez uniquement ceux dont le responsable et l’échéance sont fiables.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec vos engagements sans informations confidentielles : « Transforme cette liste en tableau de relance. Pour chaque élément, reprends uniquement l’action, le responsable et la date explicitement indiqués. Écris “à confirmer” lorsqu’une donnée manque. Propose un rappel avant l’échéance et signale les retards qui bloquent un client, une équipe ou un paiement. N’invente aucun engagement. »",
      "Validez les responsables et les dates avant d’activer un rappel. ChatGPT structure la liste et prépare les messages ; l’équipe confirme toujours la réalité de l’engagement.",
    ],
    checklist: [
      "Les 15 engagements tests apparaissent dans un tableau unique.",
      "Chaque engagement ouvert possède un responsable et une échéance confirmés.",
      "Les rappels ordinaires partent sans intervention du dirigeant.",
      "Le dirigeant est prévenu uniquement pour les retards qui bloquent réellement le travail.",
      "Après sept jours, aucun engagement test n’est suivi uniquement dans un message privé.",
    ],
  }),
  defineOrganisationContent({
    slug: "suivre-avancement-dossiers",
    title: "Comment suivre l’avancement de ses dossiers en un coup d’œil ?",
    summary:
      "Créez un tableau commun qui montre la phase, la prochaine action et les blocages de chaque dossier sans demander un compte rendu à toute l’équipe.",
    category: "Planning & opérations",
    tags: ["dossiers", "avancement", "statuts", "pilotage", "équipe"],
    friction: [
      "Les informations existent, mais elles sont réparties entre les échanges, les documents et le logiciel métier. Pour savoir où en est un dossier, le dirigeant doit ouvrir plusieurs outils ou interrompre la personne qui le suit.",
      "Un dossier peut sembler actif alors qu’il attend un document, une réponse client ou une validation depuis plusieurs jours.",
    ],
    result: [
      "Un tableau d’avancement contient huit informations : dossier, phase, responsable, prochaine action, échéance, blocage, dernière mise à jour et lien vers l’outil d’origine.",
      "Quatre phases suffisent pour démarrer : à lancer, en cours, en attente et terminé. Le tableau montre les cas particuliers ; le détail reste dans l’outil métier.",
    ],
    steps: [
      "Sélectionnez 15 dossiers représentatifs, dont au moins trois en retard ou en attente.",
      "Listez les quatre à six phases communes qui décrivent réellement leur progression.",
      "Créez le tableau avec les huit informations : dossier, phase, responsable, prochaine action, échéance, blocage, dernière mise à jour et lien vers l’outil d’origine.",
      "Complétez les 15 dossiers avec leur responsable plutôt que d’essayer de reconstruire seul leur historique.",
      "Ajoutez une liste des dossiers bloqués et une autre des échéances des sept prochains jours.",
      "Testez la mise à jour pendant une semaine et retirez tout champ qui ne déclenche aucune action.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec des points d’avancement sans informations confidentielles : « Regroupe ces dossiers par phase : à lancer, en cours, en attente ou terminé. Pour chacun, extrais le responsable, la prochaine action, l’échéance et le blocage explicitement mentionnés. Écris “à confirmer” si une information manque. Termine par la liste des dossiers qui nécessitent une décision cette semaine. »",
      "Faites confirmer la phase et la prochaine action par chaque responsable. ChatGPT prépare la synthèse ; le tableau commun ne devient fiable que lorsque l’équipe le met à jour au même endroit.",
    ],
    checklist: [
      "Les 15 dossiers tests possèdent une phase et un responsable confirmés.",
      "Chaque dossier actif affiche une prochaine action et une échéance.",
      "Les dossiers en attente indiquent précisément ce qui les bloque.",
      "Le dirigeant repère les décisions de la semaine sans solliciter toute l’équipe.",
      "Une modification faite dans l’outil d’origine apparaît correctement dans le tableau de suivi.",
    ],
  }),
  defineOrganisationContent({
    slug: "suivre-demandes-clients",
    title: "Comment suivre chaque demande client de la réception à la réponse ?",
    summary:
      "Construisez un suivi partagé pour qu’aucune demande client ne reste sans responsable, sans délai ou sans réponse facile à retrouver.",
    category: "Clients & ventes",
    tags: ["clients", "demandes", "réponse", "suivi", "service client"],
    friction: [
      "Les demandes arrivent par téléphone, e-mail, formulaire ou messagerie. Une personne pense qu’une autre a répondu, le client relance et l’équipe reconstitue l’historique dans l’urgence.",
      "Le tutoriel suit une demande depuis sa réception jusqu’à sa clôture, sans imposer une nouvelle façon de vous contacter aux clients.",
    ],
    result: [
      "Un tableau de suivi contient neuf informations : date, client, demande, moyen de réception, priorité, responsable, statut, délai de réponse et lien vers la réponse.",
      "Chaque demande passe par cinq statuts visibles : reçue, qualifiée, en traitement, en attente et clôturée.",
    ],
    steps: [
      "Rassemblez 20 demandes récentes reçues par vos différents moyens de contact, en retirant les données sensibles inutiles.",
      "Créez le tableau avec les neuf informations : date, client, demande, moyen de réception, priorité, responsable, statut, délai et lien vers la réponse.",
      "Définissez qui qualifie la demande, qui la traite et dans quels cas elle change de responsable.",
      "Écrivez un délai de première réponse pour chaque niveau de priorité, même lorsque la solution demande plus de temps.",
      "Testez cette façon de travailler pendant cinq jours sur un seul moyen de réception et suivez chaque demande jusqu’à sa clôture.",
      "Reliez ensuite les autres moyens de contact et automatisez la création des demandes seulement si les informations minimales sont présentes.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec des demandes sans informations confidentielles : « Classe ces demandes clients en cinq catégories maximum. Pour chacune, extrais le sujet, le moyen de réception, le niveau d’impact et la réponse déjà apportée. Propose une première action et un brouillon d’accusé de réception. N’invente aucune promesse, aucun délai ni aucune information client. Signale les demandes ambiguës. »",
      "L’équipe valide la priorité, le responsable et le message avant l’envoi. ChatGPT aide à qualifier et préparer ; il ne clôture jamais une demande sans preuve de la réponse apportée.",
    ],
    checklist: [
      "Les 20 demandes tests sont présentes une seule fois dans le tableau.",
      "Chaque demande ouverte possède un responsable et un délai de première réponse.",
      "Le client reçoit une confirmation même lorsque le traitement continue.",
      "Une demande clôturée conserve un lien vers la réponse apportée.",
      "Une demande reçue par un autre moyen rejoint correctement le même suivi.",
    ],
  }),
  defineOrganisationContent({
    slug: "creer-methode-travail-commune",
    title: "Comment mettre en place une méthode de travail commune ?",
    summary:
      "Transformez les différentes habitudes de l’équipe en une façon de travailler simple, testable et suffisamment souple pour les cas particuliers.",
    category: "Planning & opérations",
    tags: ["méthode", "processus", "équipe", "standardisation", "qualité"],
    friction: [
      "Pour un même travail, chacun utilise ses propres étapes, fichiers et contrôles. Le résultat dépend de la personne disponible et les écarts apparaissent surtout lorsqu’un client se plaint ou qu’un salarié est absent.",
      "Une méthode commune ne doit pas décrire chaque geste. Elle doit sécuriser les passages où une information, une décision ou un contrôle peut se perdre.",
    ],
    result: [
      "Une fiche d’une page précise sept éléments : ce qui lance le travail, informations nécessaires, étapes clés, responsable, contrôle, résultat attendu et traitement des cas particuliers.",
      "L’équipe partage un socle commun tout en conservant la liberté d’adapter les gestes qui ne modifient ni le résultat ni le niveau de qualité attendu.",
    ],
    steps: [
      "Choisissez un travail fréquent réalisé par au moins deux personnes et observez une exécution par chacune.",
      "Comparez les deux façons de faire et conservez uniquement les étapes qui changent le délai, la qualité ou la possibilité de suivre ce qui a été fait.",
      "Créez la fiche avec les sept éléments : ce qui lance le travail, informations nécessaires, étapes, responsable, contrôle, résultat et cas particuliers.",
      "Ajoutez un exemple réussi, un cas à éviter et le point exact où demander de l’aide.",
      "Faites exécuter la méthode par une troisième personne sans lui donner d’explication supplémentaire.",
      "Corrigez les ambiguïtés observées et attribuez à une personne la révision de la fiche lorsque le travail évolue.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec les deux descriptions sans informations confidentielles : « Compare ces deux façons de réaliser le même travail. Distingue les étapes communes, les différences qui influencent le résultat et les préférences personnelles. Propose une procédure d’une page avec : ce qui lance le travail, informations nécessaires, étapes clés, responsable, contrôle, résultat attendu et cas particuliers. Signale chaque hypothèse. »",
      "Demandez ensuite aux personnes qui réalisent le travail de corriger la procédure. ChatGPT rapproche les versions ; l’équipe décide de la méthode qui protège réellement la qualité.",
    ],
    checklist: [
      "La fiche tient sur une page et décrit un résultat observable.",
      "Les étapes communes ont été validées par au moins deux personnes qui réalisent le travail.",
      "Le contrôle et les cas où demander de l’aide sont clairement indiqués.",
      "Une troisième personne réussit l’exécution sans explication orale supplémentaire.",
      "Un responsable et une date de révision sont associés à la méthode.",
    ],
  }),
  defineOrganisationContent({
    slug: "organiser-entreprise-sans-dirigeant",
    title: "Comment organiser son entreprise pour qu’elle fonctionne aussi en son absence ?",
    summary:
      "Identifiez les activités qui dépendent encore du dirigeant et construisez les relais nécessaires pour maintenir le travail pendant son absence.",
    category: "Planning & opérations",
    tags: ["dirigeant", "absence", "continuité", "délégation", "organisation"],
    friction: [
      "Les clients, les validations et les imprévus remontent vers le dirigeant. Dès qu’il s’absente, certaines décisions attendent, les réponses ralentissent et l’équipe contourne les règles pour continuer à travailler.",
      "L’objectif n’est pas de rendre le dirigeant inutile. Il est d’éviter que les opérations courantes reposent sur sa disponibilité permanente.",
    ],
    result: [
      "Un tableau des relais contient huit informations : activité importante, fréquence, responsable, remplaçant, ce qui lance le travail, endroit où trouver l’information, contrôle et cas où prévenir le dirigeant.",
      "Les activités courantes possèdent un relais ; le dirigeant reste sollicité uniquement pour les décisions qui dépassent une limite écrite.",
    ],
    steps: [
      "Notez pendant une semaine chaque interruption du dirigeant et ce qui se serait passé sans sa réponse.",
      "Classez les situations entre information, travail courant, décision facile à corriger et décision réellement critique.",
      "Choisissez cinq activités fréquentes qui ralentissent immédiatement lorsque le dirigeant est absent.",
      "Complétez pour chacune les huit informations du tableau des relais et désignez un responsable ainsi qu’un remplaçant.",
      "Testez une demi-journée sans intervention du dirigeant, puis une journée complète lorsque les premiers blocages sont corrigés.",
      "Transformez chaque sollicitation imprévue en règle, en ressource ou en cas précis où prévenir le dirigeant avant le test suivant.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec votre liste sans informations confidentielles : « Classe ces sollicitations du dirigeant en quatre groupes : information, travail courant, décision facile à corriger ou décision critique. Pour chaque situation, indique les informations utilisées pour répondre, le risque d’une mauvaise décision et la règle qui manque. Ne propose aucune délégation pour les décisions juridiques, humaines ou financières sensibles sans validation. »",
      "Utilisez la synthèse pour préparer le tableau avec l’équipe. ChatGPT repère les demandes qui reviennent souvent ; le dirigeant valide les responsabilités, les limites et les situations qui doivent toujours lui remonter.",
    ],
    checklist: [
      "Cinq activités importantes possèdent un responsable et un remplaçant identifiés.",
      "Les informations nécessaires sont accessibles sans utiliser le compte personnel du dirigeant.",
      "Chaque cas où prévenir le dirigeant repose sur une limite ou un risque observable.",
      "Une journée test se déroule sans blocage dans le travail courant.",
      "Les nouvelles sollicitations servent à améliorer la carte plutôt qu’à reprendre tout le contrôle.",
    ],
  }),
  defineOrganisationContent({
    slug: "organiser-planning-equipe-imprevus",
    title: "Comment organiser le planning d’une équipe malgré les imprévus ?",
    summary:
      "Construisez un planning partagé qui rend visibles les contraintes, les priorités et les marges disponibles avant qu’un imprévu ne désorganise toute l’équipe.",
    category: "Planning & opérations",
    tags: ["planning", "équipe", "imprévus", "interventions", "priorités"],
    friction: [
      "Une absence, un retard de chantier ou une demande urgente oblige à refaire le planning. Les contraintes sont connues de plusieurs personnes, mais aucun tableau ne permet d’anticiper les conflits avant d’affecter le travail.",
      "Le planning devient une succession de corrections alors qu’il devrait montrer ce qui est fixe, ce qui est déplaçable et la marge disponible.",
    ],
    result: [
      "Chaque intervention ou tâche contient neuf informations : durée, priorité, compétence requise, lieu, personne affectée, créneau, contrainte, statut et marge de déplacement.",
      "Une règle de replanification indique quoi déplacer en premier et qui décide lorsqu’aucune solution ne respecte les engagements.",
    ],
    steps: [
      "Prenez une semaine réelle de planning et notez chaque modification ainsi que sa cause.",
      "Ajoutez aux éléments planifiés les neuf informations : durée, priorité, compétence, lieu, personne, créneau, contrainte, statut et marge.",
      "Distinguez les engagements fixes, les tâches déplaçables et les créneaux volontairement laissés disponibles.",
      "Écrivez l’ordre de replanification en cas d’absence, de retard ou de nouvelle urgence.",
      "Simulez trois imprévus passés et vérifiez que deux personnes arrivent à la même nouvelle répartition.",
      "Testez la règle pendant deux semaines et ajustez les marges à partir des changements réellement observés.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec un planning sans informations confidentielles : « Analyse ce planning et ces contraintes. Signale les conflits de personne, de compétence, de lieu ou de durée. En cas d’imprévu, propose trois scénarios qui respectent d’abord les engagements fixes, puis les priorités et enfin les temps de déplacement. Explique chaque compromis et n’ajoute aucun créneau indisponible. »",
      "La personne responsable du planning vérifie les durées, les déplacements et les engagements clients avant toute modification. ChatGPT propose des scénarios ; l’équipe choisit celui qui reste réalisable sur le terrain.",
    ],
    checklist: [
      "Chaque élément planifié possède une durée, un responsable et une contrainte visibles.",
      "Les engagements fixes et les tâches déplaçables sont distingués.",
      "Trois imprévus historiques peuvent être replanifiés avec la même règle.",
      "L’équipe sait qui tranche lorsque deux contraintes sont incompatibles.",
      "Après deux semaines, les marges prévues correspondent aux changements réellement rencontrés.",
    ],
  }),
  defineOrganisationContent({
    slug: "supprimer-doubles-saisies",
    title: "Comment supprimer les doubles saisies entre ses outils ?",
    summary:
      "Cartographiez une information de sa création à son utilisation, puis automatisez une seule transmission fiable sans masquer les erreurs.",
    category: "Outils & automatisation",
    tags: ["double saisie", "outils", "automatisation", "données", "erreurs"],
    friction: [
      "Une information client ou opérationnelle est saisie dans un formulaire, recopiée dans un tableur, puis ressaisie dans le logiciel métier. Chaque copie prend du temps et peut créer une différence difficile à détecter.",
      "Connecter tous les outils immédiatement aggrave souvent le problème. Il faut d’abord choisir où l’information naît et quel système en devient la référence.",
    ],
    result: [
      "Un tableau décrit sept éléments : information, endroit où se trouve la bonne version, destination, raison du transfert, responsable, fréquence et contrôle d’erreur.",
      "Un premier transfert automatique envoie uniquement les informations nécessaires, conserve une trace et s’arrête visiblement lorsqu’une donnée obligatoire manque.",
    ],
    steps: [
      "Choisissez une information ressaisie au moins dix fois par semaine et suivez son parcours complet.",
      "Listez chaque champ copié, son outil d’origine, sa destination et la raison réelle de cette recopie.",
      "Indiquez où se trouve la bonne version de chaque information et supprimez les copies qui ne servent ni au travail ni au contrôle.",
      "Créez la carte avec les sept éléments : information, source, destination, raison, responsable, fréquence et contrôle.",
      "Automatisez un seul transfert sur cinq exemples tests et provoquez une valeur manquante ou incorrecte.",
      "Comparez les cinq résultats aux informations d’origine, expliquez comment revenir en arrière et étendez le transfert uniquement après validation.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec votre liste d’informations sans données confidentielles : « Construis un tableau à partir de ces saisies. Pour chaque information, indique son origine probable, ses destinations, les doublons et les différences de format. Pose une question lorsque l’endroit où se trouve la bonne version n’est pas clair. Propose ensuite le plus petit transfert à tester et les contrôles nécessaires. »",
      "Confirmez l’endroit où se trouve la bonne version avec les personnes qui utilisent les informations. ChatGPT aide à repérer les doublons ; l’automatisation doit rester bloquée tant que les règles de format et d’erreur ne sont pas validées.",
    ],
    checklist: [
      "Une information fréquente a été suivie de sa création à sa dernière utilisation.",
      "Pour chaque information, l’endroit où se trouve la bonne version est clairement validé.",
      "Cinq exemples tests arrivent dans la bonne destination sans perte de données.",
      "Une valeur manquante déclenche une erreur visible et traçable.",
      "L’équipe sait désactiver le transfert automatique et reprendre manuellement en cas de problème.",
    ],
  }),
  defineOrganisationContent({
    slug: "documenter-savoir-faire-equipe",
    title: "Comment documenter les façons de travailler sans créer une usine à gaz ?",
    summary:
      "Capturez l’essentiel d’un savoir-faire au moment où le travail est réalisé et transformez-le en une ressource courte que l’équipe peut vraiment utiliser.",
    category: "Planning & opérations",
    tags: ["documentation", "savoir-faire", "équipe", "transmission", "processus"],
    friction: [
      "Les méthodes utiles restent dans la tête des personnes expérimentées. Lorsqu’elles sont absentes, les collègues cherchent, improvisent ou attendent leur retour, tandis que les documents existants deviennent rapidement trop longs ou obsolètes.",
      "Documenter ne signifie pas tout écrire. Il faut conserver les décisions, contrôles et cas particuliers qui permettent de reproduire un résultat fiable.",
    ],
    result: [
      "Une fiche courte contient huit éléments : objectif, ce qui lance la tâche, informations nécessaires, étapes clés, décisions, contrôle, résultat attendu et personne responsable.",
      "Elle est complétée par une démonstration ou un exemple lorsque le geste est plus facile à montrer qu’à décrire.",
    ],
    steps: [
      "Choisissez une tâche fréquente qu’une seule personne maîtrise correctement et enregistrez une exécution réelle avec son accord.",
      "Repérez dans la démonstration les décisions, les contrôles et les erreurs à éviter plutôt que de retranscrire chaque geste.",
      "Créez la fiche avec les huit éléments : objectif, ce qui lance la tâche, informations nécessaires, étapes, décisions, contrôle, résultat et personne responsable.",
      "Ajoutez les liens vers l’exemple, le modèle ou la courte démonstration depuis la fiche de référence.",
      "Faites réaliser la tâche par une autre personne en observant uniquement les moments où la ressource ne suffit pas.",
      "Corrigez ces points et prévoyez une révision lorsque l’outil, la règle ou le résultat attendu change.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec la transcription sans informations confidentielles : « Transforme cette démonstration en fiche de travail courte. Conserve uniquement : objectif, ce qui lance la tâche, informations nécessaires, étapes clés, décisions, contrôles, résultat attendu et erreurs à éviter. Signale les informations manquantes et n’invente aucune règle métier. »",
      "Faites corriger la fiche par la personne qui maîtrise le travail, puis testez-la avec quelqu’un d’autre. ChatGPT produit un premier brouillon ; l’exécution réelle révèle ce qui mérite d’être conservé.",
    ],
    checklist: [
      "La fiche décrit un résultat précis et reste assez courte pour être consultée pendant le travail.",
      "Les décisions, contrôles et erreurs importantes sont visibles.",
      "Les exemples et démonstrations sont accessibles depuis un seul lien de référence.",
      "Une autre personne réalise la tâche sans dépendre d’une explication orale complète.",
      "Une personne responsable et le moment où revoir la fiche sont indiqués.",
    ],
  }),
  defineOrganisationContent({
    slug: "construire-tableau-de-bord-utile",
    title: "Comment construire un tableau de bord réellement utile ?",
    summary:
      "Partez des décisions à prendre pour suivre quelques indicateurs fiables et repérer les écarts avant qu’ils ne deviennent des problèmes.",
    category: "Gestion & conformité",
    tags: ["tableau de bord", "indicateurs", "pilotage", "alertes", "décisions"],
    friction: [
      "Les chiffres existent dans plusieurs fichiers, mais ils arrivent trop tard ou ne déclenchent aucune décision. Le dirigeant découvre un retard, une baisse de marge ou une surcharge lorsque le problème est déjà installé.",
      "Un tableau de bord utile ne montre pas tout. Il répond chaque semaine à quelques questions précises et indique qui agit lorsqu’un seuil est dépassé.",
    ],
    result: [
      "Une fiche définit pour cinq indicateurs maximum : question de gestion, calcul, origine du chiffre, fréquence, objectif, seuil d’alerte, responsable et action attendue.",
      "Le tableau montre la tendance et les cas particuliers ; chaque alerte renvoie vers une action, pas seulement vers une couleur.",
    ],
    steps: [
      "Listez les cinq décisions que vous prenez le plus souvent trop tard ou avec une information incomplète.",
      "Pour chaque décision, formulez une question à laquelle un chiffre ou un statut peut réellement répondre.",
      "Définissez le calcul, la source, la fréquence, l’objectif, le seuil, le responsable et l’action attendue.",
      "Construisez un premier tableau avec cinq indicateurs maximum et des données déjà contrôlables.",
      "Rejouez trois situations passées pour vérifier si le tableau aurait révélé le problème assez tôt.",
      "Utilisez le tableau pendant quatre semaines et retirez tout indicateur qui ne provoque ni question ni action.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec des décisions et des données sans informations confidentielles : « Pour chacune de ces décisions, propose la question de gestion correspondante et l’indicateur minimal pour y répondre. Indique le calcul, l’origine du chiffre, la fréquence, le seuil d’alerte et l’action possible. Refuse les indicateurs dont l’origine ou la décision ne sont pas clairement indiquées. »",
      "Validez chaque définition avec la personne qui produit la donnée. ChatGPT peut expliquer une tendance ou préparer une synthèse ; les chiffres, les calculs et les seuils restent contrôlés séparément.",
    ],
    checklist: [
      "Chaque indicateur répond à une décision nommée.",
      "Le calcul, la source et la fréquence sont documentés et vérifiables.",
      "Chaque seuil d’alerte possède un responsable et une action attendue.",
      "Trois situations passées sont détectées suffisamment tôt par le nouveau tableau.",
      "Après quatre semaines, les indicateurs sans usage réel sont supprimés.",
    ],
  }),
  defineOrganisationContent({
    slug: "structurer-integration-salarie",
    title: "Comment structurer l’arrivée d’un salarié pour le rendre autonome plus vite ?",
    summary:
      "Construisez un parcours d’intégration qui transmet les bons repères, fait pratiquer le travail réel et rend les progrès observables.",
    category: "Planning & opérations",
    tags: ["intégration", "salarié", "formation", "autonomie", "équipe"],
    friction: [
      "Le nouveau salarié reçoit beaucoup d’informations les premiers jours, mais ne sait pas toujours ce qu’il doit maîtriser en premier. Les explications se répètent et sa progression dépend de la disponibilité d’un collègue expérimenté.",
      "L’intégration doit conduire à des situations de travail réussies, pas seulement à une liste de documents consultés.",
    ],
    result: [
      "Un parcours répartit les apprentissages entre le premier jour, la première semaine et le premier mois. Chaque étape contient un objectif, une tâche réelle, une ressource, une personne à solliciter, un résultat concret à vérifier et un point de contrôle.",
      "Le salarié et son responsable voient ce qui est acquis, ce qui doit être pratiqué et les questions encore ouvertes.",
    ],
    steps: [
      "Listez les cinq situations que le salarié doit savoir gérer seul à la fin de son premier mois.",
      "Décomposez chacune en connaissances nécessaires, démonstration, exercice réel et critère de réussite.",
      "Répartissez les étapes entre le premier jour, la première semaine et le premier mois sans tout transmettre immédiatement.",
      "Associez à chaque étape une ressource utile et une personne disponible pour répondre aux questions.",
      "Demandez un résultat concret à vérifier : tâche terminée, simulation réussie, contrôle validé ou explication reformulée.",
      "Organisez des points courts aux moments prévus et améliorez le parcours à partir des questions réellement posées.",
    ],
    withChatGpt: [
      "Copiez ce prompt avec la fiche de poste et des tâches sans informations confidentielles : « Construis un parcours d’intégration sur un mois. Pars de cinq situations que la personne devra gérer seule. Pour chacune, propose une démonstration, un exercice réel, une ressource, un critère de réussite et le moment adapté : premier jour, première semaine ou premier mois. Signale les compétences qui nécessitent un accompagnement humain. »",
      "Le responsable vérifie que les exercices reflètent le vrai poste et que les accès respectent les droits nécessaires. ChatGPT structure le parcours ; l’équipe évalue l’autonomie dans le travail réel.",
    ],
    checklist: [
      "Cinq situations de travail à maîtriser sont clairement définies.",
      "Chaque étape associe une ressource, un exercice et un critère de réussite.",
      "Les apprentissages sont répartis entre le premier jour, la première semaine et le premier mois.",
      "Le salarié sait qui solliciter sans dépendre d’une seule personne.",
      "Le responsable peut constater les acquis à partir de preuves observables.",
    ],
  }),
  {
    slug: "facturation-electronique",
    title: "Facturation électronique : l’essentiel pour être prêt en 2026–2027",
    shortTitle: "Facturation électronique : l’essentiel",
    summary:
      "Le calendrier 2026-2027, la différence entre e-invoicing et e-reporting, et les vérifications à mener sur vos outils, votre plateforme et vos données.",
    category: "Gestion & conformité",
    surfaces: ["contenus"],
    tags: [
      "facturation électronique",
      "e-invoicing",
      "e-reporting",
      "plateforme agréée",
      "TVA",
      "gestion",
    ],
    status: "published",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-09",
    verifiedAt: "2026-08-09",
    relatedSystemSlugs: [],
    academyFundamentalSlugs: [],
    media: {
      slides: FACTURATION_ELECTRONIQUE_SLIDES,
    },
    keyPoints: [
      "Toutes les entreprises concernées doivent pouvoir recevoir des factures électroniques à partir du 1er septembre 2026.",
      "Les PME et micro-entreprises devront émettre leurs factures électroniques et transmettre leurs données de e-reporting à partir du 1er septembre 2027.",
      "Un PDF ordinaire envoyé par e-mail ne répond pas, à lui seul, au nouveau circuit réglementaire.",
      "La première action consiste à vérifier la compatibilité de vos outils et le choix de votre plateforme agréée.",
    ],
    article: [
      {
        heading: "Ce que la réforme change réellement",
        paragraphs: [
          "La réforme ne consiste pas seulement à remplacer le papier par un fichier PDF. Elle modifie le circuit de transmission des factures et de certaines données à l’administration. Les entreprises concernées devront passer par une plateforme agréée, directement ou par l’intermédiaire d’une solution compatible.",
          "Une facture électronique est un document structuré, transmis dans un format normé. Un PDF ordinaire envoyé par e-mail ne suffira donc plus pour les opérations soumises à l’obligation de facturation électronique.",
        ],
      },
      {
        heading: "Pourquoi ce nouveau fonctionnement",
        paragraphs: [
          "Le dispositif vise à standardiser les échanges, faciliter le suivi des statuts de facture, réduire les ressaisies et mieux détecter les incohérences de TVA. Pour une entreprise, l’enjeu concret est surtout de disposer d’un circuit plus traçable, avec des données clients et fournisseurs suffisamment fiables.",
        ],
      },
      {
        heading: "Les deux échéances à retenir",
        items: [
          "1er septembre 2026 : toutes les entreprises concernées doivent être capables de recevoir des factures électroniques. Les grandes entreprises et les entreprises de taille intermédiaire doivent aussi les émettre et transmettre leur e-reporting.",
          "1er septembre 2027 : les PME et micro-entreprises doivent à leur tour émettre leurs factures électroniques et transmettre les données de e-reporting attendues.",
        ],
      },
      {
        heading: "E-invoicing et e-reporting : deux mécanismes différents",
        paragraphs: [
          "L’e-invoicing concerne principalement les factures entre entreprises établies en France et assujetties à la TVA, lorsque l’opération entre dans le champ de la réforme. La facture circule alors entre plateformes agréées.",
          "L’e-reporting correspond à la transmission de données de transaction ou de paiement pour les opérations qui ne passent pas par ce circuit, notamment certaines ventes à des particuliers ou à des clients établis à l’étranger. La facture peut continuer à être adressée au client par le canal habituel, tandis que les données requises sont transmises à l’administration.",
        ],
      },
      {
        heading: "Le nouveau flux au quotidien",
        items: [
          "Vous créez la facture dans votre logiciel ou directement sur une plateforme agréée.",
          "La facture est contrôlée et transmise à la plateforme du client lorsqu’elle relève de l’e-invoicing.",
          "Les données prévues par la réforme sont transmises à l’administration.",
          "Vous suivez les statuts de la facture dans votre outil ou sur la plateforme : dépôt, réception, traitement et paiement selon les informations disponibles.",
          "Vous centralisez également la réception des factures fournisseurs sur la plateforme choisie.",
        ],
      },
      {
        heading: "Vérifier vos outils et votre plateforme",
        paragraphs: [
          "Commencez par demander à votre éditeur de logiciel de facturation, de caisse ou de comptabilité comment il se connectera à une plateforme agréée. Vérifiez ensuite qui crée les factures, qui contrôle les données, qui suit les rejets et qui traite les factures fournisseurs.",
          "Une solution dite compatible peut conserver son rôle dans votre organisation, mais seule une plateforme agréée peut assurer les transmissions réglementaires prévues par la réforme. La liste officielle des plateformes est publiée et mise à jour par l’administration fiscale.",
        ],
      },
      {
        heading: "Fiabiliser les données avant la bascule",
        paragraphs: [
          "Le passage à la facturation électronique rend les erreurs de données plus visibles. Profitez de la préparation pour vérifier les identifiants de vos clients, leurs adresses de facturation, la nature des opérations, les règles de TVA appliquées et les coordonnées utilisées pour acheminer les factures.",
        ],
      },
      {
        heading: "La checklist à lancer maintenant",
        items: [
          "Lister les outils utilisés pour émettre, recevoir et comptabiliser les factures.",
          "Demander à chaque éditeur comment il gère la réforme et avec quelles plateformes agréées il fonctionne.",
          "Choisir la plateforme qui recevra les factures de l’entreprise.",
          "Nettoyer les données clients et fournisseurs essentielles.",
          "Définir le rôle de chaque personne en cas de rejet, d’écart ou de facture en attente.",
          "Tester le circuit complet avant votre échéance d’émission.",
        ],
      },
    ],
    sources: [
      {
      label: "Facturation électronique et plateformes agréées - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
      },
      {
      label: "Tout savoir sur la facturation électronique pour les entreprises - economie.gouv.fr",
        href: "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises",
      },
      {
      label: "À partir de quand suis-je concerné ? - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation",
      },
      {
      label: "FAQ facturation électronique - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/foire-aux-questions-japprofondis-la-facturation-electronique",
      },
    ],
  },
] as const satisfies readonly ContentCatalogEntry[];

export function getContentFormat(entry: ContentCatalogEntry) {
  if (entry.media.youtubeId) return "Vidéo" as const;
  if (entry.media.slides?.length) return "Diaporama" as const;
  return "Article" as const;
}

export function getAllPublishedContent(): ContentCatalogEntry[] {
  return contentCatalog
    .filter((entry) => entry.status === "published")
    .map((entry) => ({ ...entry }))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getPublishedOrganisationContent(): ContentCatalogEntry[] {
  return getAllPublishedContent().filter((entry) =>
    entry.surfaces.includes("organisation"),
  );
}

export const ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM = 6;

export function isOrganisationTransverseLibraryReady(
  publishedContentCount = getPublishedOrganisationContent().length,
) {
  return publishedContentCount >= ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM;
}

export function getPublishedContentBySlug(slug: string) {
  return getAllPublishedContent().find((entry) => entry.slug === slug) ?? null;
}
