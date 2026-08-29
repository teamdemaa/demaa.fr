# ADR 0025 - Domaine canonique Demaa.fr

- Statut : `validated`
- Date : 29 août 2026
- Portée : domaine public, SEO, authentification et intégrations OAuth

## Contexte

Le site était publié avec `demaa.co` comme domaine canonique tandis que
`demaa.fr` redirigeait vers lui. La marque, l'adresse e-mail opérationnelle et
le marché principal sont français. Le domaine `demaa.fr` devient donc la
destination publique unique.

## Décision

1. `https://demaa.fr` est l'unique origine canonique.
2. `demaa.co`, `www.demaa.co` et `www.demaa.fr` redirigent en permanent vers le
   même chemin et la même query sur `https://demaa.fr`, sans chaîne.
3. Les canoniques, Open Graph, JSON-LD, sitemap, robots, liens internes,
   documents générés et e-mails utilisent `demaa.fr`.
4. Les anciens domaines restent autorisés uniquement pour accepter les requêtes
   pendant la migration et assurer les redirections. Ils ne produisent aucun
   contenu indexable.
5. Firebase Auth autorise `demaa.fr`. Les callbacks OAuth Google et Google
   Drive utilisent leurs URL équivalentes sur `demaa.fr`.
6. Les redirections sont conservées au moins un an, idéalement sans échéance.

## Déploiement et SEO

- La migration conserve tous les chemins : chaque ancienne URL possède une
  destination individuelle équivalente.
- Le nouveau sitemap est publié sur `https://demaa.fr/sitemap.xml` et soumis
  dans la propriété Search Console `demaa.fr`.
- Après vérification des redirections, le changement d'adresse est déclaré de
  `demaa.co` vers `demaa.fr` dans Search Console.
- Les positions et l'indexation sont surveillées sur les deux propriétés
  pendant la période de migration.

## Critères d'acceptation

1. `demaa.fr` répond directement sans redirection ;
2. les trois variantes historiques répondent `301` ou `308` vers `demaa.fr` en
   conservant chemin et query ;
3. sitemap, robots, canoniques et données structurées ne contiennent aucune URL
   canonique en `.co` ;
4. les connexions Firebase et le bouton de copie Google Drive fonctionnent sur
   `demaa.fr` ;
5. tests, TypeScript, lint et build sont verts avant la bascule Vercel.
