# Contrôle avant retrait de Stripe — systèmes opérationnels

Date du contrôle : 27 juillet 2026
Périmètre : ancien achat unitaire des systèmes opérationnels uniquement.

## Contrôles effectués

- Les variables d’environnement Vercel du projet `demaa-fr` ont été listées en lecture seule pour l’environnement Production.
- Aucune variable `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` ou autre variable Stripe n’était configurée en Production.
- Les seules variables Stripe trouvées localement étaient des clés de test, non déployées en Production.
- La collection Firestore `operational_system_orders` a été comptée en lecture seule.
- Résultat Firestore : `0` document au moment du contrôle (`2026-07-27T07:19:44.282Z`).
- Avant retrait, l’interface publique conditionnait déjà l’achat à la présence d’une clé Stripe serveur ; en l’absence de clé Production, le checkout public était désactivé.

## Conclusion

Aucune commande ni session live liée à ce parcours n’était à préserver. Le retrait de l’endpoint checkout, du webhook, de la page de succès, du registre payant et des modules Stripe propres aux systèmes opérationnels ne supprime donc aucune commande client existante.

Ce contrôle n’a affiché, copié ou modifié aucune donnée client et n’a réalisé aucune mutation sur Vercel, Firestore ou Stripe.
