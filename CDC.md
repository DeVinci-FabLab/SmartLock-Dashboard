# Cahier des charges

## ACM (Access Control Matrix)

### Rôles

L'allocation des droits sur les armoires et stocks est gérée par un système de rôles. Les rôles sont **globaux** (définis au niveau du fablab, pas par armoire) et **codés en dur** dans le dashboard (pas configurables en base par l'utilisateur final). Liste par ordre de hiérarchie (du plus bas au plus haut) :

- **Createch** — membres « spéciaux », pas membres réguliers du fablab, traitement particulier (cf. note ci-dessous).
- **Membre** — étudiant inscrit au fablab.
- **Agent** — référent technique d'un pôle. Sous-rôles : FDM, SLA, SLS, électronique, textile.
- **Bureau** — membre du bureau associatif.
- **Responsable** — porte une responsabilité opérationnelle. Sous-rôle : matérialiste.
- **Comité de direction** (codir).
- **Trésorerie** — gère les achats et bons de commande.
- **Présidence**.
- **Administrateur système**.

> **Blacklist n'est pas un rôle.** Un compte « PNG / Externe » est un compte qui n'a aucun rôle assigné. L'absence de rôle suffit à le priver de tout accès (Zero Trust : aucun droit implicite). Si l'on veut tracer qu'un compte a été *activement* refusé, on attache un attribut `banned` au compte ; cela reste un attribut du compte, pas une ligne dans la grille des rôles.

> **Createch.** Membres « spéciaux », pas membres réguliers — traitement au cas par cas. **TODO** : préciser le périmètre (quelles armoires, quelle durée d'accès, quelle procédure d'attribution / révocation).

### Permissions (par armoire)

Pour un couple (rôle, armoire), on choisit **une valeur unique** dans cette énumération hiérarchique. Chaque niveau **inclut** les droits de tous les niveaux précédents (`can_edit` ⊃ `can_open` ⊃ `can_view`) :

1. **can_view** — voir le contenu de l'armoire (état du stock).
2. **can_open** — ouvrir l'armoire, ajouter ou retirer un item listé du stock. Donne aussi le droit de **consulter les journaux d'accès de cette armoire** (la consultation du journal est jugée plus sensible que la simple lecture du stock : on accepte de l'exposer à quelqu'un qui peut déjà manipuler physiquement le contenu, pas à un simple lecteur).
3. **can_edit** — modifier le catalogue et les fiches produit de cette armoire.

> Le quatrième niveau historique `can_manage` est **déplacé** : ce n'est plus une permission par armoire mais une propriété du rôle lui-même. Voir [Attributions](#attributions).

### Capacités spécifiques par rôle

En plus de la permission par armoire, certains rôles donnent accès à des **fonctionnalités spécifiques du dashboard**. Ces capacités sont **codées en dur** dans le dashboard (pas configurées en base), volontairement dénombrables et auditables :

- **Trésorerie**
  - Générer des feuilles / bons de commande à partir des alertes de stock bas.
  - Voir et configurer les références d'achat et fournisseurs.
- **Présidence**
  - Accès lecture complet au journal d'audit, toutes armoires confondues.
  - **TODO** — préciser les actions exclusives (purge encadrée ? validation budgétaire ?).
- **Comité de direction**
  - Accès lecture au journal d'audit transverse.
  - **TODO** — préciser.
- **Administrateur système**
  - Création / suppression d'armoires.
  - Configuration technique (seuils par défaut, gestion des références, infra).
  - Toutes actions admin techniques (rotation de secrets, etc.).
- **Matérialiste (Responsable)**
  - **TODO** — préciser le périmètre (gestion des stocks transverses, validation de catalogues ?).

> Ajouter une capacité = modifier le code du dashboard et l'associer à un rôle. Ce n'est pas configurable par l'utilisateur final.

### Attributions

Un utilisateur se voit assigner zéro, un ou plusieurs rôles. Chaque rôle possède une permission par armoire (cf. [Permissions](#permissions-par-armoire)).

**Règles d'attribution :**

- **Pas d'attribution discrète de permission à un utilisateur.** On n'assigne que des rôles ; les permissions découlent du rôle. Il n'existe aucun mécanisme pour donner `can_open` à un individu sur une armoire sans passer par un rôle.
- **Pas d'override manuel.** Un utilisateur n'a aucune permission sur une armoire sans rôle qui en accorde une.
- **Cumul de rôles, max gagne.** Si un utilisateur cumule plusieurs rôles donnant des permissions différentes sur la même armoire, la permission effective est la **plus élevée** dans l'énumération.

#### Gestion des rôles (`manages`)

Chaque rôle déclare, dans sa définition codée en dur, la liste des rôles qu'il peut **attribuer ou révoquer** à d'autres utilisateurs. C'est l'équivalent de l'ancien `can_manage`, mais porté **par le rôle lui-même** et non plus par un couple (rôle, armoire). La question posée est : « est-ce un rôle qui peut gérer les autres ? », pas « est-ce un rôle qui peut gérer cette armoire-là ? ».

Règles :

- Un rôle ne peut pas s'auto-attribuer ni s'auto-révoquer.
- Un rôle ne peut attribuer / révoquer que des rôles présents dans sa liste `manages`.
- Par convention, un rôle ne devrait gérer que des rôles **strictement inférieurs** dans la hiérarchie (à valider cas par cas).

**TODO** — figer la matrice `manages` complète. Proposition de départ à valider :

| Rôle                      | Peut attribuer / révoquer                                  |
| ------------------------- | ---------------------------------------------------------- |
| Administrateur système    | Tous                                                       |
| Présidence                | Tous sauf Administrateur système                           |
| Comité de direction       | Bureau, Trésorerie, Responsable, Agent, Membre, Createch   |
| Bureau                    | Responsable, Agent, Membre, Createch                       |
| Responsable (matér.)      | Agent, Membre                                              |
| Trésorerie                | _(aucun par défaut — rôle métier, pas rôle de gestion)_    |
| Agent / Membre / Createch | _(aucun)_                                                  |

### Exemple

Matrice illustrative — la permission par armoire reste un enum à 3 niveaux ; `can_manage` n'apparaît plus dans la matrice (déplacé au niveau du rôle, cf. tableau `manages` ci-dessus). Une cellule vide = aucun rôle accordant un accès = aucune permission.

| Rôle                | Armoire 1 | Armoire 2 | Armoire 3 |
| ------------------- | --------- | --------- | --------- |
| Createch            | can_view  |           |           |
| Membre              | can_view  | can_view  |           |
| Agent               | can_view  | can_open  |           |
| Bureau              | can_view  | can_open  | can_edit  |
| Responsable         | can_open  | can_open  | can_edit  |
| Comité de direction | can_edit  | can_edit  | can_edit  |

## Dashboard

Le dashboard doit pouvoir servir à :

### Management

- Voir la liste des rôles (lecture seule — les rôles sont codés en dur, non éditables en runtime).
- Voir la liste des utilisateurs.
- Créer / supprimer / éditer des utilisateurs.
- Assigner / retirer des rôles à des utilisateurs (selon la matrice `manages` du rôle de l'appelant).

> Note : la création / suppression / édition **des rôles eux-mêmes** n'est pas exposée dans le dashboard. Modifier un rôle = modifier le code.

### Stocks

- Créer / supprimer / éditer des armoires (réservé à Administrateur système).
- Voir / diagnostiquer l'état de connexion de toutes les armoires.
- Voir / éditer le contenu des armoires (selon permission par armoire).
- Voir les mouvements de stock récents par armoire.
- Voir les alertes de stocks bas.

### Items

- Les items comprennent des **références d'achat** (Amazon, RS, fournisseur direct, etc.).
- Définition de **seuils bas** par item / par armoire.
- La réception d'une alerte de stock bas déclenche un flag.
- Ce flag permet à la **Trésorerie** de générer des **feuilles de commande** (références d'achat + quantités à commander, configurable).
- **TODO** — détailler les champs d'une fiche item (nom, photo, unité, fournisseur, prix indicatif, localisation dans l'armoire, etc.).

## Authentification

**TODO** — résumé attendu, à étoffer :

- SSO Keycloak (realm `fablab`) — source de vérité pour les identités et les rôles.
- **Login dashboard** : OIDC Authorization Code + PKCE + OTP obligatoire.
- **Login armoire (panneau tactile)** : badge NFC. Le Raspberry Pi authentifie l'utilisateur via l'API d'auth.
- **API backend de référence** : [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) — toute la logique d'auth et d'autorisation côté serveur passe par cette API. Le dashboard ne parle jamais à Keycloak directement.
- L'élévation temporaire codir → admin (cf. divergence #5) doit être tranchée et documentée ici si conservée.

## Historique / Audit log

**TODO** — points à arbitrer :

- **Immuabilité** : append-only au niveau DB. Le rôle DB applicatif n'a ni `DELETE` ni `UPDATE` sur la table d'audit.
- **Exceptions de purge** : sous quelle procédure, qui (Présidence + comité de contrôle ?), avec quelle trace de la purge elle-même.
- **Consultation** :
  - `can_open` sur une armoire → consultation des journaux **de cette armoire**.
  - Présidence / Codir → consultation transverse.
- **Périmètre des événements tracés** : ouverture armoire (allowed + denied), modification stock, modification catalogue, attribution / révocation de rôle, élévation d'admin temporaire, génération de bon de commande.
- **Durée de rétention** : à définir (contrainte légale ? politique interne ?).

## Panneau tactile sur armoire

**TODO** — points à arbitrer :

- Authentification : badge NFC scanné → l'armoire interroge l'API (`POST /auth/locker/{id}/check`).
- Actions disponibles selon la permission retournée : voir stock, ajouter / retirer un item listé.
- Contraintes UI : gros boutons, navigation sans clavier physique, écran tactile.
- Comportement réseau dégradé : que se passe-t-il si l'API est injoignable (mode hors-ligne ? blocage strict ?).
- Confirmation visuelle de l'action (feedback sonore / lumineux ?).

## Affichage public / kiosque

**TODO** — points à arbitrer :

- URL publique, sans authentification, en lecture seule.
- Contenu : état d'ouverture du fablab, occupation, événements à venir, alertes en cours ?
- Comportement kiosque : plein écran, autorefresh, anti-veille.
- Aucun lien vers les vues authentifiées depuis l'affichage public.

## Workflow commandes (Trésorerie)

**TODO** — points à arbitrer :

- Déclenchement : alerte de stock bas → flag automatique sur l'item.
- Génération d'une feuille de commande : groupage par fournisseur, sélection manuelle des items flaggés.
- Format de sortie : PDF ? CSV ? ouverture d'un ticket dans un système externe ?
- Suivi d'état : `flag` → `en commande` → `reçu` → `clos`.
- Qui valide la commande (Trésorerie seule ? validation Présidence au-delà d'un seuil ?).

## Divergences à arbitrer avec l'API actuelle

L'API [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) existe déjà et présente plusieurs écarts avec le modèle cible décrit ci-dessus. À résoudre soit en ajustant l'API, soit en ajustant la cible.

1. **Permissions booléennes au lieu d'enum.** L'API stocke les permissions par armoire sous forme de colonnes booléennes indépendantes : `can_view`, `can_open`, `can_edit`, `can_take`, `can_manage` (cf. `docs/api-reference.md` → *Locker Permissions*).
   - Cible CDC : enum hiérarchique à 3 niveaux (`can_view < can_open < can_edit`).
   - Décision : soit ajuster le schéma (colonne `permission_level` enum + drop des booléens), soit conserver les booléens en imposant par convention dans le code applicatif l'invariant hiérarchique (« interdit de cocher `can_open` sans `can_view` »). La première option est plus saine.

2. **`can_take` non prévu par le CDC.** L'API distingue `can_open` (ouvrir physiquement) de `can_take` (sortir un item). Le CDC fusionne les deux dans `can_open` (« ouvrir + ajouter / retirer »). À trancher : garde-t-on la distinction ? Si oui, le CDC doit l'absorber.

3. **`can_manage` à la mauvaise granularité.** L'API a `can_manage` comme booléen par (subject, armoire). Le CDC cible le porte sur le rôle lui-même (cf. `manages`). À retirer de la table de permissions par armoire et déplacer dans la définition des rôles (côté code, pas en DB).

4. **Override par utilisateur dans l'API.** L'API supporte `subject_type: "user"` pour attribuer une permission spécifique à un utilisateur précis, contournant les rôles. Le CDC interdit ce mécanisme (« pas d'attribution discrète, pas d'override manuel »). À retirer de l'API — ou autoriser explicitement dans le CDC en documentant pourquoi.

5. **`/auth/elevate` (auto-promotion codir → admin).** L'API permet à un membre du codir de s'auto-promouvoir admin Keycloak temporairement. Non couvert par le CDC. À documenter explicitement dans la section [Authentification](#authentification) ou retirer.

6. **`valid_until` sur les permissions.** L'API supporte des permissions à durée limitée (`valid_until`, ISO 8601). Non couvert par le CDC. À garder (utile pour Createch et invités ponctuels) ou retirer.

7. **Liste des rôles incomplète côté Keycloak.** L'API documente les rôles `membre, 3d, electronique, textile, materialiste, codir, admin`. Manquent : `createch`, sous-rôles `agent_fdm / agent_sla / agent_sls`, `bureau`, `responsable` (distinct de `materialiste`), `tresorerie`, `presidence`. À aligner côté Keycloak avant que le dashboard puisse refléter le CDC. **Note** : `docs/system-design.md` du dépôt d'auth utilise encore une 3e liste (`woodshop-member`, `electronics-member`) — incohérence interne au backend à corriger.

8. **Périmètre de la matrice `manages` côté API.** L'API expose une matrice statique (`api-reference.md` → *Role Management*) : `Matérialiste` peut gérer `membre/3d` ; `Codir/Admin` peut gérer plus. Le CDC veut cette matrice en data dans le code du dashboard (cf. tableau `manages`). À aligner : une seule source de vérité, idéalement dans le code partagé (ou au minimum dupliquée à l'identique côté API et côté dashboard avec un test qui les compare).
