# TODO - Kanban Backend API

> Dernière mise à jour : 2026-01-06

---

## ✅ Déjà implémenté

- ✅ CRUD complet des tasks
- ✅ CRUD complet des workspaces
- ✅ Système d'authentification (côté front)
- ✅ Documentation Swagger de base
- ✅ Architecture NestJS + Drizzle + Fastify

---

## 🔴 Phase 1 : Board Columns (Priorité Immédiate)

### 1.1 - Création de la table `board_columns`
- [ ] Créer le schéma Drizzle dans `src/db/board-columns.schema.ts`
  - Champs : `id`, `name`, `position` (integer pour drag&drop), `workspace_id` (FK), `created_at`, `updated_at`
  - Ajouter les types TypeScript (`BoardColumn`, `BoardColumnInsert`, `BoardColumnUpdate`)
  - Créer les schémas Zod de validation avec `drizzle-zod`
- [ ] Ajouter la relation `workspace_id` → `workspaces.id` (ON DELETE CASCADE)
- [ ] Générer et appliquer la migration : `npx drizzle-kit generate` puis `npx drizzle-kit push`

### 1.2 - CRUD Board Columns
- [ ] Créer le module `src/api/board-columns/`
  - `board-columns.module.ts`
  - `board-columns.service.ts`
  - `board-columns.controller.ts`
- [ ] Implémenter les endpoints :
  - `POST /api/board-columns` - Créer une colonne
  - `GET /api/board-columns` - Lister toutes les colonnes (avec filtre `workspace_id`)
  - `GET /api/board-columns/:id` - Récupérer une colonne
  - `PATCH /api/board-columns/:id` - Modifier une colonne (nom, position)
  - `DELETE /api/board-columns/:id` - Supprimer une colonne
  - `PATCH /api/board-columns/:id/position` - Réordonner les colonnes (drag&drop)
- [ ] Ajouter les validations Zod avec `ZodValidationPipe`
- [ ] Gérer les erreurs (colonne introuvable, workspace invalide, etc.)

### 1.3 - Colonnes par défaut à la création d'un workspace
- [ ] Modifier `workspaces.service.ts` → méthode `create()`
  - Après création du workspace, créer automatiquement 3 colonnes :
    1. "À faire" (position: 0)
    2. "En cours" (position: 1)
    3. "Terminé" (position: 2)
- [ ] Créer une tâche d'exemple "Bienvenue sur votre board ! Glissez-déposez cette carte pour tester" dans la colonne "À faire"

### 1.4 - Documentation Swagger pour Board Columns
- [ ] Créer `src/api/board-columns/decorators/` avec les décorateurs Swagger
  - `@ApiCreateBoardColumnSwaggerDecorator()`
  - `@ApiGetBoardColumnsSwaggerDecorator()`
  - `@ApiGetBoardColumnByIdSwaggerDecorator()`
  - `@ApiUpdateBoardColumnSwaggerDecorator()`
  - `@ApiDeleteBoardColumnSwaggerDecorator()`
  - `@ApiReorderBoardColumnSwaggerDecorator()`
- [ ] Ajouter des exemples de requêtes/réponses dans chaque décorateur
- [ ] Tester la documentation sur `/documentation`

### 1.5 - Tests et validation Phase 1
- [ ] Tester tous les endpoints avec des cas valides/invalides
- [ ] Vérifier les validations Zod (champs manquants, types incorrects)
- [ ] Vérifier les relations (workspace invalide → erreur 404)
- [ ] Vérifier la création automatique des 3 colonnes + tâche d'exemple
- [ ] Vérifier le réordonnancement (positions correctes après drag&drop)

---

## ⚡ Phase 2 : Relier Tasks aux Colonnes + Drag & Drop

### 2.1 - Migration de la table `tasks`
- [ ] Ajouter le champ `board_column_id` (FK vers `board_columns.id`) dans `src/db/task.schema.ts`
- [ ] Ajouter le champ `position` (integer) pour l'ordre dans la colonne
- [ ] Ajouter le champ `archived` (boolean, default: false)
- [ ] Mettre à jour les types TypeScript et schémas Zod
- [ ] Générer et appliquer la migration

### 2.2 - Mise à jour du CRUD Tasks
- [ ] Modifier `tasks.service.ts` :
  - À la création : assigner automatiquement `position` = dernière position + 1 dans la colonne
  - Filtrer par `board_column_id` dans `GET /api/tasks?board_column_id=X`
  - Exclure les tâches archivées par défaut (sauf param `?include_archived=true`)
- [ ] Ajouter endpoint `PATCH /api/tasks/:id/move` pour déplacer une tâche :
  - Paramètres : `board_column_id` (nouvelle colonne) et `position` (nouvel ordre)
  - Réorganiser les positions des autres tâches automatiquement
- [ ] Ajouter endpoint `PATCH /api/tasks/:id/archive` pour archiver/désarchiver

### 2.3 - Logique Drag & Drop temps réel
- [ ] Quand une tâche change de `board_column_id` :
  - Mettre à jour automatiquement les positions dans l'ancienne et la nouvelle colonne
  - Retourner les tâches réorganisées pour mise à jour front en temps réel
- [ ] Gérer le cas où on déplace dans la même colonne (juste changement de position)

### 2.4 - Documentation Swagger pour Tasks mis à jour
- [ ] Mettre à jour les décorateurs Swagger existants
- [ ] Ajouter les nouveaux décorateurs pour `/move` et `/archive`
- [ ] Documenter les nouveaux champs (`board_column_id`, `position`, `archived`)

### 2.5 - Tests et validation Phase 2
- [ ] Tester le déplacement de tâches entre colonnes
- [ ] Tester le réordonnancement dans une même colonne
- [ ] Tester l'archivage/désarchivage
- [ ] Vérifier que les positions sont cohérentes après chaque opération
- [ ] Tester les filtres (`board_column_id`, `archived`)

---

## 📋 Phase 3 : Workspace de Bienvenue + Corbeille (Soft Delete)

### 3.1 - Workspace de Bienvenue par défaut
- [ ] Créer une seed/migration pour insérer un workspace "Bienvenue" :
  - Nom : "Bienvenue"
  - Avec 3 colonnes par défaut + 1 tâche d'exemple
  - Marqué comme `is_default: true` (ajouter ce champ)
- [ ] Modifier `DELETE /api/workspaces/:id` :
  - Empêcher la suppression si `is_default = true` ET qu'il n'y a qu'un seul workspace
  - Retourner erreur 403 : "Impossible de supprimer le workspace de bienvenue"

### 3.2 - Soft Delete (à faire plus tard, pas urgent)
- [ ] Ajouter `deleted` (boolean, default: false) et `deleted_at` (timestamp nullable) à :
  - `tasks`
  - `board_columns`
  - `workspaces`
- [ ] Modifier les queries pour exclure `deleted = true` par défaut
- [ ] Ajouter endpoint `GET /api/trash` (ou `/recycle-bin`) :
  - Retourne tous les éléments soft-deleted (tasks, colonnes, workspaces)
  - Permettre la restauration ou suppression définitive

---

## 🔧 Phase 4 : Sécurité et Production

### 4.1 - Sécurité de base
- [ ] Installer et configurer `@nestjs/throttler` pour rate limiting
  - Limiter les requêtes par IP (ex: 100 req/15min)
- [ ] Installer et configurer `helmet` pour sécuriser les headers HTTP
- [ ] Configurer CORS correctement dans `main.ts`
  - Définir les origines autorisées (front-end URL)
  - Autoriser credentials si nécessaire

### 4.2 - Validation et logs
- [ ] Ajouter des logs détaillés dans `AllExceptionsFilter`
- [ ] Ajouter validation globale des UUIDs dans les paramètres de routes
- [ ] Documenter les erreurs communes dans Swagger (401, 403, 429)

---

## 🚀 Améliorations futures (Post-MVP)

- [ ] Système de recherche (tasks, colonnes, workspaces)
- [ ] Assignation d'utilisateurs aux tâches
- [ ] Tags/labels pour les tâches
- [ ] Dates limites (due dates)
- [ ] Commentaires sur les tâches
- [ ] Notifications temps réel (WebSockets)
- [ ] Tests unitaires et e2e avec Vitest
- [ ] CI/CD (GitHub Actions, tests automatiques)
- [ ] Docker et docker-compose pour dev/prod
- [ ] Backup automatique de la DB

---

## 📝 Notes

- **Priorité actuelle** : MVP rapide avec board_columns fonctionnel
- **Pas de tests** pour l'instant (focus sur les features)
- **Authentification** : déjà gérée côté front
- **Swagger** : maintenir la doc à jour à chaque feature
- **Path aliases** : toujours utiliser `@api/`, `@db/`, `@common/`, `@drizzle/`
- **Style** : 4 espaces, double quotes, semicolons (voir `.editorconfig`)

---

## 🎯 Prochaine étape immédiate

👉 **Commencer par Phase 1.1** : Création de la table `board_columns`
