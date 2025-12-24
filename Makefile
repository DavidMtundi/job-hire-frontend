.PHONY: help docker-up docker-down docker-build docker-logs docker-clean docker-restart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

docker-up: ## Start all services in development mode
	docker compose -f docker-compose.dev.yml up --build

docker-up-d: ## Start all services in detached mode (background)
	docker compose -f docker-compose.dev.yml up -d --build

docker-down: ## Stop all services
	docker compose -f docker-compose.dev.yml down

docker-down-v: ## Stop all services and remove volumes
	docker compose -f docker-compose.dev.yml down -v

docker-build: ## Build all services
	docker compose -f docker-compose.dev.yml build

docker-build-nc: ## Build all services without cache
	docker compose -f docker-compose.dev.yml build --no-cache

docker-logs: ## View logs from all services
	docker compose -f docker-compose.dev.yml logs -f

docker-logs-backend: ## View backend logs
	docker compose -f docker-compose.dev.yml logs -f backend

docker-logs-frontend: ## View frontend logs
	docker compose -f docker-compose.dev.yml logs -f frontend

docker-logs-db: ## View database logs
	docker compose -f docker-compose.dev.yml logs -f postgres

docker-restart: ## Restart all services
	docker compose -f docker-compose.dev.yml restart

docker-ps: ## Show running containers
	docker compose -f docker-compose.dev.yml ps

docker-shell-backend: ## Open shell in backend container
	docker compose -f docker-compose.dev.yml exec backend sh

docker-shell-frontend: ## Open shell in frontend container
	docker compose -f docker-compose.dev.yml exec frontend sh

docker-shell-db: ## Open database shell
	docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d mh_db

docker-clean: ## Clean up Docker resources
	docker compose -f docker-compose.dev.yml down -v
	docker system prune -f

docker-prod-up: ## Start all services in production mode
	docker compose up -d --build

docker-prod-down: ## Stop production services
	docker compose down

