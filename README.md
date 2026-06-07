<div align="center">

# 🧠 Lumora

### Personal Second Brain with Autonomous Research Agents

*RAG · LangGraph Agents · MCP Servers · Knowledge Graph · Streaming UI*

[![CI](https://github.com/YOUR_USERNAME/lumora/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/lumora/actions)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![LangGraph](https://img.shields.io/badge/LangGraph-Powered-7c3aed)](https://github.com/langchain-ai/langgraph)
[![RAG](https://img.shields.io/badge/Hybrid_RAG-BGE--M3-orange)](https://huggingface.co/BAAI/bge-m3)
[![MCP](https://img.shields.io/badge/MCP-4_Servers-brightgreen)](https://modelcontextprotocol.io)
[![Deploy](https://img.shields.io/badge/deploy-Vercel_%2B_Render-black)](https://vercel.com)

<br/>

**[🚀 Live Demo](https://lumora.vercel.app)** · **[📖 Docs](docs/architecture.md)** · **[🐛 Issues](https://github.com/YOUR_USERNAME/lumora/issues)**

<br/>

<!-- Replace with actual screenshot/GIF -->
<img src="docs/demo.gif" alt="Lumora Demo" width="800" style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.1)"/>

</div>

---

## What is Lumora?

Lumora is an AI-powered **personal knowledge management system** that ingests your notes, PDFs, and web content, then deploys **autonomous research agents** that proactively surface insights, draft summaries, and run deep research — all queryable in natural language.

Think of it as a second brain that not only stores what you know, but **actively helps you discover what you don't know yet**.

---

## ✨ Features

- 🔍 **Hybrid RAG Pipeline** — Dense + sparse retrieval (BGE-M3 + BM25) with cross-encoder re-ranking for state-of-the-art retrieval accuracy
- 🤖 **Autonomous Research Agents** — LangGraph-powered agents with self-correction loops that search the web, Arxiv, and Wikipedia
- 🌐 **4 MCP Servers** — Filesystem, web search (DuckDuckGo), Arxiv, and Wikipedia tool servers via Model Context Protocol
- 🕸️ **Knowledge Graph** — Automatic entity extraction and relationship mapping with interactive React Flow visualization
- 💬 **Streaming Chat** — Real-time SSE streaming with live agent step indicators and source citations
- 📚 **Multi-format Ingestion** — PDFs, text files, Markdown, and web URLs
- ⚡ **Self-Correcting Agents** — Critique → refine → re-search loop for higher quality answers
- 🎨 **World-class UI** — Dark glassmorphism design with Framer Motion animations, fully responsive

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Lumora System                           │
│                                                             │
│  ┌──────────┐  SSE Stream  ┌─────────────────────────────┐  │
│  │          │◄────────────►│     FastAPI Backend          │  │
│  │  React   │              │                             │  │
│  │  Frontend│  REST/SSE    │  ┌─────────────────────┐   │  │
│  │  (Vercel)│◄────────────►│  │  LangGraph Agent    │   │  │
│  └──────────┘              │  │  ┌───────────────┐  │   │  │
│                            │  │  │ route_query   │  │   │  │
│                            │  │  │ ↓             │  │   │  │
│                            │  │  │ [tools]       │  │   │  │
│                            │  │  │ ↓             │  │   │  │
│                            │  │  │ synthesize    │  │   │  │
│                            │  │  │ ↓             │  │   │  │
│                            │  │  │ critique      │  │   │  │
│                            │  │  │ ↓ (loop ≤3x)  │  │   │  │
│                            │  │  │ format_output │  │   │  │
│                            │  │  └───────────────┘  │   │  │
│                            │  └─────────────────────┘   │  │
│                            │                             │  │
│                            │  ┌──────┐ ┌──────────────┐  │  │
│                            │  │Lance │ │  Neo4j /     │  │  │
│                            │  │  DB  │ │  NetworkX    │  │  │
│                            │  └──────┘ └──────────────┘  │  │
│                            └─────────────────────────────┘  │
│                                                             │
│  MCP Tool Servers:  🔍 Web Search  📄 Arxiv  📖 Wikipedia  📁 FS │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · TypeScript · Vite · Tailwind CSS v4 |
| **Animations** | Framer Motion 11 |
| **Graph Viz** | React Flow (@xyflow/react) |
| **State** | Zustand (persisted) |
| **Backend** | Python 3.11 · FastAPI · Uvicorn |
| **Agent Framework** | LangGraph (StateGraph + MemorySaver) |
| **LLM** | Claude claude-sonnet-4-6 (Anthropic) / GPT-4o (OpenAI) |
| **Embeddings** | BAAI/bge-m3 (FlagEmbedding) — local, free |
| **Re-ranking** | BAAI/bge-reranker-v2-m3 — local, free |
| **Vector DB** | LanceDB (embedded, no infra needed) |
| **Knowledge Graph** | Neo4j AuraDB Free / NetworkX fallback |
| **MCP Servers** | FastMCP (filesystem, web, arxiv, wikipedia) |
| **PDF Parsing** | PyMuPDF |
| **Search** | DuckDuckGo (free, no API key) · Arxiv API · Wikipedia API |
| **Hosting** | Vercel (frontend) + Render (backend) — **both FREE** |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- An LLM API key: [Anthropic](https://console.anthropic.com) or [OpenAI](https://platform.openai.com)

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/lumora.git
cd lumora
```

### 2. Backend Setup

```bash
cd backend
pip install uv
uv pip install -e .
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY or OPENAI_API_KEY
uvicorn src.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) → Go to Settings → Add your API key → Start chatting!

### Using Docker Compose (recommended)

```bash
cp backend/.env.example backend/.env
# Add your API key to backend/.env
docker-compose up
```

---

## 📁 Project Structure

```
lumora/
├── backend/
│   ├── src/
│   │   ├── agents/          # LangGraph agent (nodes, state, graph)
│   │   ├── rag/             # Ingestion, chunking, embedding, retrieval
│   │   ├── knowledge_graph/ # Neo4j/NetworkX client + entity extraction
│   │   ├── mcp_servers/     # 4 FastMCP tool servers
│   │   ├── api/v1/          # FastAPI routes (documents, chat, research, graph)
│   │   ├── services/        # LLM factory, job store, timeline
│   │   └── main.py          # FastAPI app with lifespan initialization
│   ├── Dockerfile
│   └── render.yaml          # Render.com deployment config
├── frontend/
│   └── src/
│       ├── components/      # UI: chat, graph, documents, research, timeline
│       ├── stores/          # Zustand stores (chat, documents, graph, settings)
│       ├── api/             # API client functions
│       └── lib/             # Utils, constants, layout helpers
├── .github/workflows/       # CI + Vercel deploy
├── docker-compose.yml
└── Makefile
```

---

## 🧠 How It Works

### Hybrid RAG Pipeline

1. **Ingest** — PDF/text/URL → extract text (PyMuPDF/httpx+BeautifulSoup)
2. **Chunk** — 800-token chunks with 150-token overlap
3. **Embed** — BGE-M3 → dense (1024-d) + sparse (lexical) vectors
4. **Store** — LanceDB with PyArrow schema
5. **Retrieve** — Dense ANN + BM25 FTS → Reciprocal Rank Fusion → top 20
6. **Rerank** — bge-reranker-v2-m3 cross-encoder → top 5
7. **Answer** — LLM with cited context

### Self-Correcting Agent Loop

```
Query → route_query (classify source)
      → [retrieve_local | web_search | arxiv | wikipedia]
      → synthesize (LLM generates draft)
      → critique (evaluates quality score)
      → if score < 7: refine_query → repeat (max 3x)
      → format_output → stream to user
```

### MCP Tool Servers

| Server | Tools |
|--------|-------|
| `filesystem_server` | `read_file`, `list_files`, `search_files` |
| `web_search_server` | `web_search` (DuckDuckGo), `fetch_webpage` |
| `arxiv_server` | `arxiv_search`, `arxiv_fetch_abstract` |
| `wikipedia_server` | `wikipedia_search`, `wikipedia_section` |

---

## 🌐 Free Deployment

### Deploy Frontend (Vercel)

1. Fork this repo
2. Connect to [Vercel](https://vercel.com) → Import project
3. Set root directory to `frontend`
4. Add secret in GitHub: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
5. Push to `main` → auto-deploys

### Deploy Backend (Render)

1. Create account at [render.com](https://render.com)
2. New Web Service → Connect repo → Set root: `backend`
3. Add environment variables: `ANTHROPIC_API_KEY`, `NEO4J_URI` (optional)
4. Render auto-detects the `Dockerfile`

**Total cost: $0** — both services have free tiers that cover a portfolio demo.

---

## 📊 API Reference

See [docs/api-reference.md](docs/api-reference.md) for full endpoint documentation.

Key endpoints:
- `POST /api/v1/documents/upload` — ingest PDF/text/URL
- `POST /api/v1/chat/stream` — SSE streaming chat with RAG
- `POST /api/v1/research/jobs` — launch autonomous research agent
- `GET /api/v1/graph/nodes` — knowledge graph nodes
- `GET /api/v1/health/ready` — readiness probe

Interactive docs: `http://localhost:8000/docs`

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

MIT © [YOUR_NAME](https://github.com/YOUR_USERNAME)

---

<div align="center">
  <sub>Built with ❤️ using Claude, LangGraph, and React</sub>
</div>
