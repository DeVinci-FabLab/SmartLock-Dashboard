# Cahier des charges

## ACM (Access Control Matrix)

### Rôles

Les rôles sont organisés en **tiers (niveaux hiérarchiques)**. Chaque tier peut contenir plusieurs **rôles pairs** : aucun ne manage l'autre, mais ils peuvent avoir des scopes et des permissions très différents.

Deux catégories selon le cycle de vie :

- **Rôles système** — codés en dur dans le dashboard, **immuables** : on ne peut ni les créer, ni les supprimer, ni les renommer. Ce sont les piliers structurels du fablab. Leurs permissions par armoire restent éditables comme pour tout autre rôle (cf. [Permissions](#permissions-par-armoire)), mais leur identité est garantie.
- **Rôles personnalisés** — créés, édités et supprimés via une vue dédiée du dashboard, par un compte de tier suffisant. Ils complètent la structure pour refléter la réalité opérationnelle (pôles techniques, responsables de domaines, programmes externes…), qui évolue dans le temps.

#### Structure des tiers

```plain
T5 — Technique       [Système]   Administrateur système
T4 — Présidence      [Système]   Présidence
T3 — Direction       [Système]   Comité de direction, Trésorerie                 (peer)
T2 — Direction op.   [Système]   Bureau   +   [Custom]   Resp. matérialiste,
                                 Resp. communication, Resp. formation             (peer)
T1 — Opérateurs      [Custom]    Agent FDM, Agent SLA, Agent SLS,
                                 Agent électronique, Agent textile                (peer)
T0 — Base            [Système]   Membre   +   [Custom]   Createch,
                                 Ingénieur de recherche                           (peer)
```

#### Rôles système (immuables — 6 rôles)

| Tier | Rôle                   | Description                                                        |
| ---- | ---------------------- | ------------------------------------------------------------------ |
| T5   | Administrateur système | Infra, configuration technique, création / suppression d'armoires. |
| T4   | Présidence             | Sommet de la gouvernance opérationnelle.                           |
| T3   | Trésorerie             | Gestion des achats et bons de commande.                            |
| T3   | Comité de direction    | Gouvernance opérationnelle.                                        |
| T2   | Bureau                 | Bureau associatif étudiant du fablab.                              |
| T0   | Membre                 | Étudiant inscrit au fablab.                                        |

Ces 6 rôles sont **les seuls** garantis d'exister dans toute instance du dashboard. Ils ne sont **pas supprimables**. Leurs capacités spécifiques (cf. [Capacités spécifiques par rôle](#capacités-spécifiques-par-rôle)) sont aussi codées en dur.

#### Rôles personnalisés (gestion via dashboard)

Rôles ajoutables, éditables et supprimables par un compte autorisé. Couvrent typiquement :

- **Direction opérationnelle (T2, peer Bureau)** : Resp. matérialiste, Resp. communication, Resp. formation. Tous seedés au démarrage avec `manager = false` et `role_admin = false` — ce sont des rôles métier (domaines), la gestion des memberships passe par Bureau qui porte le flag `manager` au T2.
- **Opérateurs (T1)** : Agent FDM, Agent SLA, Agent SLS, Agent électronique, Agent textile. Tous `manager = false`, `role_admin = false`.
- **Base (T0, peer Membre)** : Createch, Ingénieur de recherche, et autres programmes spéciaux à venir. Tous `manager = false`, `role_admin = false`.

La liste donnée ci-dessus est une **proposition de départ** à instancier au démarrage du fablab — rien n'est codé en dur côté dashboard.

**Qui peut créer / éditer / supprimer un rôle personnalisé :** tout compte ayant un rôle avec le flag `role_admin = true` (cf. [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin)). Par défaut, les rôles système qui portent ce flag sont **Comité de direction, Présidence et Administrateur système**. Ce flag est aussi attribuable aux rôles personnalisés à leur création — Codir peut donc déléguer cette capacité en créant un rôle custom `role_admin = true`.

**Création d'un rôle personnalisé** : l'auteur (un compte ayant un rôle avec `role_admin = true`) fournit :

1. **Nom** unique (slug + label d'affichage).
2. **Tier** d'attachement (T0..T4 ; T5 réservé à Admin sys, unique). Doit être **≤ au tier du rôle appelant**.
3. **Permissions par armoire** initiales (cf. [Permissions](#permissions-par-armoire)) — initialisables à ∅ partout, éditables ensuite.
4. **Flag `manager`** (toggle) : si activé, ce rôle peut attribuer / révoquer des rôles utilisateurs aux tiers **strictement inférieurs** au sien (cf. [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin)).
5. **Flag `role_admin`** (toggle) : si activé, ce rôle peut créer / éditer / supprimer des rôles personnalisés aux tiers ≤ au sien (cf. même section).
6. **Capacités spécifiques** activées (choisies dans la liste fixe des capacités existantes — cf. [Capacités spécifiques par rôle](#capacités-spécifiques-par-rôle)).

**Contraintes :**

- Un compte peut créer un rôle avec `manager = true` ou `role_admin = true` seulement s'il dispose lui-même de l'autorité correspondante — pas de privilege escalation par création de rôle.
- **Suppression d'un rôle personnalisé attribué à des comptes** :
  - **Par défaut, refus** — il faut d'abord retirer le rôle de tous les utilisateurs qui l'ont, puis supprimer le rôle vide.
  - **Cascade autorisée** pour Présidence et Administrateur système uniquement : ils peuvent forcer la suppression, ce qui retire le rôle de tous les utilisateurs concernés en une opération (tracée dans l'audit log).
- **Auto-destruction interdite.** Si l'appelant tente de supprimer un rôle qui est sa seule source d'autorité `role_admin` (i.e. il perdrait l'autorité d'annuler l'opération), l'API refuse la suppression avec `403 detail: "self_destruction_forbidden"`. L'appelant doit d'abord se voir attribuer un autre rôle `role_admin` par quelqu'un d'autre, ou faire faire la suppression par un autre détenteur de `role_admin`.
- **Suppression d'un rôle système : refus systématique**, pour quiconque, y compris Admin sys. Les rôles système sont seedés à l'installation et ne sont jamais supprimables. Seuls leur `label` d'affichage et leurs permissions par armoire sont éditables.

#### Rôles pairs au sein d'un tier

Les rôles d'un même tier sont **pairs** : aucun ne manage l'autre. Mais leurs scopes et permissions peuvent être très différents — c'est la matrice (rôle × armoire) (cf. [Permissions](#permissions-par-armoire)) qui matérialise concrètement ces différences :

- Tous les Agents sont T1, mais Agent FDM a typiquement `can_open` sur les armoires FDM uniquement, Agent SLA sur les armoires SLA, etc.
- Codir et Trésorerie sont tous deux T3 : pairs hiérarchiquement, mais Trésorerie a des capacités métier spécifiques (bons de commande) que Codir n'a pas — et inversement Codir a un accès lecture transverse à l'audit log.
- Bureau (système) et les Responsables (custom) sont tous T2 : pairs, mais Bureau a un scope général sur la vie associative et les Responsables ont chacun leur domaine (com, formation, matérialiste…).
- Créatech et Ingénieur de recherche sont tous deux T0 (peer Membre) : aucun ne manage l'autre, mais leurs accès armoires diffèrent fortement (Ing. de recherche typiquement `can_open` sur des armoires de projets, Createch plus restreint).

Le **scope** d'un rôle n'est pas un champ séparé : il se manifeste dans la matrice des permissions et dans les capacités spécifiques.

#### Cumul des rôles

Un utilisateur peut avoir **n'importe quelle combinaison de rôles** (système, personnalisé, à n'importe quel tier). Aucune contrainte d'exclusion entre tiers ou entre catégories — les flags [`manager` et `role_admin`](#gestion-des-rôles-toggles-manager-et-role_admin) combinés au tier sont la seule barrière.

Pour chaque action, on prend l'**union des droits** accordés par chacun des rôles de l'utilisateur :

- Permission effective sur une armoire = **max sur l'enum** (`can_view < can_open < can_edit`) parmi tous les rôles, tous tiers confondus.
- Capacités spécifiques : si au moins un rôle donne une capacité, l'utilisateur l'a.

Ajouter un rôle ou un tier plus tard ne change rien à cette logique — l'union continue de fonctionner automatiquement.

### Cycle de vie d'un compte

Indépendamment des rôles, chaque compte a un **statut** logique parmi :

- **active** — compte normal. Ses rôles s'appliquent.
- **revoked** — compte conservé mais bloqué. Aucune authentification possible, ni dashboard ni badge NFC. **Les rôles restent attachés** (soft revoke) pour permettre une restauration rapide sans avoir à les ressaisir.
- **deleted** — suppression définitive. Irréversible.

> **Important : le statut n'est pas un champ stocké.** Il est **dérivé** de l'état du compte côté Keycloak (existence + flag natif `enabled`). Aucune colonne `status` n'est ajoutée à la base de données locale, aucune synchronisation à maintenir — **Keycloak est la source de vérité unique**.
>
> | Statut CDC | Représentation Keycloak                |
> | ---------- | -------------------------------------- |
> | `active`   | utilisateur existe, `enabled: true`    |
> | `revoked`  | utilisateur existe, `enabled: false`   |
> | `deleted`  | utilisateur n'existe pas (hard delete) |

**Transitions :**

- `active → revoked` : action « révoquer ». Réversible. L'utilisateur ne peut plus rien faire mais son compte et ses rôles sont préservés.
- `revoked → active` : action « restaurer ». L'utilisateur retrouve immédiatement ses rôles d'avant la révocation.
- `active | revoked → deleted` : action « supprimer définitivement ». Le compte disparaît de Keycloak.

**Flux d'écriture (dashboard → API → Keycloak) :**

Le dashboard ne stocke jamais le statut. Il déclenche une action via l'API d'auth, qui modifie directement l'état Keycloak. Le dashboard affiche ensuite le statut en relisant l'état Keycloak (via les endpoints existants `GET /users`).

```plain
[Dashboard] ──action──► [API SmartLock] ──Keycloak Admin API──► [Keycloak]
                                          (PUT enabled=false / true)
                                          (DELETE)
```

Endpoints API attendus (cf. [divergence #9](#divergences-à-arbitrer-avec-lapi-actuelle)) :

| Action    | Endpoint dashboard         | Effet côté Keycloak                                         |
| --------- | -------------------------- | ----------------------------------------------------------- |
| Révoquer  | `POST /users/{id}/revoke`  | `PUT /admin/realms/fablab/users/{id}` avec `enabled: false` |
| Restaurer | `POST /users/{id}/restore` | `PUT /admin/realms/fablab/users/{id}` avec `enabled: true`  |
| Supprimer | `DELETE /users/{id}`       | `DELETE /admin/realms/fablab/users/{id}` (hard delete)      |

> Le terme **PNG / Externe** du CDC d'origine recouvre deux situations différentes, aucune des deux n'étant un rôle :
>
> 1. Un ancien membre **revoked** — son compte existe encore, il est juste bloqué. Restaurable.
> 2. Une personne qui n'a jamais eu de compte — pas modélisée dans le système, simplement absente.
>
> Il n'y a donc pas besoin de « rôle Blacklist » ni de « rôle minimal que tout le monde a » : le statut du compte est orthogonal aux rôles, et l'absence de compte = absence du système.

> **Note sur le hard revoke.** Le modèle décrit est volontairement _soft_ : la révocation préserve les rôles. Si un incident futur le justifie, on pourra durcir le modèle en retirant aussi les rôles au moment de la révocation (et en les stockant dans un attribut `previous_roles` en lecture seule pour la restauration). Pas nécessaire au démarrage.

**Qui peut faire quoi sur le cycle de vie d'un compte** (règles hard-codées, distinctes du flag `manager` qui ne porte que sur l'attribution de rôles) :

| Action                            | Rôles autorisés                            | Notes                                                                                      |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Révoquer (active → revoked)       | Comité de direction, Présidence, Admin sys | Réversible. Hard-codé, non dérivé de `manager`.                                            |
| Restaurer (revoked → active)      | Comité de direction, Présidence, Admin sys | Symétrique à la révocation.                                                                |
| Supprimer définitivement (delete) | Présidence, Admin sys                      | Action irréversible. Codir exclu — garde-fou de symétrie avec le cascade-delete des rôles. |

### Permissions (par armoire)

Pour un couple (rôle, armoire), on choisit **une valeur unique** dans cette énumération hiérarchique. Chaque niveau **inclut** les droits de tous les niveaux précédents (`can_edit` ⊃ `can_open` ⊃ `can_view`) :

1. **can_view** — voir le contenu de l'armoire (état du stock).
2. **can_open** — ouvrir l'armoire, ajouter ou retirer un item listé du stock. Donne aussi le droit de **consulter les journaux d'accès de cette armoire** (la consultation du journal est jugée plus sensible que la simple lecture du stock : on accepte de l'exposer à quelqu'un qui peut déjà manipuler physiquement le contenu, pas à un simple lecteur).
3. **can_edit** — modifier le catalogue et les fiches produit de cette armoire.

> Le quatrième niveau historique `can_manage` est **déplacé** : ce n'est plus une permission par armoire mais une propriété du rôle lui-même. Voir [Attributions](#attributions).

### Capacités spécifiques par rôle

En plus de la permission par armoire, certains rôles donnent accès à des **fonctionnalités spécifiques du dashboard** (bons de commande, audit log transverse, gestion d'armoires…). Ces capacités sont **codées en dur** dans le dashboard, volontairement dénombrables et auditables. Ajouter une **nouvelle capacité** = modifier le code.

**Association capacité → rôle :**

- **Rôles système** : association codée en dur, immuable. Trésorerie a toujours « bons de commande », Admin sys a toujours « création d'armoires », etc.
- **Rôles personnalisés** : association **configurable** à la création / édition du rôle, choisie dans la liste fixe des capacités existantes. Ce qui est configurable par l'utilisateur final, c'est uniquement quels rôles personnalisés disposent des capacités déjà définies — pas l'introduction de nouvelles capacités.

**Capacités attribuées aux rôles système :**

- **Trésorerie**
  - Générer des feuilles / bons de commande à partir des alertes de stock bas.
  - Voir et configurer les références d'achat et fournisseurs.
- **Présidence**
  - Accès lecture complet au journal d'audit, toutes armoires confondues.
  - Cascade-delete d'un rôle personnalisé attribué à des comptes (override de la politique de refus par défaut, cf. [Rôles personnalisés](#rôles-personnalisés-gestion-via-dashboard)).
- **Comité de direction**
  - Accès lecture au journal d'audit transverse.
  - Toutes les autres prérogatives du Codir passent par ses flags `manager` et `role_admin` au T3 (cf. [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin)) — pas de capacité dédiée supplémentaire.
- **Administrateur système**
  - Création / suppression d'armoires.
  - Configuration technique (seuils par défaut, gestion des références, infra).
  - Toutes actions admin techniques (rotation de secrets, etc.).

**Capacités attendues sur des rôles personnalisés** (à activer au cas par cas via le dashboard) :

- **Responsable matérialiste** (rôle custom seedé au démarrage avec `manager = false`, `role_admin = false`) :
  - **Validation des catalogues d'items** : toute modification du catalogue (création / édition / suppression d'items, modification de seuils par item) doit être validée par un Resp. matérialiste avant d'être persistante.
  - **Gestion des seuils de stock bas globalement** : peut configurer les seuils d'alerte (transverse, sur toutes les armoires) qui déclenchent la génération potentielle d'un bon de commande Trésorerie. Distinct des « seuils par défaut » système gérés par Admin sys.

### Attributions

Un utilisateur se voit assigner zéro, un ou plusieurs rôles. Chaque rôle possède une permission par armoire (cf. [Permissions](#permissions-par-armoire)).

**Règles d'attribution :**

- **Pas d'attribution discrète de permission à un utilisateur.** On n'assigne que des rôles ; les permissions découlent du rôle. Il n'existe aucun mécanisme pour donner `can_open` à un individu sur une armoire sans passer par un rôle.
- **Pas d'override manuel.** Un utilisateur n'a aucune permission sur une armoire sans rôle qui en accorde une.
- **Cumul de rôles, max gagne.** Si un utilisateur cumule plusieurs rôles donnant des permissions différentes sur la même armoire, la permission effective est la **plus élevée** dans l'énumération.

#### Gestion des rôles (toggles `manager` et `role_admin`)

Chaque rôle porte **deux flags booléens orthogonaux**, qui répondent à deux questions distinctes :

| Toggle       | Question                                                                   |
| ------------ | -------------------------------------------------------------------------- |
| `manager`    | « ce rôle peut-il **ajouter / retirer un autre utilisateur** d'un rôle ? » |
| `role_admin` | « ce rôle peut-il **créer / éditer / supprimer un rôle** lui-même ? »      |

Ils sont indépendants : un rôle peut avoir l'un, l'autre, les deux, ou aucun.

**Toggle `manager` — gestion des memberships utilisateurs :**

- Si `true`, ce rôle peut attribuer ou révoquer **tout autre rôle dont le tier est strictement inférieur** au sien.
- **Tiers pairs ne se gèrent pas.** Codir (T3 manager) ne peut **pas** révoquer une Trésorerie ni une autre Codir (T3 peers). Pour toucher un rôle au tier N, il faut un appelant manager au tier > N. Conséquence : seul Présidence (T4) peut révoquer un Codir ou une Trésorerie ; seul Admin sys (T5) peut révoquer une Présidence.
- **Cas particulier au sommet** : Admin sys (T5) est unique mais peut révoquer un autre Admin sys (puisqu'il n'y a pas de tier au-dessus). Un seul Admin sys suffit pour toute action — pas de garde-fou « 2 admins requis ».
- Idempotence : attribuer un rôle déjà détenu est un no-op silencieux ; révoquer un rôle non détenu retourne une 404.

**Toggle `role_admin` — gestion du catalogue de rôles :**

- Si `true`, ce rôle peut créer, éditer ou supprimer un **rôle personnalisé** au tier ≤ son propre tier.
- Les **rôles système** sont protégés : ni édition (sauf `label` et permissions par armoire), ni suppression, ni renommage — même pour Admin sys.
- Cascade-delete sur un rôle qui a des utilisateurs : réservé à Présidence et Admin sys, indépendamment de `role_admin` (cf. [Création d'un rôle personnalisé](#rôles-personnalisés-gestion-via-dashboard)).

**Toggles des rôles système (codés en dur) :**

| Tier | Rôle                   | `manager` | `role_admin` | Notes                                            |
| ---- | ---------------------- | --------- | ------------ | ------------------------------------------------ |
| T5   | Administrateur système | ✅        | ✅           | Tout pouvoir, gestion + catalogue.               |
| T4   | Présidence             | ✅        | ✅           | Tout sauf édition d'Admin sys.                   |
| T3   | Comité de direction    | ✅        | ✅           | Gère memberships et catalogue jusqu'à T3 inclus. |
| T3   | Trésorerie             | ❌        | ❌           | Rôle métier (achats, bons de commande).          |
| T2   | Bureau                 | ✅        | ❌           | Gère des memberships T1/T0, pas le catalogue.    |
| T0   | Membre                 | ❌        | ❌           | Rôle de base.                                    |

**Lectures clés :**

- **Trésorerie reste un rôle métier** : `manager = false` ET `role_admin = false`.
- **Bureau peut gérer des memberships mais pas créer de rôles** : `manager = true`, `role_admin = false`. Un Bureau peut promouvoir un Membre Agent FDM (T1 < T2), mais ne peut pas créer ou supprimer le rôle « Agent FDM » lui-même.
- **Codir est le premier rôle qui gère le catalogue de rôles** : `role_admin = true`. C'est le seuil d'autorité pour créer / éditer / supprimer des rôles custom. Au-dessus, Présidence et Admin sys héritent de cette capacité.
- **Les deux toggles sont configurables sur les rôles custom** : un Responsable custom peut être créé avec ou sans `manager`, avec ou sans `role_admin`. Si on crée un Responsable avec `role_admin = true` au T2, ce responsable pourra créer des rôles custom à T0/T1/T2 — décision à prendre à la création.

### Exemple

Matrice illustrative pour 3 armoires. La permission par armoire reste un enum à 3 niveaux ; `can_manage` n'apparaît plus (déplacé au niveau du rôle via les flags `manager` / `role_admin`, cf. [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin)). Cellule vide = aucun accès accordé par ce rôle (le rôle ne voit pas l'armoire).

| Tier | Rôle                     | Système / Custom | Armoire FDM | Armoire SLA | Armoire transverse |
| ---- | ------------------------ | ---------------- | ----------- | ----------- | ------------------ |
| T3   | Comité de direction      | Système          | can_edit    | can_edit    | can_edit           |
| T3   | Trésorerie               | Système          | can_view    | can_view    | can_view           |
| T2   | Bureau                   | Système          | can_view    | can_view    | can_view           |
| T2   | Responsable matérialiste | Custom           | can_open    | can_open    | can_edit           |
| T2   | Responsable com          | Custom           |             |             | can_view           |
| T1   | Agent FDM                | Custom           | can_open    |             |                    |
| T1   | Agent SLA                | Custom           |             | can_open    |                    |
| T0   | Membre                   | Système          | can_view    | can_view    | can_view           |
| T0   | Createch                 | Custom           | can_view    |             |                    |
| T0   | Ingénieur de recherche   | Custom           |             |             | can_open           |

**Lecture :**

- Agent FDM peut ouvrir l'armoire FDM mais ne voit même pas SLA (scope par pôle).
- L'Ingénieur de recherche n'a accès qu'à l'armoire transverse (scope projet de recherche).
- Createch a un accès très limité (seulement la lecture d'une armoire spécifique).
- Le Responsable matérialiste a un scope transverse (peut éditer le catalogue de toutes les armoires).
- Codir et Trésorerie sont au même tier mais leurs permissions diffèrent — Codir a `can_edit` partout, Trésorerie seulement `can_view` (sa valeur ajoutée est ailleurs : capacités spécifiques, cf. bons de commande).

## Dashboard

Le dashboard doit pouvoir servir à :

### Management

- Voir la liste des rôles (système et personnalisés), avec leur tier, leurs flags `manager` / `role_admin` et leurs capacités.
- Voir la liste des utilisateurs.
- Créer / supprimer / éditer des utilisateurs.
- Assigner / retirer des rôles à des utilisateurs : nécessite un rôle avec `manager = true` ET tier > tier du rôle cible (cf. [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin)).
- **Créer / éditer / supprimer des rôles personnalisés** : nécessite un rôle avec `role_admin = true` ET tier ≥ tier du rôle modifié (par défaut Codir, Présidence, Admin sys, mais configurable via rôles custom).

> Note : les **6 rôles système** ne sont pas supprimables ni renommables depuis le dashboard. Seuls leurs permissions par armoire et `label` d'affichage sont éditables. Leurs flags `manager` / `role_admin` sont codés en dur et non modifiables.

### Stocks

- Créer / supprimer / éditer des armoires (réservé à Administrateur système).
- Voir / diagnostiquer l'état de connexion de toutes les armoires.
- Voir / éditer le contenu des armoires (selon permission par armoire).
- Voir les mouvements de stock récents par armoire.
- Voir les alertes de stocks bas.

### Items

**Champs d'une fiche item :**

| Champ                 | Type / format                                  | Notes                                                                                                                                                                                            |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`                | string (1-255)                                 | Existant côté API.                                                                                                                                                                               |
| `reference`           | string (1-50)                                  | Référence interne. Existant côté API.                                                                                                                                                            |
| `description`         | string, optionnel                              | Existant.                                                                                                                                                                                        |
| `category_id`         | FK → categories                                | Existant.                                                                                                                                                                                        |
| `photo`               | clé d'objet dans le storage `rustfs`           | **Nouveau.** Pour identification visuelle au stockage / sur le panneau tactile. Upload géré via le dashboard, stocké dans le service `rustfs` (cf. [Stockage des assets](#stockage-des-assets)). |
| `purchase_refs`       | liste de `{ supplier, url, price_indicative }` | **Nouveau.** Références d'achat externes (Amazon, RS, fournisseur direct…). Utilisé pour générer les bons de commande Trésorerie.                                                                |
| `low_stock_threshold` | int, global par item                           | **Nouveau.** Quantité en dessous de laquelle une alerte est levée. Champ unique au niveau de l'item, **pas par armoire** (choix de simplicité — la même réf est traitée pareil partout).         |
| `unit_measure`        | string, défaut `"units"`                       | Côté `/stock` aujourd'hui. À harmoniser : probablement migrer sur l'item plutôt que sur le stock entry.                                                                                          |

**Workflow stock bas :**

- Une mesure de stock sur une armoire qui descend sous `item.low_stock_threshold` lève une alerte.
- L'alerte agrège toutes les armoires concernées pour le même item (la Trésorerie voit « il manque X unités de l'item Y, présent dans armoires A, B »).
- L'alerte alimente le workflow de génération de bon de commande (cf. [Workflow commandes (Trésorerie)](#workflow-commandes-trésorerie)).

## Stockage des assets

Le projet déploie un service d'**object storage S3-compatible** : [**rustfs**](https://github.com/rustfs/rustfs) (drop-in replacement de MinIO). Il fait partie du compose du projet.

**Contenu stocké :**

- **Photos d'items** (référencées par `item.photo`).
- **Fichiers CSV générés** par le workflow Trésorerie (cf. [Workflow commandes](#workflow-commandes-trésorerie)) — conservés pour archivage.
- Tout autre asset binaire qui apparaîtrait plus tard (logos, exports, etc.).

**Accès :**

- L'API SmartLock détient les credentials du bucket et est le seul à écrire dans rustfs.
- Le dashboard récupère les assets via des URLs signées (S3 presigned URLs) émises par l'API, valables un temps court — pas d'accès anonyme direct au bucket.
- Les CSV peuvent être téléchargés depuis le dashboard via la même mécanique d'URL signée.

**TODO** — choisir les buckets et la convention de nommage des clés au moment du déploiement (`items/{item_id}/photo.jpg`, `orders/{order_id}.csv`, etc.).

## Authentification

**Source de vérité** : Keycloak (realm `fablab`) pour les identités et les rôles. L'API [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) est le seul client de Keycloak. Le dashboard ne parle jamais à Keycloak directement — il passe systématiquement par l'API.

### Login dashboard

- **OIDC Authorization Code + PKCE** — client public Keycloak `smartlock-dashboard`, pas de secret côté navigateur.
- **OTP obligatoire à partir du tier T2** (Bureau, Responsables, et tous les rôles au-dessus). Les comptes T0 (Membre, Createch, Ing. de recherche) et T1 (Agents) sont dispensés. La configuration OTP est forcée par Keycloak au premier login d'un compte qui passe à T2+.
- **Durée de session** : valeurs par défaut Keycloak (access ~5min, refresh ~30min, SSO session ~10h). À ajuster ultérieurement si besoin, configuration côté realm.

### Login armoire (panneau tactile)

- **Badge NFC** scanné par le Raspberry Pi.
- Le Pi appelle `POST /auth/locker/{id}/check` sur l'API d'auth avec son propre service account `smartlock-lockers`.
- L'API recherche l'utilisateur par `card_id` côté Keycloak, vérifie le flag `enabled` (cf. divergence #10), lit les rôles, calcule les permissions, écrit l'entrée d'audit, et renvoie la décision.

### Élévation de privilèges

**Pas d'élévation par auto-promotion.** L'endpoint `/auth/elevate` actuel de l'API (Codir → Admin sys temporaire) est **retiré** (cf. divergence #5). Si un Codir a besoin de droits Admin sys ponctuellement, un Admin sys lui attribue le rôle explicitement, l'opération est tracée, puis il est révoqué après usage. Pas de break-glass auto-administré.

### Tableau récapitulatif

| Surface          | Méthode                                            | Auth requise (côté Keycloak)         |
| ---------------- | -------------------------------------------------- | ------------------------------------ |
| Dashboard        | OIDC Auth Code + PKCE                              | Password + OTP si tier ≥ T2          |
| API service      | Client credentials (`smartlock-api`)               | Secret client (server-side only)     |
| Armoire / NFC    | Client credentials (`smartlock-lockers`) + card_id | Secret client + badge NFC enregistré |
| Affichage public | Aucune                                             | _(pas d'auth, lecture only)_         |

## Historique / Audit log

### Immuabilité

- Table d'audit **append-only au niveau DB**. Le rôle DB applicatif (utilisé par l'API en runtime) n'a **ni `DELETE` ni `UPDATE`** sur la table. Garanti au niveau PostgreSQL via les `GRANT`s.
- Seul un rôle DB séparé (`audit_admin`, utilisé uniquement par Admin sys lors d'opérations techniques) dispose des droits destructifs.

### Périmètre des événements tracés

Chaque événement est enregistré avec : `actor_user_id`, `actor_card_id` (si applicable), `event_type`, `target_*` (entité concernée), `timestamp`, `result` (allowed/denied/error), `metadata` (JSON libre).

| Catégorie               | Événements                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Accès armoires**      | Scan NFC (autorisé + refusé), avec raison si refusé (`no_permission`, `account_revoked`, `card_not_registered`, etc.). |
| **Mouvements de stock** | Ajout, retrait, ajustement de quantité sur une stock entry.                                                            |
| **Catalogue**           | Création / édition / suppression d'item, de catégorie, modification de seuil bas.                                      |
| **Cycle de vie compte** | Révocation, restauration, suppression définitive d'un compte.                                                          |
| **Cycle de vie rôle**   | Création / édition / suppression d'un rôle personnalisé (toggle `manager` ou `role_admin` modifié inclus).             |
| **Attribution de rôle** | Grant / revoke d'un rôle à un utilisateur (système ou custom).                                                         |
| **Trésorerie**          | Génération d'un bon de commande, validation, changement de statut.                                                     |

### Consultation

- **`can_open` sur une armoire** → consultation des journaux **de cette armoire** uniquement.
- **Comité de direction, Présidence, Admin sys** → consultation transverse (toutes armoires + tous événements non-armoire). Capacité documentée dans [Capacités spécifiques par rôle](#capacités-spécifiques-par-rôle).
- Aucune action ne peut être consultée par l'acteur lui-même si elle n'est pas couverte par les règles ci-dessus — pas d'auto-consultation directe (un Membre ne voit pas sa propre liste de scans, sauf via une armoire sur laquelle il a `can_open`).

### Rétention et purge

- **Rétention indéfinie par défaut.** L'audit log n'est **jamais purgé automatiquement**. La taille de la table est acceptée comme contrainte (estimation à faire au déploiement, mais sur la volumétrie attendue d'un fablab interne, ce n'est pas un sujet bloquant).
- **Purge interdite hors maintenance technique.** Aucun rôle applicatif (y compris Présidence) ne peut purger ou éditer l'audit log via le dashboard.
- **Seule exception** : Admin sys peut intervenir au niveau DB (rôle `audit_admin` séparé, pas exposé en API) pour des raisons strictement techniques (corruption, migration, archivage). Cette intervention est tracée **hors de l'audit log lui-même** (log système / journal d'infra Admin sys), pour éviter le paradoxe « la purge purge sa propre trace ».
- Si une demande RGPD se présente, c'est une décision Présidence + Admin sys au niveau infra, pas une feature dashboard.

## Panneau tactile sur armoire

**Hors scope de ce projet.** Le panneau tactile (Raspberry Pi + écran + lecteur NFC) est géré par un projet matériel séparé qui consomme l'API d'auth. Ce CDC ne le spécifie pas.

Les seuls points d'interaction avec le dashboard sont :

- L'API d'auth (`SmartLock-Authentication-Authorization`) est partagée et doit refléter le modèle ACM décrit ici (divergences #1-#11).
- Le dashboard affiche l'état de connexion de toutes les armoires (cf. [Stocks](#stocks)).
- Le dashboard consulte les journaux d'accès NFC via l'audit log (cf. [Historique / Audit log](#historique--audit-log)).

## Page d'accueil (non authentifiée)

Ce n'est **pas un kiosque vitrine** du fablab. Le dashboard est un outil interne d'administration ; la racine publique sert uniquement à présenter brièvement le projet et à inviter les comptes autorisés à se connecter.

**Contenu de la page `/` (non authentifiée) :**

- Présentation succincte du projet SmartLock Dashboard (1-2 paragraphes).
- Lien vers le **dépôt GitHub** du projet (et éventuellement vers le repo de l'API d'auth).
- Lien vers le **site de l'association** (Devinci Fablab).
- Bouton **« Se connecter »** qui déclenche le flow OIDC vers Keycloak.

**Ce que la page ne fait pas :**

- Pas d'état du fablab en temps réel (occupation, alertes…).
- Pas d'événements à venir.
- Pas de communication / marketing externe.
- Aucune donnée métier exposée sans authentification.

Une fois connecté, l'utilisateur est redirigé vers le dashboard authentifié dont le contenu dépend de ses rôles.

## Workflow commandes (Trésorerie)

### Déclenchement

- **Automatique sur seuil bas.** Dès qu'une stock entry passe sous `item.low_stock_threshold` (cf. [Items](#items)), l'item est automatiquement flaggé « à commander » dans une vue dédiée pour la Trésorerie.
- Le flag est calculé en temps réel à partir des quantités courantes — pas de table séparée à synchroniser.

### Génération d'une feuille de commande

- Dans la vue « à commander », la Trésorerie sélectionne manuellement les items qu'elle veut intégrer dans la prochaine feuille.
- Pour chaque item sélectionné, la Trésorerie choisit la / les références d'achat (parmi `item.purchase_refs`) et la quantité à commander.
- Groupage par fournisseur automatique (les items ayant le même fournisseur dans leur réf retenue sont regroupés sur la même ligne).

### Format de sortie

- **CSV uniquement** au démarrage, format plat le plus simple possible. Une ligne = un item à commander.
- Colonnes, dans l'ordre :

  ```csv
  fournisseur,item,reference,url,quantite,prix_unitaire,prix_total
  ```

  | Colonne         | Source                                                          |
  | --------------- | --------------------------------------------------------------- |
  | `fournisseur`   | `purchase_ref.supplier` retenue pour cet item                   |
  | `item`          | `item.name`                                                     |
  | `reference`     | `purchase_ref.ref` (référence chez le fournisseur)              |
  | `url`           | `purchase_ref.url` (lien direct vers la fiche fournisseur)      |
  | `quantite`      | quantité à commander, saisie par la Trésorerie                  |
  | `prix_unitaire` | `purchase_ref.price_indicative` (indicatif, peut être vide)     |
  | `prix_total`    | `quantite × prix_unitaire` (calculé, vide si prix indisponible) |

- Tri implicite : par `fournisseur` puis par `item` — facilite le découpage manuel en commandes par fournisseur dans l'outil externe de la Trésorerie.
- Encodage UTF-8, séparateur virgule, pas de BOM, pas de ligne de métadonnées en tête (purement tabulaire).
- Le CSV généré est **stocké dans rustfs** (cf. [Stockage des assets](#stockage-des-assets)) et téléchargeable depuis le dashboard via URL signée.
- PDF / email / intégrations tierces : reportés à un besoin futur, pas indispensables au démarrage.

### Suivi d'état

- Suivi binaire : **`draft` → `clos`**. Une feuille en `draft` est encore éditable ; une fois `clos`, elle est immuable et apparaît dans l'historique.
- Pas de suivi de livraison côté dashboard. La gestion fournisseur / réception se fait hors-outil.

### Validation

- **Trésorerie autonome.** Pas de validation Présidence requise, quel que soit le montant. Le rôle Trésorerie est responsable de ses commandes.
- La génération et la clôture d'une feuille sont tracées dans l'audit log (cf. [Audit log](#périmètre-des-événements-tracés)).

## Divergences à arbitrer avec l'API actuelle

L'API [`SmartLock-Authentication-Authorization`](https://github.com/DeVinci-FabLab/SmartLock-Authentication-Authorization) existe déjà et présente plusieurs écarts avec le modèle cible décrit ci-dessus. À résoudre soit en ajustant l'API, soit en ajustant la cible.

1. **Permissions booléennes au lieu d'enum.** L'API stocke les permissions par armoire sous forme de colonnes booléennes indépendantes : `can_view`, `can_open`, `can_edit`, `can_take`, `can_manage` (cf. `docs/api-reference.md` → _Locker Permissions_).
   - Cible CDC : enum hiérarchique à 3 niveaux (`can_view < can_open < can_edit`).
   - Décision : soit ajuster le schéma (colonne `permission_level` enum + drop des booléens), soit conserver les booléens en imposant par convention dans le code applicatif l'invariant hiérarchique (« interdit de cocher `can_open` sans `can_view` »). La première option est plus saine.

2. **`can_take` non prévu par le CDC.** L'API distingue `can_open` (ouvrir physiquement) de `can_take` (sortir un item). Le CDC fusionne les deux dans `can_open` (« ouvrir + ajouter / retirer »). À trancher : garde-t-on la distinction ? Si oui, le CDC doit l'absorber.

3. **`can_manage` à la mauvaise granularité.** L'API a `can_manage` comme booléen par (subject, armoire). Le CDC cible le porte sur le rôle lui-même (cf. `manages`). À retirer de la table de permissions par armoire et déplacer dans la définition des rôles (côté code, pas en DB).

4. **Override par utilisateur dans l'API.** L'API supporte `subject_type: "user"` pour attribuer une permission spécifique à un utilisateur précis, contournant les rôles. Le CDC interdit ce mécanisme (« pas d'attribution discrète, pas d'override manuel »). À retirer de l'API — ou autoriser explicitement dans le CDC en documentant pourquoi.

5. **`/auth/elevate` à retirer.** L'API permet aujourd'hui à un membre du codir de s'auto-promouvoir Admin sys Keycloak temporairement (`POST /auth/elevate` + `POST /auth/revoke-admin`). Le CDC interdit cette voie (cf. [Authentification → Élévation de privilèges](#élévation-de-privilèges)) : si un Codir a besoin de droits Admin sys, c'est un Admin sys qui les lui attribue explicitement, opération tracée dans l'audit. **À retirer** des endpoints exposés.

6. **`valid_until` sur les permissions.** L'API supporte des permissions à durée limitée (`valid_until`, ISO 8601). Non couvert par le CDC. À garder (utile pour Createch et invités ponctuels) ou retirer.

7. **Liste des rôles incomplète côté Keycloak.** L'API documente les rôles `membre, 3d, electronique, textile, materialiste, codir, admin`. Manquent : `createch`, sous-rôles `agent_fdm / agent_sla / agent_sls`, `bureau`, `responsable` (distinct de `materialiste`), `tresorerie`, `presidence`. À aligner côté Keycloak avant que le dashboard puisse refléter le CDC. **Note** : `docs/system-design.md` du dépôt d'auth utilise encore une 3e liste (`woodshop-member`, `electronics-member`) — incohérence interne au backend à corriger.

8. **Périmètre de la matrice `manages` côté API.** L'API expose une matrice statique (`api-reference.md` → _Role Management_) : `Matérialiste` peut gérer `membre/3d` ; `Codir/Admin` peut gérer plus. Le CDC veut cette matrice en data dans le code du dashboard (cf. tableau `manages`). À aligner : une seule source de vérité, idéalement dans le code partagé (ou au minimum dupliquée à l'identique côté API et côté dashboard avec un test qui les compare).

9. **Endpoints de cycle de vie utilisateur manquants.** L'API actuelle expose l'assignation / révocation de **rôles**, mais pas le cycle de vie du **compte**. À ajouter pour supporter le statut `active / revoked / deleted` défini en [Cycle de vie d'un compte](#cycle-de-vie-dun-compte) :
   - `POST /users/{id}/revoke` → `PUT /admin/realms/fablab/users/{id}` avec `{ "enabled": false }`.
   - `POST /users/{id}/restore` → `PUT /admin/realms/fablab/users/{id}` avec `{ "enabled": true }`.
   - `DELETE /users/{id}` → `DELETE /admin/realms/fablab/users/{id}` (hard delete).

   Permissions à câbler : révoquer / restaurer = Comité de direction, Présidence, Administrateur système ; supprimer définitivement = Présidence, Administrateur système uniquement (cf. [Cycle de vie d'un compte](#cycle-de-vie-dun-compte)).

   L'endpoint `GET /users` existant doit aussi remonter le champ `enabled` dans la réponse (à vérifier — il proxie Keycloak donc c'est probablement déjà le cas, mais à confirmer côté `src/routes/users.py`).

10. **Vérification `enabled` manquante dans le flux d'auth NFC.** Le flux décrit dans `docs/system-design.md` (étapes 5-7) recherche l'utilisateur par `card_id`, lit ses rôles, calcule les permissions. Il **ne vérifie pas explicitement** le flag `enabled`. Conséquence : un compte **revoked** dont le badge n'a pas été retiré physiquement pourrait quand même ouvrir une armoire si l'API ne refuse pas explicitement.

    Correctif : entre l'étape 5 (lookup user) et l'étape 6 (lecture des rôles), ajouter `if not user.enabled: return 403 { allowed: false, reason: "account_revoked" }`. Étendre l'énum `reason` de la réponse pour inclure `account_revoked` (en plus des `card_not_registered`, `no_permission`, `expired` existants).

    Même contrôle nécessaire côté login dashboard, mais là Keycloak refuse nativement l'émission de token pour un compte `enabled: false` — pas besoin de check applicatif.

11. **Support des rôles personnalisés (custom roles) à ajouter côté API.** Le CDC pose que seuls 6 rôles sont système (Admin sys, Présidence, Codir, Trésorerie, Bureau, Membre) ; tous les autres (Agents, Responsables, Createch, Ing. de recherche…) sont **personnalisés** : créés / édités / supprimés via le dashboard à partir du Codir. L'API actuelle suppose une liste fermée de rôles côté Keycloak et hardcode la matrice de gestion (`api-reference.md` → _Role Management_). À faire évoluer :
    - **Modélisation des rôles** : table `roles` côté DB applicative avec les colonnes `name` (slug, unique), `label`, `tier` (int 0..5), `is_system` (bool), `is_manager` (bool), `is_role_admin` (bool), `capacities` (set). Les permissions par armoire restent dans la table `locker_permissions` existante. Les deux flags sont décrits en [Gestion des rôles](#gestion-des-rôles-toggles-manager-et-role_admin).
    - **CRUD sur les rôles** : nouveaux endpoints API qui créent / modifient / suppriment les rôles Keycloak côté realm `fablab` ET enregistrent les métadonnées associées côté DB. Endpoints proposés :
      - `POST /roles` — créer un rôle (corps : `{ name, label, tier, is_manager, is_role_admin, capacities: [...] }`). **Auth requise : rôle de l'appelant avec `is_role_admin = true` ET `tier ≥ tier` du nouveau rôle.**
      - `PUT /roles/{name}` — éditer (hors `name` et `tier` immuables). `is_manager`, `is_role_admin`, `label`, `capacities` éditables. **Auth : `is_role_admin = true` + tier ≥ tier du rôle modifié.**
      - `DELETE /roles/{name}` — supprimer. **Auth : `is_role_admin = true` + tier ≥ tier du rôle cible.** Politique :
        - **Si `is_system = true`** : refus systématique avec `403 detail: "system_role_not_deletable"`. Vérification en tête d'endpoint, avant toute autre logique.
        - **Si auto-destruction** : refus si la suppression retirerait à l'appelant sa seule source d'autorité `is_role_admin`. Réponse `403 detail: "self_destruction_forbidden"`.
        - Par défaut, refus si au moins un compte a ce rôle. Réponse `409` avec `detail: "role_in_use"`.
        - **Cascade autorisée** via un query param explicite `?cascade=true`, **réservé à Présidence et Admin sys** (peu importe `is_role_admin` : c'est une protection système hardcodée). Le check d'auto-destruction reste actif même en cascade.
      - `GET /roles` — lister (avec métadonnées tier / `is_manager` / `is_role_admin` / capacités / `is_system`). Auth : n'importe quel JWT valide.
    - **Protection des rôles système** : les 6 rôles système sont marqués `is_system: true` côté DB ; les endpoints d'édition (sauf permissions par armoire et `label`) / suppression refusent toute action destructive sur ces rôles (y compris pour Admin sys). Leurs `tier`, `is_manager`, `is_role_admin` sont codés en dur et non modifiables. Ils sont seedés à la première migration.
    - **Logique d'attribution / révocation d'un rôle utilisateur** : `POST /users/{user_id}/roles/{role_name}` (existant) doit être réécrit :
      - Vérifier que l'appelant possède au moins un rôle X avec `X.is_manager = true` ET **`X.tier > target_role.tier`** (strict, pour conserver « tiers pairs intouchables »). Cas particulier au sommet : Admin sys (T5) peut révoquer Admin sys parce qu'il n'y a pas de tier au-dessus.
      - Sinon, refuser avec `403 detail: "insufficient_authority"`.
      - Plus de matrice hardcodée à maintenir : la décision dérive des données rôles.
      - La matrice statique dans `api-reference.md` → _Role Management_ devient caduque.
    - **Note** : la liste de capacités spécifiques attribuables à un rôle reste limitée à un set codé en dur (les features du dashboard sont elles-mêmes hard-codées). Voir [Capacités spécifiques par rôle](#capacités-spécifiques-par-rôle).
