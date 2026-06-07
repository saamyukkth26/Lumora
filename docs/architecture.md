# Lumora Architecture

## Overview

Lumora is a full-stack AI knowledge management system with a React frontend (Vercel) and a FastAPI backend (Render).

## Data Flow

```
User Input
    │
    ▼
ChatPanel (React)
    │ POST /api/v1/chat/stream
    ▼
FastAPI SSE Endpoint
    │
    ├── RAG Pipeline
    │     ├── LanceDB hybrid search (dense + BM25)
    │     └── bge-reranker-v2-m3 cross-encoder
    │
    ├── LangGraph Agent (research mode)
    │     ├── route_query → tool selection
    │     ├── [retrieve_local | web_search | arxiv | wikipedia]
    │     ├── synthesize → LLM draft
    │     ├── critique → quality gate
    │     └── refine → retry (max 3x)
    │
    └── SSE Stream → Frontend
          ├── event: agent_step
          ├── event: token (streaming text)
          ├── event: sources
          └── event: done
```

## Key Design Decisions

### Why LanceDB over Pinecone/Qdrant?
LanceDB runs embedded — no separate process, no cloud account, no cost. It supports IVF-PQ ANN indexing and FTS (BM25) in the same table. Perfect for a free-tier Render deployment with a persistent disk.

### Why FlagEmbedding over sentence-transformers?
`FlagEmbedding.BGEM3FlagModel` returns dense AND sparse vectors from a single forward pass. This is essential for true hybrid retrieval without a separate BM25 index.

### Why NetworkX as Neo4j fallback?
Neo4j AuraDB Free allows only 1 instance per account and may be unavailable. NetworkX provides identical query semantics (graph traversal) with a JSON file backend that survives Render redeploys.

### Why SSE over WebSockets?
SSE works over HTTP/1.1, doesn't require an upgrade handshake, and auto-reconnects. Sufficient for unidirectional token streaming from server to client.

### MCP Server Architecture
All 4 MCP servers run as child processes launched by the agent via `asyncio.subprocess`. They communicate via stdio (JSON-RPC). This is the official MCP transport for local tools and makes each server independently testable.
