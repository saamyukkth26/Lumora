# Contributing to Lumora

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

### Backend

```bash
cd backend
pip install uv
uv pip install -e ".[dev]"
cp .env.example .env
# Add your API keys
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Code Style

- **Python**: Black + isort + ruff (`uv run black src/ && uv run isort src/`)
- **TypeScript**: Prettier + ESLint (`npm run lint`)

## Branch Naming

- `feature/short-description` — new features
- `fix/bug-description` — bug fixes
- `docs/what-changed` — documentation

## Commit Messages

Use conventional commits:
- `feat: add arxiv deep search`
- `fix: streaming cursor alignment`
- `docs: update API reference`

## Pull Request Process

1. Create a branch from `main`
2. Write tests if adding backend features
3. Ensure CI passes
4. Fill out the PR template
5. Request review

## Questions?

Open a [GitHub Discussion](https://github.com/YOUR_USERNAME/lumora/discussions) or file an issue.
