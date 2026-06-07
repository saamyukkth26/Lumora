.PHONY: help setup dev test lint format clean docker-up docker-down

# ── Colors ───────────────────────────────────────────────
BLUE  = \033[34m
RESET = \033[0m

help:
	@echo ""
	@echo "$(BLUE)Lumora — Development Commands$(RESET)"
	@echo ""
	@echo "  make setup        Install all dependencies"
	@echo "  make dev          Start frontend + backend dev servers"
	@echo "  make test         Run all tests"
	@echo "  make lint         Check code style"
	@echo "  make format       Auto-format code"
	@echo "  make docker-up    Start with Docker Compose"
	@echo "  make docker-down  Stop Docker Compose"
	@echo "  make clean        Remove build artifacts"
	@echo ""

setup:
	@echo "$(BLUE)Setting up backend...$(RESET)"
	cd backend && pip install uv && uv pip install -e ".[dev]"
	@echo "$(BLUE)Setting up frontend...$(RESET)"
	cd frontend && npm install
	@echo "$(BLUE)Copying env files...$(RESET)"
	test -f backend/.env || cp backend/.env.example backend/.env
	test -f frontend/.env.local || cp frontend/.env.example frontend/.env.local
	@echo "✅ Setup complete! Add your API key to backend/.env"

dev:
	@echo "$(BLUE)Starting dev servers...$(RESET)"
	@trap 'kill %1 %2' SIGINT; \
	cd backend && uvicorn src.main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait

test:
	@echo "$(BLUE)Running backend tests...$(RESET)"
	cd backend && uv run pytest tests/ -v
	@echo "$(BLUE)Running frontend type check...$(RESET)"
	cd frontend && npx tsc --noEmit

lint:
	@echo "$(BLUE)Linting backend...$(RESET)"
	cd backend && uv run ruff check src/ tests/ || true
	cd backend && uv run black --check src/ tests/ || true
	@echo "$(BLUE)Linting frontend...$(RESET)"
	cd frontend && npm run lint || true

format:
	@echo "$(BLUE)Formatting backend...$(RESET)"
	cd backend && uv run black src/ tests/
	cd backend && uv run isort src/ tests/
	@echo "$(BLUE)Formatting frontend...$(RESET)"
	cd frontend && npx prettier --write "src/**/*.{ts,tsx}"

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/dist backend/build backend/*.egg-info 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules/.vite 2>/dev/null || true
	@echo "✅ Cleaned"
