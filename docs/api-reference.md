# API Reference

Base URL: `http://localhost:8000/api/v1` (local) or your Render URL.

Interactive docs: `GET /docs` (Swagger UI)

## Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/upload` | Upload file or URL for ingestion |
| `GET` | `/documents` | List all documents |
| `GET` | `/documents/{id}` | Get document details |
| `GET` | `/documents/{id}/status` | Check ingestion status |
| `DELETE` | `/documents/{id}` | Delete document + vectors |

## Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat/stream` | SSE streaming chat (RAG + agent) |
| `GET` | `/chat/sessions` | List sessions |
| `GET` | `/chat/sessions/{id}` | Get session history |
| `DELETE` | `/chat/sessions/{id}` | Delete session |

**Headers for API keys:**
- `X-Anthropic-Key: sk-ant-...`
- `X-OpenAI-Key: sk-...`

**SSE Event types:**
```
event: agent_step  data: {"node": "retrieve_local", "message": "Searching..."}
event: token       data: {"delta": "The ", "session_id": "abc"}
event: sources     data: {"sources": [...]}
event: done        data: {"session_id": "abc"}
event: error       data: {"error": "..."}
```

## Research

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/research/jobs` | Launch research agent job |
| `GET` | `/research/jobs/{id}` | Poll job status |
| `GET` | `/research/jobs/{id}/stream` | SSE job progress |
| `GET` | `/research/jobs` | List all jobs |
| `DELETE` | `/research/jobs/{id}` | Delete job |

## Knowledge Graph

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/graph/nodes` | List nodes (filterable by type) |
| `GET` | `/graph/edges` | List edges |
| `GET` | `/graph/subgraph/{id}` | Get ego-network |
| `GET` | `/graph/export` | Export full graph as JSON |
| `POST` | `/graph/nodes` | Create node |
| `POST` | `/graph/edges` | Create edge |
| `DELETE` | `/graph/nodes/{id}` | Delete node |

## Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check |
| `GET` | `/health/ready` | Readiness (models + DB) |
| `GET` | `/health/models` | Loaded model info |
