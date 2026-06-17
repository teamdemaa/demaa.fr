export interface CourseEntry {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  description: string;
  seoDescription?: string;
  content: string;
  category: string;
  image?: string;
  tags: string[];
  duration: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const courseEntries: CourseEntry[] = [
  {
    slug: "facture-electronique",
    title: "Facture électronique TPE : ce qui change et quoi faire maintenant",
    seoTitle: "Facture électronique TPE : ce qui change et quoi faire maintenant",
    date: "2026-06-14",
    description:
      "Ce qui change concrètement pour une TPE, les dates à retenir, et les actions simples à lancer maintenant pour ne pas subir la réforme.",
    seoDescription:
      "Facture électronique TPE : ce qui change, les dates 2026 et 2027, les obligations de réception et d'émission, et quoi faire maintenant pour être prêt.",
    category: "Conformité & gestion",
    tags: ["cours", "facturation", "conformité", "tpe"],
    duration: "18 min",
    content: `
## Ce qui change, en clair

Si vous dirigez une TPE, vous n'avez pas besoin de devenir expert du sujet. Vous devez surtout retenir 4 choses :

- à partir du **1er septembre 2026**, votre entreprise doit être capable de **recevoir** des factures électroniques ;
- si vous êtes une **TPE ou PME**, vous devrez **émettre** vos factures électroniques à partir du **1er septembre 2027** ;
- un **PDF envoyé par mail** ne suffira plus comme facture électronique conforme ;
- le vrai sujet est simple : **avec quel outil ou quelle plateforme allez-vous envoyer, recevoir et suivre vos factures ?**

## Qui est concerné

La réforme concerne les entreprises assujetties à la TVA établies en France, y compris beaucoup de petites structures, indépendants, professions libérales et entreprises en franchise en base.

Même si vous émettez peu de factures, vous êtes concerné dès lors que vous devez en **recevoir** de vos fournisseurs.

## Ce qui change concrètement pour une TPE

Aujourd'hui, beaucoup de TPE fonctionnent avec un mélange de PDF, mails, pièces jointes, classement manuel et relances séparées.

Demain, la facture devra passer par une **plateforme agréée** ou un outil raccordé correctement. L'objectif n'est pas seulement d'envoyer un document, mais aussi de :

- transmettre la facture dans un format conforme ;
- retrouver son statut ;
- suivre correctement l'émission, la réception et parfois l'encaissement ;
- envoyer certaines données à l'administration quand c'est nécessaire.

Quand on parle de **facturation électronique obligatoire**, il faut donc penser à la fois à la facture elle-même, au canal de transmission et au suivi des données.

## Ce qui change concrètement pour vous

### 1. Réception : échéance au 1er septembre 2026

À cette date, toutes les entreprises devront pouvoir recevoir des factures électroniques.

En pratique, cela veut dire que votre organisation doit être prête avant cette date, même si vous n'émettez pas encore vous-même au nouveau format.

### 2. Émission : échéance au 1er septembre 2027 pour les TPE/PME

Si vous êtes une petite structure, vous avez un an de plus pour émettre vos propres factures au bon format.

Ce délai ne doit pas rassurer à tort : si vous attendez 2027 pour vous en occuper, vous risquez surtout de subir un changement dans l'urgence.

### 3. Le PDF simple par mail ne sera plus suffisant

C'est un point clé. Une facture électronique au sens de la réforme n'est pas juste un PDF propre.

Il faut un **format structuré ou mixte conforme** et une transmission via l'écosystème prévu. Donc si votre process actuel repose sur "je génère un PDF puis je l'envoie par mail", il faudra le faire évoluer.

Autrement dit, si vous cherchez **comment fonctionne la facture électronique pour une TPE**, retenez ceci : ce n'est pas un simple changement d'habillage, c'est un changement de circuit.

### 4. Le sujet ne se limite pas au logiciel

Le risque n'est pas seulement technique. Le vrai risque, c'est un circuit mal défini :

- devis fait dans un outil ;
- facture faite dans un autre ;
- règlement suivi ailleurs ;
- cabinet comptable pas aligné ;
- documents clients incomplets ;
- personne ne sait qui gère quoi.

## Les dates à retenir

Pour capter le sujet sans vous perdre :

- **1er septembre 2026** : obligation de **réception** pour toutes les entreprises ;
- **1er septembre 2026** : obligation d'**émission** pour les grandes entreprises et ETI ;
- **1er septembre 2027** : obligation d'**émission** pour les **TPE et PME**.

Si vous êtes dirigeant de petite entreprise, le plus important est d'être prêt sur la réception en 2026 et d'avoir choisi votre organisation d'émission bien avant 2027.

## Quoi faire maintenant

### 1. Identifier votre outil principal de facturation

Posez-vous une seule question : **quel outil va devenir votre point d'entrée facture ?**

Cela peut être :

- votre logiciel de facturation actuel ;
- votre outil métier s'il gère déjà la facturation ;
- un outil conseillé par votre expert-comptable ;
- une plateforme choisie pour ce sujet.

### 2. Appeler votre éditeur ou votre cabinet comptable

Vous devez obtenir des réponses claires à ces questions :

- est-ce que notre outil sera compatible ?
- si oui, comment ?
- si non, vers quoi faut-il basculer ?
- qui s'occupe du paramétrage ?
- qu'est-ce qui reste chez nous et qu'est-ce qui part chez le comptable ?

### 3. Remettre de l'ordre dans vos données de facturation

Avant toute bascule, vérifiez :

- vos informations légales ;
- votre SIREN ;
- les informations clients utiles ;
- vos adresses de facturation ;
- vos mentions obligatoires ;
- la logique de numérotation ;
- le lien entre devis, facture, avoir, paiement.

### 4. Clarifier le circuit réel

Sur une feuille simple, vous devez pouvoir décrire :

- qui fait le devis ;
- qui transforme en facture ;
- qui envoie ;
- qui suit le paiement ;
- qui gère les avoirs ;
- qui archive ;
- qui répond si une facture est rejetée ou bloquée.

Si ce circuit n'est pas clair aujourd'hui, la réforme va juste rendre le flou plus visible.

## Ce qu'il faut éviter

- changer d'outil trop vite sans comprendre votre besoin ;
- garder plusieurs outils qui se contredisent ;
- penser que le cabinet comptable prendra tout en charge par défaut ;
- croire qu'il suffira d'exporter un PDF ;
- attendre l'été 2027 pour comparer les solutions.

## Si vous voulez aller droit au but

1. vérifiez cette semaine quel outil émet aujourd'hui vos factures ;
2. demandez à votre expert-comptable ou éditeur comment la réforme sera gérée ;
3. décidez d'un outil unique ou d'un circuit simple ;
4. nettoyez vos données de facturation ;
5. testez le futur process avant d'y être forcé.

## Les questions à poser maintenant

- Mon logiciel de facturation sera-t-il compatible avec la réforme ?
- Mon expert-comptable me conseille-t-il une plateforme ou un outil précis ?
- Qui suivra les statuts de facture et les rejets éventuels ?
- Comment vais-je relier devis, facture, avoir et encaissement ?
- Est-ce que mon organisation actuelle supporte la facturation électronique sans ressaisie ?

## Pourquoi ce sujet mérite votre attention

La facture électronique n'est pas d'abord une contrainte informatique. C'est un sujet de **gestion**, de **fiabilité** et de **temps perdu**.

Une TPE bien préparée peut y gagner :

- moins d'erreurs ;
- moins de ressaisie ;
- un meilleur suivi des factures ;
- une vision plus propre des encaissements ;
- moins de dépendance à des bricolages internes.

## En une phrase

Pour une TPE, la bonne question n'est pas "qu'est-ce que la réforme dit exactement ?", mais plutôt :

**qui gère mes factures, dans quel outil, avec quel process, avant septembre 2026 pour la réception et avant septembre 2027 pour l'émission ?**
    `.trim(),
    faq: [
      {
        question: "À quelle date une TPE devra-t-elle recevoir des factures électroniques ?",
        answer:
          "Une TPE devra être capable de recevoir des factures électroniques à partir du 1er septembre 2026.",
      },
      {
        question: "À quelle date une TPE devra-t-elle émettre des factures électroniques ?",
        answer:
          "Une TPE devra émettre ses factures électroniques à partir du 1er septembre 2027.",
      },
      {
        question: "Un PDF envoyé par mail sera-t-il encore suffisant ?",
        answer:
          "Non. Un PDF simple envoyé par mail ne sera plus considéré comme une facture électronique conforme dans le cadre de la réforme.",
      },
      {
        question: "Que doit faire une TPE maintenant ?",
        answer:
          "Vérifier son outil de facturation, demander à son éditeur ou à son expert-comptable comment la réforme sera gérée, clarifier son circuit devis-facture-paiement et nettoyer ses données de facturation.",
      },
    ],
  },
];

export function getAllCourseEntries(): CourseEntry[] {
  return [...courseEntries].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function getCourseEntryBySlug(slug: string): CourseEntry | null {
  return courseEntries.find((entry) => entry.slug === slug) ?? null;
}
