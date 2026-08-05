# C1 — Passe orale finale

Source immuable : `oumou-warm-v2`.

| Scène | Avant | Après | Mots | Caractères |
|---|---|---|---:|---:|
| `paradoxe` | Résultat et trésorerie « ne parlent pas du même moment, ni du même argent ». | « Le résultat peut être positif avant que l’argent arrive réellement sur le compte. » | 50 → 45 | 293 → 274 |
| `bfr` | Le BFR est « l’argent qu’il faut avancer pendant qu’on attend d’être payé ». | Le BFR est l’argent que l’entreprise avance pour payer ses dépenses avant d’encaisser ses clients. | 58 → 65 | 354 → 400 |
| `decisions` | Les deux dernières phrases sont enchaînées. | Un double saut de ligne encode une respiration après « Le but n’est pas de deviner l’avenir. », sans ajouter de mot. | 72 → 72 | 469 → 470 |
| `regle` | « Une facture ne paie rien tant qu’elle n’est pas encaissée. » | La nouvelle règle est alignée à l’écran ; une respiration est encodée avant « Vous avez besoin des deux. », sans ajout de mot. | 38 → 44 | 239 → 273 |

Total du cours : 578 → 586 mots ; 3 504 → 3 566 caractères.

Le pipeline transmet les sauts de ligne de `narration` tels quels au texte
de synthèse. La respiration est donc encodée dans la source, sans audio ni
timing généré à ce stade.

Invariants conservés : chiffres, exemples, IDs de scènes, assets, beats,
ordre et structure visuelle.

Extension de contre-audit : `editorialVariant` vaut
`oumou-oral-final-v1` et le texte affiché de la conclusion reprend
exactement la règle orale.
