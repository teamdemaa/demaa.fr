# DEMAA / SINI — périmètre de migration

Statut : en cours, non publié. Décision utilisateur du 20 septembre 2026.

## Destination des parcours

| Parcours actuel | Destination | Règle |
| --- | --- | --- |
| `/a-reprendre` et ses fiches, comparatif et alertes | SINI > Reprendre | Conserver données et fonctionnement avant de changer marque ou URL. |
| `/transmettre` et formulaire vendeur | SINI > Vendre | Conserver l'offre actuelle ; « vendre » signifie céder l'entreprise. |
| `/tutoriels` (cinq articles de méthode publiés) | SINI > Conseil | Réutiliser les contenus sur `/conseil` et `/conseil/[slug]`, sans dupliquer les canoniques. |
| `/accompagnement` | SINI, lien depuis Conseil | Conserver le parcours distinct des articles et de la mise en relation gratuite. |
| `/organiser` et `/contenus` pertinents | DEMAA > Académie | Réutiliser le design de Méthodes, pas son catalogue de reprise/vente. |
| `/modeles` et pages de modèles | DEMAA > Académie, en contexte | Chaque modèle doit avoir un contenu pédagogique de rattachement avant mise en avant. Conserver ses URL et sa livraison. |
| `/outils` et `/solutions/[slug]` | DEMAA > Solutions | Réutiliser le hub et la fiche métier existants ; afficher tous les métiers et les catégories validées, jamais les brouillons en bloc. |
| `/specialistes` | DEMAA > Spécialistes | Route reliée à la navigation et conservée noindex jusqu'à vérification des profils/offres. |

DEMAA Studio et The Done Studio sont hors périmètre. Le dépôt DEMAA reste la
source du site actuel ; l'aperçu SINI existant est une branche séparée. Aucune
redirection inter-domaines ni modification DNS avant recette du site SINI.

## Portes de publication

Décisions complémentaires du 20 septembre 2026 : sini est exploité par la
même entreprise individuelle que DEMAA, avec `contact@sini.fr` comme adresse
de contact souhaitée. Cette adresse n'est pas considérée opérationnelle tant
que le domaine et la boîte n'ont pas été vérifiés. Les fournisseurs du
catalogue DEMAA ne font l'objet d'aucun accord commercial ; leur présence
doit être décrite comme un référencement indépendant, jamais comme un
partenariat. Le registre historique contient des fiches marquées
`commercialRelationship: unknown` et bloquées pour publication : la
confirmation de l'absence d'accord ne vaut pas validation automatique de
leurs informations, liens, prix ou pertinence métier.

Sur l'aperçu Vercel protégé, la fiche « cabinet comptable » ajoute uniquement
les sept outils du lot pilote D-091 déjà documentés, sans déplacer le pointeur
Firebase actif ni modifier le rendu de production. Les autres fiches restent
soumises à leur revue et à leur publication explicite.

1. Inventaire par URL et statut éditorial, avec successeur explicite.
2. Aperçu SINI fonctionnel, identité et couleur distinctes, contenus et
   formulaires vérifiés.
3. DEMAA Académie / Solutions / Spécialistes vérifiés ; aucune donnée brouillon
   exposée par la réactivation des catégories Solutions. Le relevé local D-091
   trouve des placements « fournisseur » publiés dans 3 métiers sur 115,
   mais il s'agit du même fournisseur legacy exclu du rendu public : aucun
   fournisseur de ce snapshot n'est encore prêt à afficher. Le catalogue
   nécessite une revue éditoriale, pas un simple toggle.
4. Contrôles de liens, SEO, canoniques, sitemap, formulaires, confidentialité,
   mobile, clavier et FR/EN uniquement là où le contenu est traduit.
5. Domaines et redirections activés en dernier, avec possibilité de retour
   arrière. `demaa.fr` et `www.demaa.fr` pointent déjà vers le projet Vercel
   `demaa-fr` : la propriété des deux noms a été vérifiée et le domaine sert
   encore l'ancienne version Reprendre / Vendre. Le nouveau travail local n'a
   pas été publié sur `demaa.fr`.
   Le commit de production `00e846f…` descend directement du `main`
   `9394b189…` et n'ajoute que `public/studio/index.html`. La branche de
   migration DEMAA a été avancée jusqu'à `00e846f…` pour préserver cette page
   telle quelle. Le nom SINI (S-I-N-I) a été confirmé dans la conversation ;
   son domaine reste à définir ; un projet Vercel `sini` distinct existe déjà,
   avec un aperçu protégé et sans variables applicatives.

## Ordre d'exécution et état

1. **Préserver l'existant — fait en local.** La branche DEMAA part du commit
   qui sert actuellement `demaa.fr` ; `/studio` est conservé à l'identique.
   Les branches DEMAA et SINI sont séparées, sans changement DNS ou Vercel.
2. **SINI — parcours locaux reliés.** `/` affiche directement Reprendre,
   `/transmettre` reste Vendre et `/conseil` expose les cinq méthodes avec
   leurs URL d'article. Les anciennes URL d'aperçu et `/a-reprendre` renvoient
   vers ces routes. La navigation arrondie et la palette argile sont visibles
   localement. Le domaine SINI n'étant pas défini, aucune redirection vers
   `demaa.fr` n'est appliquée par le proxy SINI et `robots.txt` interdit
   l'indexation tant que `SINI_CANONICAL_HOST` et l'origine canonique ne
   concordent pas. Restent à migrer les
   métadonnées, canoniques, sitemap, formulaires et e-mails hérités de DEMAA.
3. **DEMAA — parcours locaux reliés.** `/` ouvre `/solutions`, avec les onglets
   Académie / Solutions / Spécialistes. `/solutions` réutilise l'ancien hub
   Outils sans filtrer les métiers et `/solutions/[slug]` conserve le composant
   de fiche métier ; les rubriques fournisseurs, financement, aides et le
   quotidien du dirigeant sont raccordés selon les données disponibles.
   Académie relie contenus et modèles ; Spécialistes présente les sept offres
   existantes mais reste noindex. Le repli sur snapshot n'existe qu'en
   développement et est indiqué sur la page ; la production exige toujours
   le registre Firebase actif.
4. **Recette de migration — en cours.** Les deux dépôts compilent localement.
   `sini` passe 1 735 tests et son aperçu Vercel protégé répond comme attendu.
   `demaa` passe 1 738 tests et son aperçu protégé
   `dpl_AGi3Fhgsq1seqWqw3ym5YuJaE6Qq` est READY ; les routes `/academie`,
   `/solutions`, `/solutions/restaurant`, `/specialistes` et `/annuaire-coachs`
   répondent 200. La fiche Restaurant affiche bien ses outils et processus,
   mais aucun fournisseur approuvé. Le build local sans Firebase utilise le
   repli JSON ; l'aperçu Vercel doit rester la référence pour les données du
   registre actif. Revue éditoriale des fournisseurs et
   spécialistes, vérification des liens et de la sélection par métier ;
   vérification des parcours, consentements, formulaires, e-mails, données,
   mobile, accessibilité et SEO sur des déploiements de prévisualisation.
5. **Publication — à faire seulement après recette.** Publier SINI sur son
   projet et son domaine définitifs, vérifier les URL finales, puis modifier
   DEMAA et ses redirections depuis les anciennes URL Reprendre / Vendre /
   Méthodes. `demaa.fr` reste attaché au même projet Vercel : il faudra y
   déployer la nouvelle version validée, pas « rebrancher » le DNS.
