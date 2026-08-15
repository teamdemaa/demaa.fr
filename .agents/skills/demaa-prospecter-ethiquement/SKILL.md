---
name: demaa-prospecter-ethiquement
description: Rechercher et qualifier de manière éthique des prospects B2B pour Demaa, exclusivement des cabinets d'expertise comptable dont l'usage de Pennylane est prouvé par des sources publiques vérifiables. Utiliser ce skill pour sourcer les preuves, vérifier l'identité légale, trouver uniquement des coordonnées professionnelles publiées, dédupliquer, préparer des brouillons soumis à validation humaine, contrôler la limite de 20 e-mails par jour ouvré et tenir une liste d'opposition. Ne jamais utiliser ce skill pour envoyer automatiquement un message.
---

# Prospecter éthiquement pour Demaa

## Appliquer les garde-fous

1. Limiter le périmètre aux cabinets d'expertise comptable français actifs.
2. Exiger une preuve directe de Pennylane avant toute collecte de coordonnées : témoignage ou cas client Pennylane officiel, mention explicite sur le site officiel du cabinet, ou lien client direct vers `app.pennylane.com`. Rejeter les simples suppositions.
3. Consulter [policy-and-sources.md](references/policy-and-sources.md) avant toute recherche réelle.
4. Consulter [data-contract.md](references/data-contract.md) avant de créer ou modifier un dossier prospect.
5. Ne jamais contourner une authentification, un paywall, un CAPTCHA ou une opposition.
6. Ne jamais acheter de liste, enrichir avec une adresse privée, deviner une adresse e-mail, utiliser un téléphone personnel ou collecter plus que nécessaire.
7. Ne jamais appeler un outil d'envoi. Produire uniquement un brouillon portant l'état `draft_prepared_pending_validation`.

## Exécuter le workflow

### 1. Rechercher et prouver

- Vérifier le cabinet avec l'API officielle Recherche d'entreprises ou l'Annuaire des Entreprises : raison sociale, SIREN, code NAF `69.20Z`, état actif et adresse.
- Recueillir au moins une preuve Pennylane de force `directe` et, si possible, une seconde preuve indépendante.
- Pour chaque fait conservé, enregistrer l'URL canonique, l'éditeur, la date de consultation et un court extrait factuel.
- Distinguer les faits des inférences. Étiqueter tout angle de personnalisation comme `inference` et le rattacher à ses sources.

### 2. Trouver un contact professionnel

- Préférer une adresse générique publiée par le cabinet : `contact@`, `bonjour@`, `info@`.
- Accepter une adresse nominative uniquement si le cabinet la publie lui-même, si le rôle est vérifié et si l'offre concerne directement ce rôle.
- Enregistrer la page source exacte. Ne jamais tester la délivrabilité en envoyant un message.

### 3. Dédupliquer et vérifier les oppositions

- Normaliser le SIREN, le domaine et l'e-mail.
- Dédupliquer dans cet ordre : SIREN, domaine, e-mail, puis nom + adresse.
- Comparer les empreintes SHA-256 de l'e-mail et du domaine à `oppositions.json` avant de préparer un brouillon.
- En cas de correspondance, arrêter immédiatement et conserver uniquement les informations nécessaires à l'opposition.

### 4. Préparer un brouillon

- Utiliser [draft.template.md](assets/draft.template.md) comme base.
- Rester bref, précis et lié au métier du cabinet.
- Ne pas prétendre connaître un problème non prouvé. Formuler les bénéfices comme une hypothèse à vérifier.
- Identifier Demaa, expliquer pourquoi le cabinet est contacté, indiquer la source de la coordonnée et proposer une opposition simple et gratuite.
- Ne pas ajouter de pixel de suivi, de pièce jointe non sollicitée, d'urgence artificielle, de fausse recommandation ou de fausse relation avec Pennylane.

### 5. Enregistrer sans envoyer

Exécuter :

```bash
node .agents/skills/demaa-prospecter-ethiquement/scripts/prospect-ledger.mjs prepare \
  --candidate <dossier.json> \
  --draft <brouillon.md> \
  --workspace outputs/prospection-ethique
```

Le script doit produire ou mettre à jour le registre, vérifier la déduplication et les oppositions, puis conserver le brouillon avec l'état `draft_prepared_pending_validation`. Un second passage identique doit être idempotent et ne créer aucun doublon.

Pour remplacer un brouillon encore non envoyé, exécuter `revise-draft --id <prospect-id> --draft <brouillon.md> --workspace <dossier>`. Toute validation antérieure est alors invalidée et le nouveau texte revient à l'état `draft_prepared_pending_validation`.

### 6. Soumettre à validation humaine

- Présenter le dossier de preuves, la coordonnée, l'angle, le brouillon et les contrôles à la personne qui valide.
- Exiger une validation explicite du texte exact. Une absence de réponse n'est jamais une validation.
- Conserver la validation dans un fichier séparé contenant l'identifiant du prospect, l'identité du validateur, l'horodatage et le SHA-256 exact du brouillon.
- Ne jamais interpréter la création du brouillon comme une autorisation d'envoi.

### 7. Contrôler un envoi futur sans l'effectuer

Exécuter uniquement après validation explicite :

```bash
node .agents/skills/demaa-prospecter-ethiquement/scripts/prospect-ledger.mjs preflight \
  --id <prospect-id> \
  --draft <brouillon.md> \
  --approval <validation.json> \
  --workspace outputs/prospection-ethique
```

Le préflight refuse les week-ends, une opposition, un brouillon modifié, une validation incomplète et tout dépassement de 20 e-mails marqués envoyés dans la journée Europe/Paris. Il n'envoie rien.

Après un envoi effectué hors de ce skill, enregistrer le fait avec `mark-sent` et les mêmes paramètres plus `--sent-at <ISO-8601>`. Le script ne transmet aucun message.

## Enregistrer une opposition

À réception d'un refus, ne pas argumenter et ne pas relancer. Exécuter immédiatement :

```bash
node .agents/skills/demaa-prospecter-ethiquement/scripts/prospect-ledger.mjs record-opposition \
  --email <adresse> \
  --source <canal-ou-référence> \
  --workspace outputs/prospection-ethique
```

Utiliser `--domain` pour une opposition couvrant tout le cabinet. Le registre ne conserve que des empreintes dans la liste repoussoir. Garder cette liste pour cette seule finalité pendant au moins trois ans, puis réévaluer sa conservation.

## Auditer le registre

Exécuter après chaque lot :

```bash
node .agents/skills/demaa-prospecter-ethiquement/scripts/prospect-ledger.mjs audit \
  --workspace outputs/prospection-ethique
```

Signaler le nombre de prospects, de brouillons en attente, d'oppositions, d'envois du jour et la capacité restante. Ne jamais présenter un prospect non prouvé comme qualifié.
