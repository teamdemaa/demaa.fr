import {
  enterpriseCatalog,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import { sectorPageDefinitions } from "@/lib/sector-pages";
import type { System } from "@/lib/types";

export type NewsletterDirectoryEntry = {
  slug: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  kind: "sector" | "specific";
  parentSlug?: string;
  sectorLabel: string;
  sectorSlug: string;
  frequency: string;
  tags: string[];
  systemSlugs: string[];
  featuredArticleSlug?: string;
};

export type NewsletterArticleEntry = {
  slug: string;
  newsletterSlug: string;
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  content: string;
  date: string;
  tags: string[];
  status: "a_valider" | "publie";
};

const sectorNewsletters: NewsletterDirectoryEntry[] = sectorPageDefinitions.map((sector) => ({
  slug: sector.slug,
  title: `Newsletter ${sector.label}`,
  description: `Chaque mois, l'essentiel à suivre pour ${sector.label.toLowerCase()} : tendances, signaux terrain, outils utiles et points de vigilance concrets.`,
  seoTitle: `Newsletter ${sector.label} : actualités, outils et pilotage | Demaa`,
  seoDescription: `Retrouvez les éditions de la newsletter ${sector.label} : contenus pratiques, veille métier et sujets utiles pour mieux piloter l'activité.`,
  kind: "sector",
  sectorLabel: sector.label,
  sectorSlug: sector.slug,
  frequency: "1 fois par mois",
  tags: [sector.label, "newsletter", "veille", "pilotage"],
  systemSlugs: enterpriseCatalog
    .filter((enterprise) => enterprise.sectorLabel === sector.label)
    .map((enterprise) => enterprise.slug),
  featuredArticleSlug:
    sector.slug === "conseil-services-entreprises"
      ? "garder-le-suivi-commercial-propre-sans-y-passer-la-semaine"
      : sector.slug === "restauration"
        ? "proteger-la-marge-quand-les-achats-bougent-toutes-les-semaines"
        : sector.slug === "btp-services-techniques"
          ? "mieux-suivre-devis-chantiers-et-marge-sans-multiplier-les-tableaux"
          : undefined,
}));

const specificNewsletters: NewsletterDirectoryEntry[] = [
  {
    slug: "cabinet-comptable",
    title: "Newsletter Cabinet comptable",
    description:
      "Une édition dédiée aux cabinets comptables, avec veille fiscale, comptable, réglementaire et points d'organisation utiles au pilotage du cabinet.",
    seoTitle: "Newsletter cabinet comptable : veille fiscale, comptable et pilotage | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Cabinet comptable : évolutions fiscales, conformité, outils et organisation du cabinet.",
    kind: "specific",
    parentSlug: "conseil-services-entreprises",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "1 fois par mois",
    tags: ["cabinet comptable", "fiscal", "conformité", "pilotage cabinet"],
    systemSlugs: ["cabinet-comptable"],
    featuredArticleSlug: "tenir-les-echeances-et-la-conformite-sans-piloter-en-reactif",
  },
  {
    slug: "restaurant",
    title: "Newsletter Restaurant",
    description:
      "Une édition dédiée aux restaurants, avec veille marge, achats, service, équipe et exécution opérationnelle au quotidien.",
    seoTitle: "Newsletter restaurant : marge, service et pilotage opérationnel | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Restaurant : marge, achats, équipe, service et organisation concrète du quotidien.",
    kind: "specific",
    parentSlug: "restauration",
    sectorLabel: "Restauration",
    sectorSlug: "restauration",
    frequency: "1 fois par mois",
    tags: ["restaurant", "marge", "service", "équipe"],
    systemSlugs: ["restaurant"],
    featuredArticleSlug: "tenir-le-service-et-la-marge-quand-les-semaines-sont-inegales",
  },
  {
    slug: "agence-immobiliere",
    title: "Newsletter Agence immobilière",
    description:
      "Une édition dédiée aux agences immobilières, avec veille sur mandats, relances, visites, coordination et lecture du pipeline.",
    seoTitle: "Newsletter agence immobilière : mandats, relances et pilotage | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Agence immobilière : suivi des mandats, relances, visites et organisation commerciale.",
    kind: "specific",
    parentSlug: "immobilier",
    sectorLabel: "Immobilier",
    sectorSlug: "immobilier",
    frequency: "1 fois par mois",
    tags: ["agence immobilière", "mandats", "relances", "visites"],
    systemSlugs: ["agence-immobiliere"],
    featuredArticleSlug: "garder-les-mandats-et-les-relances-vraiment-actifs",
  },
  {
    slug: "organisme-de-formation",
    title: "Newsletter Organisme de formation",
    description:
      "Une édition dédiée aux organismes de formation, avec veille sessions, financement, conformité et suivi apprenants.",
    seoTitle: "Newsletter organisme de formation : sessions, financement et conformité | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Organisme de formation : sessions, financement, conformité et organisation pédagogique.",
    kind: "specific",
    parentSlug: "education-formation",
    sectorLabel: "Éducation & formation",
    sectorSlug: "education-formation",
    frequency: "1 fois par mois",
    tags: ["organisme de formation", "sessions", "qualité", "financement"],
    systemSlugs: ["organisme-de-formation"],
    featuredArticleSlug: "tenir-les-sessions-et-les-pieces-sans-faire-reposer-le-systeme-sur-la-memoire",
  },
  {
    slug: "cabinet-medical",
    title: "Newsletter Cabinet médical",
    description:
      "Une édition dédiée aux cabinets médicaux, avec veille agenda, suivi patient, coordination administrative et qualité d'exécution.",
    seoTitle: "Newsletter cabinet médical : agenda, suivi patient et organisation | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Cabinet médical : agenda, suivi patient, coordination administrative et pilotage du cabinet.",
    kind: "specific",
    parentSlug: "sante-bien-etre-esthetique",
    sectorLabel: "Santé, bien-être & esthétique",
    sectorSlug: "sante-bien-etre-esthetique",
    frequency: "1 fois par mois",
    tags: ["cabinet médical", "agenda", "patients", "coordination"],
    systemSlugs: ["cabinet-medical"],
    featuredArticleSlug: "tenir-lagenda-et-le-suivi-patient-sans-fragiliser-la-journee",
  },
  {
    slug: "e-commerce",
    title: "Newsletter E-commerce",
    description:
      "Une édition dédiée à l'e-commerce, avec veille conversion, commandes, stock, SAV et organisation de l'exploitation.",
    seoTitle: "Newsletter e-commerce : conversion, commandes et exploitation | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter E-commerce : conversion, commandes, stock, SAV et pilotage opérationnel.",
    kind: "specific",
    parentSlug: "commerce-retail",
    sectorLabel: "Commerce & retail",
    sectorSlug: "commerce-retail",
    frequency: "1 fois par mois",
    tags: ["e-commerce", "conversion", "commandes", "sav"],
    systemSlugs: ["e-commerce"],
    featuredArticleSlug: "mieux-lire-conversion-commandes-et-sav-sans-subir-les-a-coups",
  },
  {
    slug: "gestion-locative",
    title: "Newsletter Gestion locative",
    description:
      "Une édition dédiée à la gestion locative, avec veille loyers, incidents, coordination locataire-propriétaire et pilotage quotidien.",
    seoTitle: "Newsletter gestion locative : loyers, incidents et pilotage | Demaa",
    seoDescription:
      "Retrouvez les éditions de la newsletter Gestion locative : loyers, incidents, coordination et organisation du portefeuille.",
    kind: "specific",
    parentSlug: "immobilier",
    sectorLabel: "Immobilier",
    sectorSlug: "immobilier",
    frequency: "1 fois par mois",
    tags: ["gestion locative", "loyers", "incidents", "coordination"],
    systemSlugs: ["gestion-locative"],
    featuredArticleSlug: "garder-les-loyers-les-incidents-et-les-relances-sous-controle",
  },
];

const newsletters: NewsletterDirectoryEntry[] = [...specificNewsletters, ...sectorNewsletters];

const articles: NewsletterArticleEntry[] = [
  {
    slug: "tenir-les-echeances-et-la-conformite-sans-piloter-en-reactif",
    newsletterSlug: "cabinet-comptable",
    title: "Tenir les échéances et la conformité sans piloter en réactif",
    seoTitle: "Cabinet comptable : tenir les échéances et la conformité sans piloter en réactif",
    description:
      "Quand tout repose sur les échéances, les pièces et les relances, le vrai enjeu est de ne pas laisser le cabinet fonctionner uniquement au rattrapage.",
    seoDescription:
      "Comment mieux structurer échéances, conformité, pièces manquantes et relances dans un cabinet comptable sans tout piloter dans l'urgence.",
    date: "2026-06-23",
    tags: ["cabinet comptable", "échéances", "conformité", "relances"],
    status: "publie",
    content: `
## Le point du mois

Dans un cabinet comptable, le sujet n'est pas seulement la charge.

Le sujet, c'est la combinaison entre :

- échéances fixes ;
- pièces manquantes ;
- demandes client dispersées ;
- contrôle qualité ;
- pression de conformité.

Quand tout se mélange, le cabinet glisse vite vers un pilotage en réaction.

## Ce qu'il faut rendre visible

Pour garder le contrôle, il faut surtout voir clairement :

1. les échéances qui approchent ;
2. les dossiers incomplets ;
3. les clients qui bloquent l'avancement ;
4. les points de contrôle qui ne doivent pas être sautés.

## Les signaux à surveiller

- pièces toujours demandées au dernier moment ;
- charge concentrée sur quelques personnes-clés ;
- relances client non tracées ;
- écarts entre l'état théorique d'un dossier et sa réalité.

## Ce qu'on recommande

- une lecture unique des échéances et dossiers incomplets ;
- une routine de relance visible ;
- une distinction nette entre collecte, production et contrôle ;
- un point court d'anticipation avant les périodes de tension.

## À faire avant la fin du mois

1. repérer les dossiers les plus fragiles ;
2. lister les pièces qui bloquent le plus souvent ;
3. clarifier qui relance, qui produit et qui contrôle ;
4. préparer la prochaine vague d'échéances avant qu'elle n'arrive.

## En une phrase

Un cabinet comptable tient mieux la charge quand il pilote les écarts assez tôt, au lieu d'attendre que l'urgence les impose.
    `.trim(),
  },
  {
    slug: "tenir-le-service-et-la-marge-quand-les-semaines-sont-inegales",
    newsletterSlug: "restaurant",
    title: "Tenir le service et la marge quand les semaines sont inégales",
    seoTitle: "Restaurant : tenir le service et la marge quand les semaines sont inégales",
    description:
      "Quand le rythme varie fortement d'un jour à l'autre, le vrai enjeu est de garder une lecture commune du service, des achats et de la rentabilité.",
    seoDescription:
      "Comment mieux piloter service, achats et marge dans un restaurant quand l'activité est irrégulière et que l'équipe doit rester fluide.",
    date: "2026-06-23",
    tags: ["restaurant", "service", "marge", "achats"],
    status: "publie",
    content: `
## Le point du mois

Dans un restaurant, tout peut sembler tenir... jusqu'à ce que plusieurs petites tensions se superposent :

- un service plus chargé que prévu ;
- des achats mal recalés ;
- une équipe qui compense ;
- une marge qui se dégrade sans signal assez tôt.

## Ce qu'il faut rendre visible

Pour éviter un pilotage uniquement à l'intuition, il faut surtout voir :

1. les jours où la charge explose ;
2. les produits qui pèsent le plus sur la marge ;
3. les points de friction récurrents au service ;
4. les écarts entre organisation prévue et réalité.

## Ce qu'on recommande

- relire la semaine avec un angle marge + service ;
- isoler les moments où l'exécution se dégrade ;
- suivre quelques lignes d'achats vraiment sensibles ;
- ajuster équipe, prep ou offre avant que l'usure s'installe.

## En une phrase

Un restaurant tient mieux sa rentabilité quand la lecture du service et de la marge devient un réflexe commun, pas un constat tardif.
    `.trim(),
  },
  {
    slug: "garder-les-mandats-et-les-relances-vraiment-actifs",
    newsletterSlug: "agence-immobiliere",
    title: "Garder les mandats et les relances vraiment actifs",
    seoTitle: "Agence immobilière : garder les mandats et les relances vraiment actifs",
    description:
      "Quand les dossiers s'accumulent, le vrai enjeu est de savoir lesquels avancent vraiment et lesquels restent ouverts sans dynamique claire.",
    seoDescription:
      "Comment mieux piloter mandats, relances et visites dans une agence immobilière sans laisser le pipeline se figer.",
    date: "2026-06-23",
    tags: ["agence immobilière", "mandats", "relances", "visites"],
    status: "publie",
    content: `
## Le point du mois

Dans une agence immobilière, le volume de dossiers peut donner une illusion d'activité.

Mais ce qui compte vraiment, c'est de savoir :

- quels mandats avancent ;
- quelles relances doivent partir ;
- quelles visites produisent une suite utile ;
- quels biens restent bloqués trop longtemps.

## Les signaux à surveiller

- beaucoup de contacts sans prochaine action claire ;
- des mandats présents mais peu animés ;
- des visites non suivies rapidement ;
- des dossiers qui vieillissent sans arbitrage.

## Ce qu'on recommande

- une prochaine action obligatoire par bien actif ;
- une revue courte des relances importantes ;
- une lecture distincte entre stock, mouvement et blocage ;
- un nettoyage régulier des dossiers immobiles.

## En une phrase

Une agence respire mieux quand elle distingue clairement les biens vivants des biens simplement stockés dans le pipeline.
    `.trim(),
  },
  {
    slug: "tenir-les-sessions-et-les-pieces-sans-faire-reposer-le-systeme-sur-la-memoire",
    newsletterSlug: "organisme-de-formation",
    title: "Tenir les sessions et les pièces sans faire reposer le système sur la mémoire",
    seoTitle: "Organisme de formation : tenir les sessions et les pièces sans reposer sur la mémoire",
    description:
      "Quand sessions, pièces et suivis vivent séparément, le vrai enjeu est de fiabiliser le passage entre commercial, administratif et pédagogique.",
    seoDescription:
      "Comment mieux piloter sessions, pièces, financement et suivi apprenants dans un organisme de formation sans surcharge inutile.",
    date: "2026-06-23",
    tags: ["organisme de formation", "sessions", "pièces", "suivi"],
    status: "publie",
    content: `
## Le point du mois

Dans un organisme de formation, le problème n'est pas seulement d'avoir plus ou moins de sessions.

Le problème apparaît quand :

- les pièces arrivent tard ;
- le financement n'est pas totalement sécurisé ;
- l'information change entre commercial, administratif et pédagogique ;
- les suivis reposent sur la mémoire de quelques personnes.

## Ce qu'il faut sécuriser

1. les prérequis avant démarrage ;
2. les pièces vraiment bloquantes ;
3. les informations à transmettre d'un pôle à l'autre ;
4. les points qui dégradent l'expérience apprenant.

## Ce qu'on recommande

- une checklist commune avant lancement ;
- une vue claire des sessions à risque ;
- une séparation nette entre suivi administratif et suivi pédagogique ;
- une revue courte des blocages avant chaque démarrage.

## En une phrase

Un organisme de formation devient plus fiable quand il fait circuler la bonne information au bon moment, au lieu de la laisser vivre par habitude.
    `.trim(),
  },
  {
    slug: "tenir-lagenda-et-le-suivi-patient-sans-fragiliser-la-journee",
    newsletterSlug: "cabinet-medical",
    title: "Tenir l'agenda et le suivi patient sans fragiliser la journée",
    seoTitle: "Cabinet médical : tenir l'agenda et le suivi patient sans fragiliser la journée",
    description:
      "Quand rendez-vous, retards, administratif et suivi patient se croisent, le vrai enjeu est de protéger le rythme sans perdre la qualité.",
    seoDescription:
      "Comment mieux piloter agenda, coordination et suivi patient dans un cabinet médical sans dégrader la journée de l'équipe.",
    date: "2026-06-23",
    tags: ["cabinet médical", "agenda", "patients", "organisation"],
    status: "publie",
    content: `
## Le point du mois

Dans un cabinet médical, la journée se fragilise vite quand plusieurs petites tensions se superposent :

- rendez-vous qui glissent ;
- administratif qui déborde ;
- retours patient à traiter ;
- informations qui circulent mal.

## Ce qu'il faut protéger

1. les créneaux les plus sensibles ;
2. la continuité entre accueil, soin et suivi ;
3. les temps où l'équipe bascule en rattrapage ;
4. les points administratifs qui génèrent le plus de friction.

## Ce qu'on recommande

- rendre visibles les moments de saturation ;
- distinguer ce qui relève du soin, du suivi et de l'administratif ;
- simplifier les relances vraiment nécessaires ;
- revoir les points qui dérèglent régulièrement la journée.

## En une phrase

Un cabinet médical gagne en sérénité quand l'agenda et le suivi patient restent pilotés, au lieu de dériver ensemble.
    `.trim(),
  },
  {
    slug: "mieux-lire-conversion-commandes-et-sav-sans-subir-les-a-coups",
    newsletterSlug: "e-commerce",
    title: "Mieux lire conversion, commandes et SAV sans subir les à-coups",
    seoTitle: "E-commerce : mieux lire conversion, commandes et SAV sans subir les à-coups",
    description:
      "Quand le trafic, les commandes et le SAV évoluent vite, le vrai enjeu est d'avoir une lecture simple des points qui cassent la performance.",
    seoDescription:
      "Comment mieux piloter conversion, commandes, SAV et exploitation en e-commerce sans se noyer dans les métriques.",
    date: "2026-06-23",
    tags: ["e-commerce", "conversion", "commandes", "sav"],
    status: "publie",
    content: `
## Le point du mois

En e-commerce, la difficulté n'est pas seulement d'avoir du trafic ou des ventes.

La difficulté, c'est de repérer rapidement ce qui casse la performance :

- une conversion qui glisse ;
- des commandes qui créent plus de friction ;
- un SAV qui prend trop de place ;
- une exploitation qui compense au lieu d'anticiper.

## Ce qu'on recommande

- suivre peu d'indicateurs mais les bons ;
- relier acquisition, commandes et SAV ;
- isoler les motifs de friction qui reviennent ;
- traiter en priorité ce qui abîme à la fois l'expérience client et l'exploitation.

## En une phrase

Un bon pilotage e-commerce relie la promesse commerciale à la réalité opérationnelle, au lieu de les lire séparément.
    `.trim(),
  },
  {
    slug: "garder-les-loyers-les-incidents-et-les-relances-sous-controle",
    newsletterSlug: "gestion-locative",
    title: "Garder les loyers, les incidents et les relances sous contrôle",
    seoTitle: "Gestion locative : garder loyers, incidents et relances sous contrôle",
    description:
      "Quand le portefeuille grossit, le vrai enjeu est de garder une lecture claire des loyers, incidents et arbitrages à mener.",
    seoDescription:
      "Comment mieux piloter loyers, incidents et relances en gestion locative sans perdre le fil entre propriétaires, locataires et opérations.",
    date: "2026-06-23",
    tags: ["gestion locative", "loyers", "incidents", "relances"],
    status: "publie",
    content: `
## Le point du mois

En gestion locative, la complexité ne vient pas seulement du nombre de biens.

Elle vient du croisement permanent entre :

- loyers ;
- incidents ;
- demandes locataires ;
- arbitrages propriétaires ;
- prestataires et délais.

## Ce qu'il faut voir vite

1. les loyers ou situations à risque ;
2. les incidents qui traînent ;
3. les relances non faites ;
4. les dossiers où la coordination ralentit tout le reste.

## Ce qu'on recommande

- une vue unique des sujets sensibles ;
- une prochaine action claire par incident ;
- un tri entre sujet urgent, sujet important et simple suivi ;
- une routine courte de revue du portefeuille actif.

## En une phrase

Une bonne gestion locative ne repose pas sur plus de messages, mais sur une meilleure lecture des priorités.
    `.trim(),
  },
  {
    slug: "mieux-repartir-la-charge-avant-les-pics-decheances",
    newsletterSlug: "cabinet-comptable",
    title: "Mieux répartir la charge avant les pics d'échéances",
    seoTitle: "Cabinet comptable : mieux répartir la charge avant les pics d'échéances",
    description:
      "Brouillon à valider : comment répartir la charge avant que les échéances ne concentrent tout sur les mêmes personnes et les mêmes dossiers.",
    seoDescription:
      "Brouillon à valider sur l'organisation d'un cabinet comptable avant les périodes de tension et de concentration des échéances.",
    date: "2026-06-24",
    tags: ["cabinet comptable", "charge", "échéances", "organisation"],
    status: "a_valider",
    content: `
## Angle proposé

Quand les pics d'échéances approchent, le problème n'est pas seulement le volume.

Le problème, c'est souvent la concentration de la charge :

- sur quelques personnes ;
- sur quelques clients mal préparés ;
- sur des dossiers dont les pièces arrivent trop tard.

## Ce que l'édition doit faire ressortir

1. les périodes de tension prévisibles ;
2. les dossiers qui deviennent toujours critiques trop tard ;
3. les tâches qui pourraient être préparées en amont ;
4. les arbitrages à faire avant que l'urgence n'impose son ordre.

## Pistes de message

- rendre visible la charge par vague d'échéances ;
- différencier collecte, production et contrôle ;
- isoler les clients qui dégradent toute la chaîne ;
- préparer plus tôt les dossiers historiquement fragiles.

## Point à valider

Le texte peut encore être rendu plus concret avec :

- exemples de routines courtes ;
- formulation plus directe sur les pièces manquantes ;
- une meilleure chute opérationnelle.
    `.trim(),
  },
  {
    slug: "reduire-les-frictions-sav-avant-quelles-ne-coutent-la-croissance",
    newsletterSlug: "e-commerce",
    title: "Réduire les frictions SAV avant qu'elles ne coûtent la croissance",
    seoTitle: "E-commerce : réduire les frictions SAV avant qu'elles ne coûtent la croissance",
    description:
      "Brouillon à valider : comment repérer les motifs de SAV qui dégradent à la fois la conversion, l'exploitation et la satisfaction client.",
    seoDescription:
      "Brouillon à valider sur les frictions SAV récurrentes en e-commerce et leur impact sur la croissance.",
    date: "2026-06-24",
    tags: ["e-commerce", "sav", "frictions", "croissance"],
    status: "a_valider",
    content: `
## Angle proposé

En e-commerce, certaines frictions SAV ne paraissent pas dramatiques une par une.

Mais à volume croissant, elles finissent par coûter sur trois fronts :

- l'expérience client ;
- la charge opérationnelle ;
- la rentabilité.

## Ce que l'édition doit faire ressortir

1. les motifs de SAV qui reviennent le plus ;
2. ceux qui pourraient être évités en amont ;
3. ceux qui révèlent un problème de promesse, de logistique ou de produit ;
4. les indicateurs simples à lire sans noyer l'équipe.

## Pistes de message

- regrouper les tickets par cause réelle ;
- relier SAV et promesse commerciale ;
- traiter en priorité les frictions qui se répètent ;
- éviter de lire le SAV seulement comme un sujet support.

## Point à valider

Le brouillon gagnerait à intégrer :

- un exemple plus direct de boucle de correction ;
- une formulation plus nette entre symptôme et cause ;
- une fin plus orientée arbitrage.
    `.trim(),
  },
  {
    slug: "garder-le-suivi-commercial-propre-sans-y-passer-la-semaine",
    newsletterSlug: "conseil-services-entreprises",
    title: "Garder le suivi commercial propre sans y passer la semaine",
    seoTitle: "Suivi commercial en PME de services : garder une vision propre sans y passer la semaine",
    description:
      "Une méthode simple pour éviter les relances oubliées, les opportunités floues et les propositions qui restent trop longtemps sans décision.",
    seoDescription:
      "Comment structurer le suivi commercial d'une activité de conseil ou de services sans surcharge administrative ni pipeline flou.",
    date: "2026-06-23",
    tags: ["commercial", "relances", "pipeline", "services b2b"],
    status: "publie",
    content: `
## Le point du mois

Dans beaucoup d'activités de conseil, de support ou de délégation, le problème commercial ne vient pas d'un manque de demandes.

Le problème vient souvent d'un suivi trop dispersé :

- des prospects répartis entre mails, notes et messagerie ;
- des relances reportées ;
- des devis qui restent ouverts sans vraie prochaine étape ;
- une lecture floue des priorités commerciales.

## Ce qu'il faut surveiller

Ce mois-ci, le vrai sujet n'est pas de "faire plus de prospection".

Le vrai sujet est plutôt de fiabiliser trois points :

1. savoir exactement quels dossiers attendent une relance ;
2. distinguer les opportunités chaudes des discussions vagues ;
3. poser une prochaine action claire pour chaque prospect actif.

## Les signaux faibles à ne pas rater

- plusieurs devis envoyés sans date de reprise prévue ;
- des prospects "intéressés" sans décisionnaire identifié ;
- un volume de demandes qui occupe la semaine mais produit peu d'avancement réel ;
- trop de temps passé à reconstituer l'historique d'un échange.

## Ce qu'on recommande

- centraliser toutes les opportunités dans un seul espace ;
- imposer un champ "prochaine action" obligatoire ;
- revoir chaque semaine les dossiers sans mouvement depuis plus de 7 jours ;
- fermer explicitement ce qui ne doit plus rester dans le pipeline.

## À faire avant la fin du mois

1. lister les opportunités ouvertes ;
2. supprimer celles qui n'ont plus de réalité ;
3. programmer les relances utiles ;
4. clarifier le responsable du suivi.

## En une phrase

Un bon suivi commercial n'est pas un CRM compliqué.

C'est surtout une discipline simple pour savoir où agir, quand relancer et quoi arrêter de traîner.
    `.trim(),
  },
  {
    slug: "proteger-la-marge-quand-les-achats-bougent-toutes-les-semaines",
    newsletterSlug: "restauration",
    title: "Protéger la marge quand les achats bougent toutes les semaines",
    seoTitle: "Restauration : protéger la marge quand les achats bougent toutes les semaines",
    description:
      "Quand les coûts matières varient trop vite, le vrai sujet est de garder une lecture simple de la marge par famille de produits.",
    seoDescription:
      "Comment mieux suivre la marge en restauration malgré les variations de prix, sans complexifier toute l'exploitation.",
    date: "2026-06-23",
    tags: ["restauration", "marge", "achats", "stock"],
    status: "publie",
    content: `
## Le point du mois

Dans la restauration, beaucoup d'établissements voient leurs achats bouger plus vite que leurs habitudes de pilotage.

Le risque n'est pas seulement de payer plus cher.

Le risque, c'est de continuer à vendre et produire sans voir assez tôt où la marge se dégrade.

## Ce qu'il faut regarder en priorité

- les produits dont le coût a le plus augmenté ;
- les familles qui consomment le plus de stock ;
- les écarts entre théorie et réalité en production ;
- les offres qui restent populaires mais deviennent moins rentables.

## L'erreur fréquente

Attendre la fin du mois pour comprendre que certaines lignes de carte tirent la rentabilité vers le bas.

Quand la lecture arrive trop tard :

- les ajustements sont plus lents ;
- les équipes continuent les mêmes habitudes ;
- les achats subissent au lieu d'être arbitrés.

## Ce qu'on recommande

- suivre 5 à 10 références sensibles chaque semaine ;
- regrouper les achats par famille utile ;
- distinguer les hausses ponctuelles des dérives durables ;
- ajuster la carte, les portions ou les mises en avant quand c'est nécessaire.

## À faire avant la prochaine édition

1. identifier les références les plus instables ;
2. relire la marge de quelques produits clés ;
3. décider ce qui doit être réajusté en priorité.

## En une phrase

Protéger la marge en restauration, ce n'est pas tout recalculer tous les jours.

C'est voir assez tôt ce qui bouge pour agir avant que la rentabilité se dégrade trop.
    `.trim(),
  },
  {
    slug: "mieux-suivre-devis-chantiers-et-marge-sans-multiplier-les-tableaux",
    newsletterSlug: "btp-services-techniques",
    title: "Mieux suivre devis, chantiers et marge sans multiplier les tableaux",
    seoTitle: "BTP : mieux suivre devis, chantiers et marge sans multiplier les tableaux",
    description:
      "Le vrai sujet n'est pas d'avoir plus de tableaux, mais d'avoir une lecture commune des devis, du planning et de la rentabilité chantier.",
    seoDescription:
      "Comment structurer le suivi devis, chantiers et marge dans le BTP sans ajouter des outils partout ni perdre les équipes.",
    date: "2026-06-23",
    tags: ["btp", "chantier", "devis", "marge"],
    status: "publie",
    content: `
## Le point du mois

Dans beaucoup d'activités BTP et techniques, les informations utiles existent déjà.

Le problème vient surtout de leur dispersion :

- devis dans un outil ;
- planning ailleurs ;
- achats dans des mails ou factures ;
- rentabilité reconstruite trop tard.

## Ce qu'il faut lire vite

Pour reprendre la main, il faut surtout répondre à quatre questions :

1. quels devis doivent avancer cette semaine ;
2. quels chantiers dérapent en temps ou en achats ;
3. où la coordination terrain est fragile ;
4. quelles affaires méritent un arbitrage rapide.

## Les signaux à surveiller

- démarrages chantier sans dossier parfaitement propre ;
- achats supplémentaires peu justifiés ;
- équipes qui manquent d'information à l'exécution ;
- travaux finis mais facturation encore incomplète.

## Ce qu'on recommande

- un tableau de pilotage unique pour devis, chantiers et facturation ;
- un point hebdomadaire sur les affaires sensibles ;
- un statut commun compris par tout le monde ;
- un contrôle simple des écarts de marge sur les dossiers importants.

## À faire cette semaine

1. lister les chantiers actifs ;
2. repérer ceux qui demandent une décision ;
3. relier devis, exécution et facturation dans une même vue ;
4. supprimer les doubles suivis inutiles.

## En une phrase

Dans le BTP, piloter mieux ne veut pas dire documenter plus.

Cela veut surtout dire rendre visibles les bons écarts assez tôt pour décider.
    `.trim(),
  },
  {
    slug: "sortir-des-demandes-techniques-traitees-au-fil-de-leau",
    newsletterSlug: "tech-digital",
    title: "Sortir des demandes techniques traitées au fil de l'eau",
    seoTitle: "Tech & Digital : sortir des demandes techniques traitées au fil de l'eau",
    description:
      "Quand support, delivery et produit se mélangent, le vrai enjeu est de redonner une file claire aux demandes.",
    seoDescription:
      "Comment structurer les demandes techniques en activité tech ou digitale sans créer plus de friction entre support, delivery et produit.",
    date: "2026-06-23",
    tags: ["tech", "support", "delivery", "priorisation"],
    status: "publie",
    content: `
## Le point du mois

Dans beaucoup d'activités tech et digitales, les équipes ne manquent pas de bonne volonté.

Le problème vient plutôt d'un mélange permanent entre :

- support client ;
- petites corrections ;
- demandes internes ;
- priorités produit ;
- urgences commerciales.

## Ce qu'il faut clarifier

Quand tout arrive dans les mêmes canaux, on perd vite :

1. la vision des vrais blocages ;
2. la priorité réelle ;
3. le temps de réponse sur les sujets importants.

## Ce qu'on recommande

- distinguer support, backlog et demandes ponctuelles ;
- poser une règle simple de tri à l'entrée ;
- définir qui arbitre les priorités ;
- revoir chaque semaine les sujets qui tournent sans décision.

## En une phrase

Une équipe tech respire mieux quand chaque demande sait où aller, qui la porte et quand elle sera revue.
    `.trim(),
  },
  {
    slug: "eviter-que-le-stock-et-le-reassort-prennent-le-dessus-sur-la-vente",
    newsletterSlug: "commerce-retail",
    title: "Éviter que le stock et le réassort prennent le dessus sur la vente",
    seoTitle: "Commerce & retail : éviter que le stock et le réassort prennent le dessus sur la vente",
    description:
      "Le vrai sujet n'est pas d'avoir plus de références, mais d'avoir une lecture claire de ce qui sort, dort et mérite d'être réassorti.",
    seoDescription:
      "Comment mieux piloter stock, réassort et assortiment dans un commerce sans alourdir toute l'organisation.",
    date: "2026-06-23",
    tags: ["commerce", "stock", "assortiment", "réassort"],
    status: "publie",
    content: `
## Le point du mois

Dans le commerce, beaucoup de tensions quotidiennes viennent moins de la vente que du manque de visibilité sur le stock.

Quand le réassort est subi :

- certaines références manquent trop souvent ;
- d'autres dorment trop longtemps ;
- les décisions se prennent au ressenti.

## Ce qu'il faut suivre

1. les produits qui tournent vraiment ;
2. les références trop immobilisées ;
3. les ruptures qui coûtent des ventes ;
4. les achats faits par habitude plutôt que par lecture utile.

## Ce qu'on recommande

- revoir régulièrement le top et le bas du panier ;
- limiter les achats "par confort" ;
- poser des seuils simples sur les références importantes ;
- faire vivre l'assortiment au lieu de l'accumuler.

## En une phrase

Un meilleur pilotage stock ne demande pas forcément plus d'outils, mais une lecture plus disciplinée de ce qui mérite vraiment d'être acheté ou poussé.
    `.trim(),
  },
  {
    slug: "garder-une-lecture-claire-des-biens-et-des-relances-sans-se-disperser",
    newsletterSlug: "immobilier",
    title: "Garder une lecture claire des biens et des relances sans se disperser",
    seoTitle: "Immobilier : garder une lecture claire des biens et des relances sans se disperser",
    description:
      "Mandats, visites, locataires, vendeurs, acquéreurs: le vrai sujet est de savoir quels dossiers doivent réellement avancer.",
    seoDescription:
      "Comment mieux piloter relances, biens et priorités dans une activité immobilière sans perdre le fil entre dossiers.",
    date: "2026-06-23",
    tags: ["immobilier", "relances", "mandats", "priorités"],
    status: "publie",
    content: `
## Le point du mois

Dans l'immobilier, on peut avoir beaucoup d'activité visible sans avoir assez d'avancement réel.

Le risque est de se retrouver avec :

- trop de dossiers "ouverts" ;
- des relances qui se repoussent ;
- une vision confuse des priorités.

## Ce qu'il faut rendre visible

1. les biens qui exigent une action rapide ;
2. les dossiers bloqués faute de retour ;
3. les relances vendeurs, acquéreurs ou locataires non faites ;
4. les étapes qui stagnent depuis trop longtemps.

## Ce qu'on recommande

- une vue unique des biens et dossiers actifs ;
- une prochaine action obligatoire ;
- un nettoyage régulier des dossiers qui n'avancent plus ;
- un point hebdomadaire court sur les biens sensibles.

## En une phrase

Mieux piloter l'immobilier, c'est rendre chaque dossier lisible assez tôt pour agir avant que le flou s'installe.
    `.trim(),
  },
  {
    slug: "mieux-lire-saisonnalite-et-qualite-dexploitation-sans-se-nover",
    newsletterSlug: "hebergement-tourisme",
    title: "Mieux lire saisonnalité et qualité d'exploitation sans se noyer",
    seoTitle: "Hébergement & tourisme : mieux lire saisonnalité et qualité d'exploitation sans se noyer",
    description:
      "Quand l'activité monte et descend vite, le vrai sujet est de garder un pilotage simple des réservations, incidents et qualité terrain.",
    seoDescription:
      "Comment structurer l'exploitation en hébergement et tourisme malgré la saisonnalité, les flux et les incidents terrain.",
    date: "2026-06-23",
    tags: ["hébergement", "tourisme", "réservations", "exploitation"],
    status: "publie",
    content: `
## Le point du mois

Dans l'hébergement et le tourisme, la pression ne vient pas seulement du remplissage.

Elle vient aussi de la coordination :

- réservations ;
- ménage ;
- disponibilité ;
- incidents ;
- qualité perçue côté client.

## Ce qu'il faut suivre

1. les créneaux les plus sensibles ;
2. les incidents qui se répètent ;
3. les trous de coordination entre équipes ou prestataires ;
4. les périodes où la qualité baisse quand le rythme monte.

## Ce qu'on recommande

- une lecture hebdomadaire du planning réel ;
- une liste visible des incidents ouverts ;
- un suivi simple des points qui dégradent l'expérience client ;
- une revue après les pics d'activité.

## En une phrase

Quand la saisonnalité accélère, ce qui protège l'activité n'est pas la mémoire de l'équipe, mais la clarté du pilotage.
    `.trim(),
  },
  {
    slug: "rendre-les-arbitrages-financiers-vraiment-lisibles-pour-le-client",
    newsletterSlug: "patrimoine",
    title: "Rendre les arbitrages financiers vraiment lisibles pour le client",
    seoTitle: "Patrimoine : rendre les arbitrages financiers vraiment lisibles pour le client",
    description:
      "Le vrai sujet n'est pas de produire plus d'informations, mais d'aider le client à comprendre les décisions, risques et options.",
    seoDescription:
      "Comment mieux présenter arbitrages, suivi client et décisions patrimoniales sans créer de confusion inutile.",
    date: "2026-06-23",
    tags: ["patrimoine", "arbitrage", "client", "conformité"],
    status: "publie",
    content: `
## Le point du mois

Dans les activités patrimoniales, beaucoup de valeur se perd quand les arbitrages restent trop techniques ou peu lisibles.

Le client ne manque pas toujours d'informations.

Il manque souvent de clarté sur :

- ce qui change ;
- pourquoi cela change ;
- ce qu'il doit décider.

## Ce qu'on recommande

- simplifier la lecture des options proposées ;
- distinguer clairement risque, opportunité et horizon ;
- garder une trace propre des décisions et validations ;
- prioriser les suivis qui demandent une vraie action client.

## En une phrase

Un bon pilotage patrimonial ne consiste pas seulement à documenter, mais à rendre les arbitrages vraiment compréhensibles.
    `.trim(),
  },
  {
    slug: "garder-les-tournees-et-les-incidents-sous-controle-sans-ajouter-du-bruit",
    newsletterSlug: "mobilite-logistique",
    title: "Garder les tournées et les incidents sous contrôle sans ajouter du bruit",
    seoTitle: "Mobilité & logistique : garder les tournées et les incidents sous contrôle sans ajouter du bruit",
    description:
      "Le vrai enjeu n'est pas d'avoir plus d'alertes, mais de savoir lesquelles doivent vraiment déclencher une décision.",
    seoDescription:
      "Comment mieux piloter tournées, incidents et rentabilité en mobilité et logistique sans surcharger les équipes.",
    date: "2026-06-23",
    tags: ["logistique", "mobilité", "incidents", "tournées"],
    status: "publie",
    content: `
## Le point du mois

Dans la mobilité et la logistique, l'information circule souvent vite, mais pas toujours de façon exploitable.

Le risque est d'avoir beaucoup d'alertes et peu de décisions utiles.

## Ce qu'il faut isoler

1. les incidents qui menacent le service ;
2. les retards qui deviennent récurrents ;
3. les écarts de coût ou de trajet ;
4. les points de coordination qui font perdre du temps à toute la chaîne.

## Ce qu'on recommande

- distinguer incident, alerte et simple signal ;
- remonter seulement ce qui demande un arbitrage ;
- garder une lecture courte des causes récurrentes ;
- lier exploitation et rentabilité au même niveau de suivi.

## En une phrase

Dans la logistique, la qualité du pilotage dépend moins du volume d'information que de la capacité à faire ressortir les vrais écarts.
    `.trim(),
  },
  {
    slug: "mieux-suivre-capacite-maintenance-et-retards-en-production",
    newsletterSlug: "industrie-production",
    title: "Mieux suivre capacité, maintenance et retards en production",
    seoTitle: "Industrie & production : mieux suivre capacité, maintenance et retards",
    description:
      "Quand la charge monte, le vrai enjeu est de rendre visibles les points qui bloquent la production avant qu'ils ne deviennent des retards.",
    seoDescription:
      "Comment mieux piloter capacité, maintenance et retards en industrie et production sans complexifier l'atelier.",
    date: "2026-06-23",
    tags: ["industrie", "production", "maintenance", "capacité"],
    status: "publie",
    content: `
## Le point du mois

En production, beaucoup de tensions apparaissent quand les équipes découvrent trop tard les points de saturation.

Les problèmes les plus coûteux ne sont pas toujours spectaculaires.

Ils commencent souvent par :

- un retard répété ;
- une machine sensible ;
- une charge mal répartie ;
- un approvisionnement moins fiable.

## Ce qu'on recommande

- suivre les postes critiques ;
- relier maintenance, capacité et retard au même pilotage ;
- isoler les écarts qui reviennent ;
- arbitrer tôt ce qui menace le planning réel.

## En une phrase

Mieux piloter la production, c'est repérer plus tôt les points de tension pour éviter qu'ils deviennent structurels.
    `.trim(),
  },
  {
    slug: "mieux-gerer-agenda-no-show-et-relances-sans-alourdir-le-soin",
    newsletterSlug: "sante-bien-etre-esthetique",
    title: "Mieux gérer agenda, no-show et relances sans alourdir le soin",
    seoTitle: "Santé, bien-être & esthétique : mieux gérer agenda, no-show et relances",
    description:
      "Le vrai sujet n'est pas de tout automatiser, mais de protéger l'agenda, la qualité et le suivi sans surcharge.",
    seoDescription:
      "Comment mieux piloter agenda, relances et no-show en santé, bien-être ou esthétique sans dégrader l'expérience client.",
    date: "2026-06-23",
    tags: ["santé", "agenda", "no-show", "relances"],
    status: "publie",
    content: `
## Le point du mois

Dans les activités de santé, bien-être et esthétique, beaucoup de fatigue opérationnelle vient d'un agenda mal protégé.

Quand les no-show, reports et relances s'accumulent :

- la journée se dérègle ;
- l'équipe compense ;
- le suivi client se dégrade.

## Ce qu'on recommande

- repérer les créneaux les plus fragiles ;
- rendre visibles les annulations et absences répétées ;
- simplifier les relances vraiment utiles ;
- protéger les temps sensibles dans le planning.

## En une phrase

Un bon agenda n'est pas seulement rempli: il reste pilotable, fiable et supportable pour l'équipe.
    `.trim(),
  },
  {
    slug: "tenir-les-plannings-terrain-et-les-remplacements-sans-subir",
    newsletterSlug: "services-aux-particuliers",
    title: "Tenir les plannings terrain et les remplacements sans subir",
    seoTitle: "Services aux particuliers : tenir les plannings terrain et les remplacements sans subir",
    description:
      "Quand l'activité repose sur l'intervention et la présence, le vrai sujet est de fiabiliser le planning et les remplacements.",
    seoDescription:
      "Comment mieux piloter planning, interventions et remplacements dans les services aux particuliers sans perte d'information.",
    date: "2026-06-23",
    tags: ["services", "planning", "terrain", "remplacements"],
    status: "publie",
    content: `
## Le point du mois

Dans les services aux particuliers, beaucoup de désorganisation naît quand le planning vit plus vite que le système de suivi.

Le risque n'est pas seulement l'imprévu.

Le risque, c'est l'information incomplète au moment où il faut réagir.

## Ce qu'on recommande

- une vue simple des interventions et remplacements ;
- une règle claire pour remonter les changements ;
- un suivi des incidents qui reviennent ;
- un point court sur les créneaux les plus fragiles.

## En une phrase

Quand le terrain bouge, la qualité de service dépend d'abord de la qualité du planning partagé.
    `.trim(),
  },
  {
    slug: "mieux-suivre-sessions-financement-et-avancement-apprenants",
    newsletterSlug: "education-formation",
    title: "Mieux suivre sessions, financement et avancement apprenants",
    seoTitle: "Éducation & formation : mieux suivre sessions, financement et avancement",
    description:
      "Le vrai sujet n'est pas de multiplier les tableaux Qualiopi, mais de garder une vue claire des sessions, pièces et suivis.",
    seoDescription:
      "Comment mieux piloter sessions, pièces de financement et avancement apprenants en formation sans surcharge administrative.",
    date: "2026-06-23",
    tags: ["formation", "sessions", "financement", "apprenants"],
    status: "publie",
    content: `
## Le point du mois

En formation, la charge grimpe vite quand inscriptions, sessions, pièces et suivis vivent dans des espaces séparés.

Le problème n'est pas seulement administratif.

Il devient vite opérationnel et commercial.

## Ce qu'on recommande

- relier session, apprenants et pièces clés ;
- surveiller les points de blocage avant démarrage ;
- distinguer suivi pédagogique et suivi administratif ;
- garder une lecture simple des retards ou pièces manquantes.

## En une phrase

Un meilleur pilotage formation repose moins sur plus de paperasse que sur une meilleure continuité entre session, financement et suivi.
    `.trim(),
  },
  {
    slug: "mieux-piloter-latelier-les-pieces-et-la-restitution-client",
    newsletterSlug: "automobile-reparation",
    title: "Mieux piloter l'atelier, les pièces et la restitution client",
    seoTitle: "Automobile & réparation : mieux piloter atelier, pièces et restitution client",
    description:
      "Le vrai sujet n'est pas seulement la charge atelier, mais la coordination entre prise en charge, pièces, délai et restitution.",
    seoDescription:
      "Comment mieux suivre atelier, pièces et restitution client dans l'automobile et la réparation sans surcharge d'outils.",
    date: "2026-06-23",
    tags: ["automobile", "atelier", "pièces", "restitution"],
    status: "publie",
    content: `
## Le point du mois

Dans l'automobile et la réparation, beaucoup de frictions viennent d'une mauvaise continuité entre diagnostic, pièces, délai et restitution.

## Ce qu'il faut surveiller

1. les véhicules ou appareils immobilisés trop longtemps ;
2. les retards liés aux pièces ;
3. les écarts entre promesse faite au client et réalité atelier ;
4. les dossiers où l'information manque au bon moment.

## En une phrase

Mieux piloter l'atelier, c'est surtout mieux relier la prise en charge, l'exécution et la restitution.
    `.trim(),
  },
  {
    slug: "mieux-suivre-adherents-evenements-et-relances-sans-separpiller",
    newsletterSlug: "associations-evenements",
    title: "Mieux suivre adhérents, événements et relances sans s'éparpiller",
    seoTitle: "Associations & événements : mieux suivre adhérents, événements et relances",
    description:
      "Le vrai sujet n'est pas d'accumuler plus d'outils, mais de garder une vue commune sur membres, actions et relances utiles.",
    seoDescription:
      "Comment mieux piloter adhérents, événements et relances dans une association ou une activité événementielle sans dispersion.",
    date: "2026-06-23",
    tags: ["association", "événement", "adhérents", "relances"],
    status: "publie",
    content: `
## Le point du mois

Dans les associations et l'événementiel, la dispersion coûte vite cher:

- contacts répartis ;
- relances oubliées ;
- actions sans suivi clair ;
- préparation événement fragile.

## Ce qu'on recommande

- une base commune des membres ou participants ;
- une vue simple des relances à faire ;
- un suivi clair des tâches critiques avant événement ;
- une séparation nette entre communication, opérationnel et administratif.

## En une phrase

Quand la coordination est visible, l'énergie de l'équipe sert davantage l'impact que la recherche d'information.
    `.trim(),
  },
];

export function getAllNewsletters() {
  return newsletters;
}

export function getNewsletterBySlug(slug: string) {
  return newsletters.find((entry) => entry.slug === slug) ?? null;
}

export function getParentNewsletter(newsletterSlug: string) {
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!newsletter?.parentSlug) {
    return null;
  }

  return getNewsletterBySlug(newsletter.parentSlug);
}

export function getChildNewsletters(newsletterSlug: string) {
  return newsletters.filter((entry) => entry.parentSlug === newsletterSlug);
}

export function getNewsletterArticlesByNewsletterSlug(newsletterSlug: string) {
  return articles
    .filter((entry) => entry.newsletterSlug === newsletterSlug && entry.status === "publie")
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getNewsletterArticleBySlugs(newsletterSlug: string, articleSlug: string) {
  return (
    articles.find(
      (entry) =>
        entry.newsletterSlug === newsletterSlug &&
        entry.slug === articleSlug &&
        entry.status === "publie",
    ) ?? null
  );
}

export function getAllNewsletterArticles() {
  return articles.filter((entry) => entry.status === "publie");
}

export function getPendingNewsletterArticles() {
  return articles
    .filter((entry) => entry.status === "a_valider")
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getPendingNewsletterArticleBySlugs(newsletterSlug: string, articleSlug: string) {
  return (
    articles.find(
      (entry) =>
        entry.newsletterSlug === newsletterSlug &&
        entry.slug === articleSlug &&
        entry.status === "a_valider",
    ) ?? null
  );
}

export function getNewsletterSystems(newsletterSlug: string, limit = 6): System[] {
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!newsletter) {
    return [];
  }

  return Array.from(new Set(newsletter.systemSlugs))
    .map((slug) => enterpriseCatalogBySlug[slug])
    .filter((enterprise): enterprise is NonNullable<typeof enterprise> => Boolean(enterprise))
    .slice(0, limit)
    .map(enterpriseToSystem);
}
