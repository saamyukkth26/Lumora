# ── Stage 1: Build dependencies ──────────────────────────
FROM python:3.11-slim AS builder
WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml ./
RUN uv pip install --system --no-cache -r pyproject.toml 2>/dev/null || \
    pip install --no-cache-dir \
        fastapi uvicorn[standard] pydantic pydantic-settings \
        langgraph langchain langchain-anthropic langchain-openai langchain-community \
        lancedb pyarrow \
        "FlagEmbedding>=1.2.0" torch \
        pymupdf httpx beautifulsoup4 \
        "mcp[cli]" duckduckgo-search arxiv wikipedia-api \
        neo4j networkx \
        python-multipart structlog

# ── Stage 2: Runtime ─────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# System deps for PyMuPDF
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY src/ ./src/

ENV PYTHONPATH="/app"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create data directories
RUN mkdir -p /app/data/lancedb /app/data/uploads

EXPOSE 8000

# Single worker required: BGEEmbedder singleton + LanceDB embedded don't support multi-process
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
