# Contrat de données

## Dossier candidat minimal

Le fichier JSON candidat doit contenir :

```json
{
  "id": "nom-siren",
  "company": {
    "name": "Raison sociale",
    "siren": "123456789",
    "siret": "12345678900012",
    "activityCode": "69.20Z",
    "status": "active",
    "website": "https://example.fr",
    "domain": "example.fr",
    "address": "Adresse professionnelle"
  },
  "fit": {
    "segment": "cabinet-expertise-comptable-pennylane",
    "pennylaneEvidence": [
      {
        "type": "official_pennylane_story",
        "url": "https://...",
        "publisher": "Pennylane",
        "checkedAt": "2026-08-08",
        "excerpt": "Extrait factuel court"
      }
    ],
    "signals": [
      {
        "kind": "fact",
        "claim": "Fait vérifié",
        "sourceUrls": ["https://..."]
      }
    ]
  },
  "contact": {
    "email": "contact@example.fr",
    "type": "generic",
    "sourceUrl": "https://example.fr/contact",
    "checkedAt": "2026-08-08"
  },
  "sources": [
    {
      "purpose": "legal_identity",
      "url": "https://...",
      "publisher": "Éditeur",
      "checkedAt": "2026-08-08",
      "excerpt": "Extrait court"
    }
  ]
}
```

## Registre

`prospects.json` contient une liste d'enregistrements normalisés avec :

- `id`, `company`, `fit`, `contact`, `sources` ;
- `draft.path`, `draft.sha256`, `draft.subject` ;
- `status` ;
- `createdAt`, `updatedAt` ;
- `approval` seulement après validation explicite ;
- `sentAt` seulement après constat d'un envoi externe.

États autorisés :

- `draft_prepared_pending_validation` ;
- `approved_not_sent` ;
- `sent` ;
- `opposed`.

## Liste repoussoir

`oppositions.json` contient uniquement :

- `kind` : `email` ou `domain` ;
- `sha256` de la valeur normalisée ;
- `recordedAt` ;
- `source` non sensible ;
- `reviewAfter`, au moins trois ans plus tard.

Ne jamais y stocker l'adresse en clair.

## Journal quotidien

`daily-ledger.json` regroupe les envois constatés par date locale Europe/Paris. Chaque entrée contient l'identifiant du prospect, l'horodatage, le SHA-256 du brouillon approuvé et le validateur. Refuser plus de 20 entrées par jour et toute date tombant un samedi ou un dimanche.
