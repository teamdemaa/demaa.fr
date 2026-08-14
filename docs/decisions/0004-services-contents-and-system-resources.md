# ADR 0004 — Services, Contenus et Ressources des Systèmes

- Statut : `validated`
- Date : 9 août 2026
- Mise à jour : 14 août 2026, surface temporaire Cours uniquement
- Portée : Services Demaa, composition de Solutions, Académie, Contenus et
  Ressources des 115 systèmes
- Supersède : les passages incompatibles des ADR 0001, 0002 et 0003

> Les sections relatives au catalogue, aux prix, à l'éligibilité et au parcours
> de contact des Services sont supersédées par l'ADR 0006. Les décisions
> Contenus, Académie et Ressources de ce document restent actives.

## Décision

### Services Demaa

Demaa publie exactement quatre services canoniques :

1. Automatisation des processus (`/services/automatisation-processus`) ;
2. Expert-comptable (`/services/expert-comptable`) ;
3. Marketing externalisé (`/services/marketing-vente`) ;
4. Assistance facturation (`/services/assistance-facturation`).

`/services` est l'annuaire public de ces quatre offres. `/sur-mesure` reste une
offre séparée. Les anciens catalogues, prix et promesses ne constituent plus
une source de vérité.

La source produit du Marketing externalisé est le document
`Offre-Marketing-Vente-Externalises.docx` : 950 EUR HT par mois, engagement
initial de trois mois, point d'avancement hebdomadaire, bilan mensuel et support
sous 24 à 48 heures.

Les quatre offres sont composées au rendu dans les 115 fiches Système. Elles ne
sont pas copiées 460 fois dans Firebase.

### Ordre de Solutions

1. Outils ;
2. Services ;
3. Fournisseurs ;
4. Financement ;
5. Aides et subventions ;
6. Réseaux professionnels.

Les sections Fournisseurs et Réseaux restent conditionnelles à des placements
Firebase réellement pertinents. Aucun fournisseur transversal n'est injecté
aux 115 systèmes par défaut.

Les catalogues canoniques Financement et Aides sont composés au rendu dans le
même contrat Solutions et restent sélectionnables avec les autres placements ;
ils ne créent ni seconde base de données ni copie par Système. L'interface ne
limite pas arbitrairement le nombre de recommandations visibles ou sélectionnées.
La pertinence éditoriale reste toutefois contrôlée : aucun acteur non relu n'est
injecté universellement.

Formation, annuaire de recrutement et prestation Expert-comptable ne sont pas
ajoutés à ces recommandations Solutions. Le service Expert-comptable conserve
sa route publique lorsqu'elle est applicable, mais n'est pas composé dans les
fiches Système.

### Ressources des Systèmes

Ressources affiche les modèles et documents contextualisés les uns après les
autres, dans une grille verticale responsive. Les guides métier sont retirés
de cette surface pour simplifier l'application ; leurs données et anciennes
routes ne sont pas supprimées. Un cas concret contextuel peut être réactivé
ultérieurement lorsqu'il existe et a été validé éditorialement.

Les deux présentations universelles « Maîtriser les obligations et les finances
de son entreprise » et « La facturation électronique » sont masquées dans les
115 systèmes, sans supprimer leurs assets ni les anciennes livraisons.

### Contenus

`/contenus` devient l'annuaire canonique des contenus éditoriaux Demaa. La
première fiche publiée est `/contenus/facturation-electronique`, initialement
sous forme d'article et de diaporama de neuf slides. Une future vidéo enrichit
la même URL sans créer de doublon SEO.

### Académie

La surface publique temporaire affiche uniquement les `Cours`, alimentés par
le catalogue pédagogique structuré avec notions et quiz. Comme une seule
section est visible, aucun onglet n'est rendu.

Les `Tutoriels`, alimentés par les études de cas techniques `case-study`, et le
catalogue historique `Webinaires` restent masqués tant qu'une nouvelle décision
de publication ne les a pas réactivés. Leurs données, identifiants, assets et
routes directes sont conservés. Lors de la réactivation des Tutoriels, leur
présentation à miniature et leur parcours sans quiz seront restaurés, ainsi que
la navigation de sections.

La liste est verticale sur mobile et devient une grille sur desktop. Les
filtres reviennent à la ligne et aucun scroll horizontal n'est introduit.
Aucune vidéo ni aucun son ne démarre automatiquement.

Les modèles et documents restent rattachés aux Systèmes et ne sont pas
dupliqués dans l'Académie.

Les six formations en direct durent deux heures et coûtent 250 EUR HT. Les
dates sont explicitement validées avant publication et aucune restauration de
Stripe n'est prévue.

Les anciennes routes des cas restent canoniques. Elles ne sont ni renommées,
ni supprimées, ni copiées dans un nouveau stockage.

### Dérogation temporaire de lancement

Les `Tutoriels`, les `Webinaires` de l'Académie et « Cas concret » des
Ressources Système sont masqués par les indicateurs
centralisés de `src/lib/public-editorial-visibility.ts`.

Leurs catalogues, relations et routes sont conservés. Leur réactivation exige
une décision éditoriale, une recette desktop/mobile et la mise à jour des tests
de visibilité. Cette dérogation temporaire prévaut sur l'ordre public décrit
ci-dessus tant que les deux indicateurs restent désactivés.

## Parcours

- Automatisation des processus, Expert-comptable et Assistance facturation :
  CTA « Être rappelé » puis
  formulaire strict `entreprise + téléphone`.
- Marketing externalisé : CTA « Construire ma stratégie marketing » puis
  réservation existante d'un échange de trente minutes.
- Les fiches Services sont accessibles directement et via une interception
  modale partageable.

## Sources de vérité

- un seul catalogue actif pour les quatre Services ;
- un seul catalogue actif pour les Contenus ;
- Firebase reste la source distante autoritaire des Solutions tierces ;
- le fallback Solutions est généré depuis la révision Firebase active et ne se
  modifie jamais manuellement.

## Fournisseurs — lot séparé

La couverture fournisseurs sera enrichie par familles de métiers : besoin
réel, acteur et URL officielle, catégorie, pays, limites et date de contrôle.
Les placements sont préparés en brouillon puis validés avant activation. Alan,
Swile ou tout autre acteur ne sont que des candidats et ne sont jamais ajoutés
universellement.
