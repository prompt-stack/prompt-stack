# Prompt-Stack Development Makefile

.PHONY: help dev dev-frontend dev-backend build clean logs test ai-lint ai-audit

# Colors for output
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Prompt-Stack Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development
dev: ## Start both frontend and backend in development mode
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:8000"

dev-frontend: ## Start only frontend
	docker-compose -f docker-compose.dev.yml up frontend -d

dev-backend: ## Start only backend  
	docker-compose -f docker-compose.dev.yml up backend -d

stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose -f docker-compose.dev.yml down

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	docker-compose -f docker-compose.dev.yml restart

# Logs
logs: ## View logs from all services
	docker-compose -f docker-compose.dev.yml logs -f

logs-backend: ## View backend logs only
	docker-compose -f docker-compose.dev.yml logs -f backend

logs-frontend: ## View frontend logs only
	docker-compose -f docker-compose.dev.yml logs -f frontend

# Building
build: ## Build all containers
	@echo "$(BLUE)Building containers...$(NC)"
	docker-compose -f docker-compose.dev.yml build

build-prod: ## Build production containers
	docker-compose -f docker-compose.prod.yml build

# Cleanup
clean: ## Clean up containers, volumes, and images
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Nuclear cleanup - remove everything
	@echo "$(RED)WARNING: This will remove ALL Docker data$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker system prune -af --volumes

# Testing
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	./scripts/test-api-simple.sh

test-api: ## Test API endpoints
	./scripts/test-api-comprehensive.sh

# Health checks
health: ## Check system health
	@echo "$(BLUE)Checking system health...$(NC)"
	@curl -s http://localhost:8000/api/health/detailed | jq || echo "Backend not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Frontend responding$(NC)" || echo "$(RED)✗ Frontend not responding$(NC)"

diagnose: ## Run comprehensive diagnostics
	./scripts/diagnose.sh

# AI Quality Tools
ai-lint: ## Run AI code quality check on current directory
	@echo "$(BLUE)Running AI lint check...$(NC)"
	@if [ -z "$$OPENAI_API_KEY" ]; then \
		echo "$(RED)Error: OPENAI_API_KEY environment variable required$(NC)"; \
		exit 1; \
	fi
	python3 scripts/ai-lint.py . --output ai-lint-report.json
	@echo "$(GREEN)✓ AI lint complete. Report: ai-lint-report.json$(NC)"

ai-lint-frontend: ## Run AI lint on frontend only
	@echo "$(BLUE)Running AI lint on frontend...$(NC)"
	cd frontend && npm run ai:lint

ai-audit: ## Run full AI audit of codebase
	@echo "$(BLUE)Running full AI audit...$(NC)"
	@if [ -z "$$OPENAI_API_KEY" ]; then \
		echo "$(RED)Error: OPENAI_API_KEY environment variable required$(NC)"; \
		exit 1; \
	fi
	python3 scripts/ai-lint.py . --extensions .py .ts .tsx .js --output ai-audit-full.json
	@echo "$(GREEN)✓ Full audit complete. Report: ai-audit-full.json$(NC)"

# Database
migrate: ## Run database migrations (requires manual step)
	@echo "$(YELLOW)Database migrations must be run manually:$(NC)"
	@echo "1. Open: https://app.supabase.com/project/nepcpxunchnowolbcsgu/sql/new"
	@echo "2. Copy contents of: supabase/migrations/all_migrations_combined.sql"
	@echo "3. Paste and click 'Run'"

setup-db: ## Run database setup script
	./scripts/setup-database.sh

# Environment
setup: ## Run initial setup
	./setup.sh

setup-ai: ## Configure AI providers
	./setup.sh ai

setup-supabase: ## Configure Supabase
	./setup.sh supabase

status: ## Show environment status
	./setup.sh status

# Git hooks (for development)
install-hooks: ## Install git hooks for AI linting
	@echo "$(BLUE)Installing git hooks...$(NC)"
	@echo '#!/bin/bash\nmake ai-lint-frontend' > .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "$(GREEN)✓ Git hooks installed$(NC)"

# Documentation
docs: ## Generate documentation
	@echo "$(BLUE)Documentation available at:$(NC)"
	@echo "- API Docs: http://localhost:8000/docs"
	@echo "- Dev Guide: http://localhost:3000/dev-guide"
	@echo "- AI Guide: ./AI_GUIDE.md"
	@echo "- Prompts: ./prompts/"

first-run:
	@echo "Setting up Prompt-Stack Skeleton..."
	@./setup.sh

# Development commands
.PHONY: dev
dev: ensure-env-files
	docker-compose -f docker-compose.dev.yml up

# Build without cache (useful when dependencies change)
.PHONY: build-fresh
build-fresh: ensure-env-files
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose -f docker-compose.dev.yml up

# Ensure env files exist
.PHONY: ensure-env-files
ensure-env-files:
	@if [ ! -f backend/.env ]; then \
		echo "Creating backend/.env with template..."; \
		echo "# Prompt-Stack Environment Configuration" > backend/.env; \
		echo "# Add your API keys after the = sign" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# AI Providers (choose one or more)" >> backend/.env; \
		echo "OPENAI_API_KEY=" >> backend/.env; \
		echo "ANTHROPIC_API_KEY=" >> backend/.env; \
		echo "DEEPSEEK_API_KEY=" >> backend/.env; \
		echo "GEMINI_API_KEY=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# Database & Auth" >> backend/.env; \
		echo "SUPABASE_URL=" >> backend/.env; \
		echo "SUPABASE_ANON_KEY=" >> backend/.env; \
		echo "SUPABASE_SERVICE_KEY=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# Payments - Stripe" >> backend/.env; \
		echo "STRIPE_SECRET_KEY=" >> backend/.env; \
		echo "STRIPE_WEBHOOK_SECRET=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# Payments - Lemon Squeezy" >> backend/.env; \
		echo "LEMONSQUEEZY_API_KEY=" >> backend/.env; \
		echo "LEMONSQUEEZY_STORE_ID=" >> backend/.env; \
		echo "LEMONSQUEEZY_WEBHOOK_SECRET=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# Email" >> backend/.env; \
		echo "RESEND_API_KEY=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# For exposing local dev to internet (optional)" >> backend/.env; \
		echo "# From ngrok.com dashboard" >> backend/.env; \
		echo "NGROK_AUTHTOKEN=" >> backend/.env; \
		echo "# For API access" >> backend/.env; \
		echo "NGROK_API_KEY=" >> backend/.env; \
		echo "# Custom domain (paid)" >> backend/.env; \
		echo "NGROK_DOMAIN=" >> backend/.env; \
		echo "" >> backend/.env; \
		echo "# Leave these as-is" >> backend/.env; \
		echo "ENVIRONMENT=development" >> backend/.env; \
		echo "FRONTEND_URL=http://localhost:3000" >> backend/.env; \
		echo "CORS_ORIGINS=http://localhost:3000" >> backend/.env; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		echo "Creating frontend/.env.local with template..."; \
		echo "# Frontend Configuration" > frontend/.env.local; \
		echo "" >> frontend/.env.local; \
		echo "# API Connection (leave as-is for local dev)" >> frontend/.env.local; \
		echo "NEXT_PUBLIC_API_URL=http://localhost:8000" >> frontend/.env.local; \
		echo "" >> frontend/.env.local; \
		echo "# Add these after configuring Supabase" >> frontend/.env.local; \
		echo "NEXT_PUBLIC_SUPABASE_URL=" >> frontend/.env.local; \
		echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=" >> frontend/.env.local; \
		echo "" >> frontend/.env.local; \
		echo "# Add for Stripe checkout" >> frontend/.env.local; \
		echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" >> frontend/.env.local; \
	fi

.PHONY: dev-demo
dev-demo: ensure-env-files
	@echo "Starting in demo mode (no API keys required)..."
	DEMO_MODE=true docker-compose -f docker-compose.dev.yml up

.PHONY: dev-real
dev-real: ensure-env-files
	@echo "Starting in production mode (API keys required)..."
	DEMO_MODE=false docker-compose -f docker-compose.dev.yml up

.PHONY: dev-build
dev-build: ensure-env-files
	docker-compose -f docker-compose.dev.yml build

.PHONY: dev-frontend
dev-frontend: ensure-env-files
	docker-compose -f docker-compose.dev.yml up frontend

.PHONY: dev-backend
dev-backend: ensure-env-files
	docker-compose -f docker-compose.dev.yml up backend

.PHONY: dev-cloud
dev-cloud:
	@echo "Starting with cloud services (uses .env files)..."
	docker-compose -f docker-compose.cloud.yml up

# Production commands
.PHONY: prod
prod:
	docker-compose -f docker-compose.prod.yml up -d

.PHONY: prod-build
prod-build:
	docker-compose -f docker-compose.prod.yml build

# Stop services
.PHONY: stop
stop:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down

# Clean up
.PHONY: clean
clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.prod.yml down -v
	rm -rf frontend/node_modules frontend/.next
	rm -rf backend/__pycache__ backend/.pytest_cache

# Installation commands
.PHONY: install-frontend
install-frontend:
	cd frontend && npm install

.PHONY: install-backend
install-backend:
	cd backend && pip install -r requirements.txt

# Build commands
.PHONY: build-frontend
build-frontend:
	cd frontend && npm run build

# Database commands
.PHONY: db-setup
db-setup:
	@cd supabase && ./setup-database.sh

.PHONY: db-migration-new
db-migration-new:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make db-migration-new name=your_migration_name"; \
		exit 1; \
	fi
	@echo "Creating new migration: $(name)"
	@mkdir -p supabase/migrations
	@timestamp=$$(date +%Y%m%d%H%M%S); \
	touch "supabase/migrations/$${timestamp}_$(name).sql"; \
	echo "Created: supabase/migrations/$${timestamp}_$(name).sql"

# Testing commands
.PHONY: test
test:
	@echo "Tests not configured yet"
	@echo "Add pytest to requirements.txt to enable testing"

.PHONY: test-api
test-api:
	@./scripts/test-api-simple.sh

.PHONY: test-full
test-full:
	@./scripts/test-api-comprehensive.sh

.PHONY: lint
lint:
	@echo "Linting not configured yet"
	@echo "Add flake8, black, and isort to requirements.txt to enable linting"

# Utility commands
.PHONY: status
status:
	@docker-compose -f docker-compose.dev.yml ps

.PHONY: logs
logs:
	docker-compose -f docker-compose.dev.yml logs -f

.PHONY: logs-backend
logs-backend:
	docker-compose -f docker-compose.dev.yml logs -f backend

.PHONY: logs-frontend
logs-frontend:
	docker-compose -f docker-compose.dev.yml logs -f frontend

.PHONY: preflight
preflight:
	@./scripts/preflight-checks.sh

.PHONY: troubleshoot
troubleshoot:
	@./scripts/troubleshoot.sh

# Help command
.PHONY: help
help:
	@echo "Prompt-Stack Skeleton Commands:"
	@echo ""
	@echo "Setup & Development:"
	@echo "  make first-run      - Initial setup wizard"
	@echo "  make dev           - Start development environment"
	@echo "  make dev-demo      - Start in demo mode (no API keys)"
	@echo "  make dev-real      - Start with real APIs (keys required)"
	@echo "  make dev-cloud     - Start with cloud services (.env files)"
	@echo "  make dev-frontend  - Start frontend only"
	@echo "  make dev-backend   - Start backend only"
	@echo ""
	@echo "Production:"
	@echo "  make prod          - Start production environment"
	@echo "  make prod-build    - Build production images"
	@echo ""
	@echo "Utilities:"
	@echo "  make status        - Check service status"
	@echo "  make logs          - View all logs"
	@echo "  make logs-backend  - View backend logs"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make preflight     - Run preflight checks"
	@echo "  make troubleshoot  - Debug common issues"
	@echo ""
	@echo "Database:"
	@echo "  make db-setup      - Database setup wizard"
	@echo "  make db-migration-new name=foo - Create new migration"
	@echo ""
	@echo "Maintenance:"
	@echo "  make stop          - Stop all services"
	@echo "  make clean         - Clean up containers and files"
	@echo ""
	@echo "Access:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"