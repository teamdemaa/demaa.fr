# Gate d’intégration — UI Solutions des systèmes

Statut : **bloqué avant W6**.

Le lot UI Solutions ne doit pas être intégré dans la branche de livraison tant que W6 n’a pas aligné les métadonnées et le JSON-LD des pages Systèmes sur le même selector `published-only` que l’interface.

Conditions de levée du gate :

- les offres `referral_form` disposent d’un parcours et d’un disclosure validés, ou restent exclues côté serveur ;
- les métadonnées et le JSON-LD ne décrivent que les Solutions effectivement publiées et rendues ;
- les libellés de travail centralisés dans l’UI ont reçu la validation éditoriale ou ont été remplacés ;
- les tests W6 prouvent l’alignement entre rendu, metadata et JSON-LD.

Ce document ne modifie aucun comportement SEO dans la branche W4.
