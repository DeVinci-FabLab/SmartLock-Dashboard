# SmartLock Dashboard — Makefile
# Lancer `make` ou `make help` pour la liste des commandes.

.DEFAULT_GOAL := help

# ---- Variables ----
WEB_DIR        := web
DOCKER_DIR     := docker
NPM            := npm --prefix $(WEB_DIR)
COMPOSE        := docker compose
COMPOSE_DEV    := $(COMPOSE) -f $(DOCKER_DIR)/compose.yaml
COMPOSE_PROD   := $(COMPOSE) -f $(DOCKER_DIR)/compose.prod.yaml

# ---- Aide ----
.PHONY: help
help: ## Affiche cette aide
	@awk 'BEGIN {FS = ":.*?## "; printf "\nUsage : make \033[36m<cible>\033[0m\n\nCibles disponibles :\n\n"} \
		/^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)}' $(MAKEFILE_LIST)
	@echo ""

##@ Développement local (dans web/)

.PHONY: install
install: ## Installe les dépendances npm dans web/
	$(NPM) install

.PHONY: dev
dev: ## Lance le serveur de dev Vite (http://localhost:5173)
	$(NPM) run dev

.PHONY: build
build: ## Build de production (nécessite @sveltejs/adapter-node)
	$(NPM) run build

.PHONY: preview
preview: ## Sert localement le build de production
	$(NPM) run preview

.PHONY: check
check: ## Vérifie les types et le code Svelte
	$(NPM) run check

##@ Docker

.PHONY: docker-dev
docker-dev: ## Lance l'app en dev dans Docker (HMR)
	$(COMPOSE_DEV) up --build

.PHONY: docker-dev-detached
docker-dev-detached: ## Lance l'app en dev en arrière-plan
	$(COMPOSE_DEV) up --build -d

.PHONY: docker-down
docker-down: ## Arrête les conteneurs de dev
	$(COMPOSE_DEV) down

.PHONY: docker-logs
docker-logs: ## Affiche les logs du conteneur de dev
	$(COMPOSE_DEV) logs -f

.PHONY: docker-prod-build
docker-prod-build: ## Construit l'image de production
	$(COMPOSE_PROD) build

.PHONY: docker-prod
docker-prod: ## Lance l'app en production (détaché)
	$(COMPOSE_PROD) up --build -d

.PHONY: docker-prod-down
docker-prod-down: ## Arrête l'app de production
	$(COMPOSE_PROD) down

##@ Nettoyage

.PHONY: clean
clean: ## Supprime node_modules, .svelte-kit, build et caches dans web/
	rm -rf $(WEB_DIR)/node_modules $(WEB_DIR)/.svelte-kit $(WEB_DIR)/build $(WEB_DIR)/.output

.PHONY: clean-docker
clean-docker: ## Supprime conteneurs, volumes et images Docker du projet
	-$(COMPOSE_DEV) down -v --rmi local
	-$(COMPOSE_PROD) down -v --rmi local
