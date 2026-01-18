.PHONY: help build up down logs restart clean

help: ## Afficher l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build l'image Docker
	docker-compose build

up: ## Démarrer les services
	docker-compose up -d

down: ## Arrêter les services
	docker-compose down

logs: ## Voir les logs
	docker-compose logs -f api

logs-traefik: ## Voir les logs Traefik
	docker-compose logs -f traefik

restart: ## Redémarrer l'API
	docker-compose restart api

rebuild: ## Rebuild et redémarrer
	docker-compose up -d --build api

ps: ## Status des containers
	docker-compose ps

clean: ## Arrêter et supprimer les containers/volumes
	docker-compose down -v

shell: ## Shell dans le container API
	docker-compose exec api sh

health: ## Vérifier le health check
	curl -s http://localhost:3000/api/health | jq

prod-deploy: ## Déploiement production (git pull + rebuild)
	git pull origin main
	docker-compose up -d --build api
	@echo "✅ Déploiement terminé. Vérification du health check..."
	@sleep 5
	@curl -s http://localhost:3000/api/health | jq

setup-dashboard: ## Générer le hash pour le dashboard Traefik
	@echo "Générer le mot de passe pour le dashboard Traefik:"
	@read -p "Username: " user; \
	read -sp "Password: " pass; \
	echo ""; \
	echo "Ajoutez cette ligne dans docker-compose.yml:"; \
	echo $$(htpasswd -nb $$user $$pass) | sed -e s/\\$$/\\$\\$\\$\\$/g
