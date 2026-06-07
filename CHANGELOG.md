# Changelog

All notable changes to Lumora will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-07

### Added
- Hybrid RAG pipeline: BGE-M3 dense + BM25 sparse retrieval with RRF fusion
- bge-reranker-v2-m3 cross-encoder re-ranking
- LangGraph autonomous research agent with self-correction loop (≤3 iterations)
- 4 MCP tool servers: filesystem, web search, Arxiv, Wikipedia
- Knowledge graph with Neo4j AuraDB / NetworkX fallback
- Streaming chat with SSE (agent step indicators + source citations)
- React Flow interactive knowledge graph visualization
- Framer Motion animated UI with glassmorphism design
- Document ingestion: PDF (PyMuPDF), TXT, Markdown, web URLs
- Free deployment: Vercel (frontend) + Render (backend)
- GitHub Actions CI/CD pipeline
