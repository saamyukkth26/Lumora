FROM python:3.11-slim
WORKDIR /app

# System deps for PyMuPDF
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
        fastapi "uvicorn[standard]" pydantic pydantic-settings \
        langgraph langchain langchain-anthropic langchain-openai langchain-google-genai langchain-community \
        google-generativeai \
        lancedb pyarrow \
        openai \
        pymupdf python-docx httpx beautifulsoup4 \
        "mcp[cli]" duckduckgo-search arxiv wikipedia-api \
        neo4j networkx \
        python-multipart structlog

COPY src/ ./src/

ENV PYTHONPATH="/app"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN mkdir -p /app/data/lancedb /app/data/uploads

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
