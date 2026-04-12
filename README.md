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

Une fois l'utilisateur authentifié, les actions qu'il pourra effectuer peuvent être regroupées en 2 catégories :
* Les actions relatives aux armoires.
* Les actions relatives aux rôles.

Comme la plupart des utilisateurs n'aura pas de permissions relatives aux rôles, et que les actions relatives aux rôles seront effectuées moins souvent que celles relatives aux armoires, il a été convenu que la page principale une fois l'utilisateur connecté sera celle des armoires.
Les différentes pages du site seront donc :
* Une page d'authentification
* Une page d'accueil une fois que l'utilisateur est authentifié, qui est donc la page de gestion des armoires, cette page contiendra :
  * Un composant pour chaque armoire
  * Un bouton pour ajouter une armoire
* Une page pour chaque armoire (décrite dans la partie contraintes de connexion)
* Une page de gestion des rôles, cette page contiendra :
  * Un composant pour chaque rôle
  * Un composant pour ajouter un rôle
* Une page pour chaque rôle (décrite dans la partie contraintes de connexion)