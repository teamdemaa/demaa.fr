# ADR 0018 — Diagnostic comme conversation directe

- Statut : `validated`
- Date : 2026-08-22
- Complète : ADR 0009 et ADR 0010
- Supersède : leurs libellés `Échanger` / `Clarifier ma situation` et toute
  promotion Coach business rendue dans la conversation

## Décision

L'action compacte du header s'appelle `Diagnostic` en français et `Assessment`
en anglais. Elle ouvre la conversation existante sans créer de route, d'API,
d'intention ou de modèle de données supplémentaire. Les identifiants techniques
historiques `coaching` restent inchangés.

La surface affiche :

- `Quel problème rencontrez-vous ?` ;
- `Décrivez ce qui vous bloque. L’équipe Demaa vous répond ici.` ;
- l'historique, la dictée et le premier échange gratuit existants.

Le Diagnostic ne rend aucune recommandation, promotion ou action Coach
business, avant l'envoi comme après la clôture. Coach business reste disponible
uniquement dans Services. Le CTA principal du générateur reste `Créer mon plan
d’action` : le générateur produit le plan, tandis que le Diagnostic est une
réponse humaine dans la conversation.

## Compatibilité

Les routes, collections, statuts, brouillons, `intent=coaching`, notifications
et écrans d'administration ne sont pas renommés. Les liens existants continuent
donc à ouvrir la même conversation. Cette décision porte seulement sur la copie,
l'accessibilité et l'absence de promotion commerciale dans cette surface.
