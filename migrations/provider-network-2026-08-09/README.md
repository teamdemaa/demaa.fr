# Retrait des placements universels Expert-comptable

Ce dossier reçoit le snapshot exact relu depuis Firebase avant toute suppression.
Le snapshot scellé est l'unique source autorisée pour le rollback des 114 documents
`expertise_placements/*:chartered-accountant`.

La migration ne retire pas la fiche d'expertise du catalogue et conserve le
placement explicite `cabinet-comptable:legal-formalist`. Le seed normal ne contient
plus aucun placement `chartered-accountant` et son plan d'import possède une garde
anti-réintroduction.

## Procédure scellée

1. Capturer les 114 documents distants avec `--capture-snapshot=<fichier>`.
2. Relire le fichier et confirmer son empreinte exacte avec
   `--confirm-snapshot=<sha256>`.
3. Supprimer avec le gate propre à la cible. Chaque suppression utilise la date de
   mise à jour relue avant le batch ; une modification concurrente fait échouer
   l'opération.
4. Vérifier que la requête `expertiseId == chartered-accountant` retourne zéro.
5. En cas de rollback, utiliser le même snapshot et le gate de rollback distinct.

La suppression Production refuse de démarrer sans
`--apply-provider-placement-removal-production`. Le rollback refuse de démarrer sans
`--apply-provider-placement-rollback-production`. Le fichier de snapshot doit venir
du projet confirmé ; un snapshot partiel, modifié ou portant une autre empreinte est
refusé.

## État du 9 août 2026

La procédure complète a été validée sur Firestore Emulator : 114 documents retirés,
zéro restant, puis 114 documents recréés depuis le snapshot de rollback. La lecture
Production a été tentée avec l'ADC locale, mais l'identité active n'a pas le droit
Firestore nécessaire (`PERMISSION_DENIED`). L'identité Vercel Production est un
reader sans clé et les variables sensibles ne sont pas exportables localement.

Par conséquent, aucun snapshot Production n'a été prétendu ni fabriqué, et aucune
suppression distante n'a été exécutée. La prochaine exécution doit disposer d'une
identité éphémère autorisée ; elle commencera obligatoirement par la capture exacte.
