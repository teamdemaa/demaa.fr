# Newsletter Structure — contrat de données

## Parcours public

- Le même composant est rendu en bas de l'onglet Ressources des systèmes, de la
  page principale Académie et de l'offre publique `/sur-mesure`. La route
  historique `/structuration` est retirée par le proxy et ne reçoit donc pas un
  composant inaccessible.
- L'inscription est directe : une adresse e-mail est envoyée à
  `/api/newsletter-subscribe`, qui conserve son contrat Resend existant.
- `Proposer ma problématique` ouvre un formulaire séparé. La proposition n'est
  jamais publiée automatiquement et ne garantit pas d'être traitée.

## Proposition écrite

`/api/structure-problem` valide et stocke dans `lead_requests` :

- l'entreprise ou l'activité ;
- le site ou la page professionnelle ;
- la problématique ;
- l'adresse e-mail ;
- le contexte et l'attribution de la page d'origine ;
- la preuve structurée du consentement de publication (finalité, texte,
  version, date et état).

La notification interne utilise Slack. La proposition n'est ni ajoutée à une
audience Resend, ni envoyée par e-mail. L'équipe contacte l'entreprise avant
toute présentation publique du cas.

## Enregistrement vocal

La V1 publique garde le vocal désactivé dans
`STRUCTURE_VOICE_SUBMISSION.enabled`. Son activation exige, dans cet ordre :

1. un stockage objet privé, sans URL publique permanente ;
2. une limite vérifiée de 120 secondes et de taille ;
3. un service de transcription configuré ;
4. une suppression automatique de l'audio sous 30 jours ;
5. une preuve d'expiration et un test de suppression ;
6. l'application à la transcription de la même conservation que la proposition
   écrite ;
7. une mise à jour de l'interface et des tests E2E avant activation.

Tant que ces garanties ne sont pas réunies, l'API refuse tout champ vocal et
aucun binaire n'est envoyé ni stocké.
