## Cahier des charges

### Mandatory

* Une WhiteList d'utilisateurs doit être créée pour permettre à certains badges d'ouvrir l'armoire.
* Le système de stockage numérique doit permettre l’utilisation de 25 items différents, tout en étant dimensionné pour en accueillir jusqu’à 100.
* Un historique des actions effectuées sur les stocks doit être créé, consultable et sauvegardé automatiquement.
* L'historique ne doit pas être effaçable (sauf par président et commité de contrôle) - point de discussion acces reu respo technique.
* Un panneau de contrôle tactile doit permettre de consulter et mettre à jour les stocks sur l'armoire.
* L'interface doit être graphiquement travaillée (front end) validée par les membres du Devinci Fablab (bureau).

### Important

* Des groupes d'utilisateurs doivent pouvoir être créés, et que chacun de ces groupes ait ses permissions et accès
* La WhiteList doit être modifiable par les personnes autorisées (point en début d'année) / CoDir et membres smartlock  
* Le systeme de stockage numérique doit comprendre tous les items présents dans l'armoire qui abrite le systeme

## Contraintes de connexion

Il doit donc exister une base de données contenant : 
* Le nom, le rôle, le mot de passe et l'identifiant de badge étudiant de tous les utimisateurs
* La liste des permissions associées à chaque rôle
* La liste des armoires avec les items  associés et leur quantité
* La liste des logs (l'historique des actions).

Cette base de données sera consultée à plusieurs occasions :

* Lors de l'authentification de l'utilisateur
  * Son nom
  * Son mot de passe
* Lorsque l'utilisateur arrive sur la page principale (une fois qu'il est authentifié)
  * Som nom pour l'afficher dans un message de bienvenue
  * Les permissions de son rôle pour déterminer les composants auxquels il a accès

Dans les cas suivants, on considère que l'accès de l'utilisateur à la page/au composant en question est déjà validé car il est déjà authentifié, les permissions de son rôle ne seront donc pas consultées à ces fins.

* Pour afficher une page "armoire"
  * Le nom de l'armoire
  * La liste des items de l'armoire et leur quantité
  * La liste des utilisateurs ayant accès à l'armoire
  * L'historique des actions effectuées sur l'armoire
* Pour afficher une page "rôle"
  * Le nom du rôle
  * La liste des permissions du rôle
  * La liste des utilisateurs possédant le rôle
 
## Visuels nécessaires

Une fois l'utilisateur authentifié, les fonctionnalités disponibles varient en fonction de ses permissions.

* Rôles membre, 3D, électronique, textile : sur le dashboard, ces 4 rôles ont les mêmes permissions, consulter les stocks des armoires à filament, des armoires électroniques et des armoires textiles. Il y aura donc un bloc pour chaque armoire auxquelles ces utilisateurs ont accès, et si une armoire est sélectionnée, une page affichera les détails des stocks de l'armoire.
* Rôle matérialiste : le matérialiste peut consulter les stocks des armoires à filament, des armoires électroniques, des armoires textile et des armoires bureau. Il peut aussi créer et supprimer des types d'item à l'intérieur de ces armoires. De même que pour les rôles précedemment cités, il y aura un bloc par armoire, mais lorsque l'une d'elles sera sélectionnée, la page spécifique à l'armoire affichera aussi un bouton pour ajouter des types d'items et un bouton à côté de chaque type d'item pour le supprimer (possible seulement s'il est en quantité 0). Le matérialiste peut aussi donner/révoquer les rôles membre et 3D, il pourra donc naviguer entre une page "Armoires" décrite ci dessus et une page "Rôles" où il pourra sélectionner un rôle parmi membre et 3D et y ajouter et supprimer des utilisateurs.
* Rôle codir : le codir a les mêmes permissions que le matérialiste à l'exception qu'il peut également donner et révoquer les rôles électronique, textile et matérialiste. Il peut par ailleurs donner à soi-même ou à un autre le rôle admin. Sur le dashboard, la page "Armoires" sera donc la même que pour le rôle matérialiste, et pour la page "Rôles", il sera possible de donner/révoquer les rôles membre, 3D, électronique, textile et matérialiste aux utilisateurs et de donner le rôle admin. Sous les blocs correspondant à chaque rôle, il y aura un bouton supplémentaire pour que l'utilisateur se donne le rôle admin pour une durée limitée.
* Rôle admin : sur la page "Armoires", l'admin a les mêmes permissions que le matérialiste et le codir à l'excepetion qu'il peut aussi ajouter/supprimer des armoires, il a donc un bouton "supprimer" présent sur la page de chaque armoire (uniquement possible si celle-ci est vide), et un bouton en bas de la page "Armoires" pour ajouter une nouvelle armoire. Sur la page "Rôles", l'admin peut donner et révoquer les rôles membre, 3D, électronique, textile, matérialiste et codir, il peut aussi donner le rôle admin. De même que pour le codir qui peut se donner le rôle admin, l'admin peut renoncer à son rôle grâce à un bouton situé en bas de la page "Rôles". Par ailleurs, l'admin peut supprimer les rôles, donc chaque page de rôle aura un bouton "supprimer" (uniquement possible si personne n'a le rôle, il est donc par conséquent impossible de supprimer le rôle admin), l'admin peut également créer un nouveau rôle grâce à un bouton présent sous les blocs des rôles. Enfin, l'admin peut modifier les permissions des rôles, il y aura donc un bouton "modifier les permissions" sur la page de chaque rôle qui une fois sélectionné permettra de cocher les différentes permissions pour les donner ou non au rôle.

