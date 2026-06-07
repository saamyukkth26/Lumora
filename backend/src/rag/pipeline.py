from __future__ import annotations
import asyncio
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime, timezone
from src.rag.ingestion import load_document, RawDocument
from src.rag.chunker import chunk_document, Chunk
from src.rag.retriever import _get_embedder
from src.rag.reranker import BGEReranker, RankedChunk
from src.rag import store as lancestore
from src.rag.retriever import hybrid_search
from src.utils.logging import get_logger

logger = get_logger(__name__)

# In-memory document registry: doc_id → metadata + status
_doc_registry: dict[str, dict] = {}
_ingest_queue: asyncio.Queue = asyncio.Queue()


@dataclass
class RAGResult:
    ranked_chunks: list[RankedChunk]
    context: str
    sources: list[dict] = field(default_factory=list)


def assemble_context(query: str, ranked_chunks: list[RankedChunk]) -> str:
    parts = []
    for i, rc in enumerate(ranked_chunks, 1):
        chunk = rc.chunk
        parts.append(
            f"[Source {i}] {chunk.get('title', 'Unknown')} ({chunk.get('source', '')})\n"
            f"Relevance: {rc.score:.2f}\n\n"
            f"{chunk.get('text', '')}\n"
            f"{'─' * 60}"
        )
    return "\n\n".join(parts)


async def ingest_document(source: str, file_type: str | None = None) -> str:
    """Ingest a document asynchronously. Returns doc_id."""
    raw_doc = await load_document(source, file_type)
    doc_id = raw_doc.doc_id

    _doc_registry[doc_id] = {
        "doc_id": doc_id,
        "title": raw_doc.metadata.get("title", "Untitled"),
        "source": raw_doc.metadata.get("source", source),
        "file_type": raw_doc.metadata.get("file_type", "txt"),
        "status": "processing",
        "chunk_count": 0,
        "ingested_at": datetime.now(timezone.utc),
        "size_bytes": len(raw_doc.content.encode()),
    }

    # Run heavy processing in background
    asyncio.create_task(_process_document(doc_id, raw_doc))
    return doc_id


async def _process_document(doc_id: str, raw_doc: RawDocument) -> None:
    try:
        chunks = chunk_document(doc_id, raw_doc.content, raw_doc.metadata)
        embedder = _get_embedder()
        texts = [c.text_for_embedding for c in chunks]
        embedding_results = await embedder.encode_async(texts)
        vectors = [r.dense for r in embedding_results]
        await lancestore.upsert_chunks(chunks, vectors)
        _doc_registry[doc_id]["status"] = "ready"
        _doc_registry[doc_id]["chunk_count"] = len(chunks)
        logger.info(f"Ingested doc {doc_id}: {len(chunks)} chunks")

        # Trigger knowledge graph entity extraction asynchronously
        try:
            from src.knowledge_graph.builder import extract_entities_from_chunks
            await extract_entities_from_chunks(chunks, doc_id, raw_doc.metadata.get("title", ""))
        except Exception as kg_err:
            logger.warning(f"KG extraction skipped: {kg_err}")

    except Exception as e:
        logger.error(f"Ingestion failed for {doc_id}: {e}")
        _doc_registry[doc_id]["status"] = "failed"
        _doc_registry[doc_id]["error"] = str(e)


async def query(query_text: str, top_k: int = 5) -> RAGResult:
    candidates = await hybrid_search(query_text, top_k=20)
    if not candidates:
        return RAGResult(ranked_chunks=[], context="No relevant documents found.", sources=[])

    reranker = BGEReranker.get_instance()
    ranked = await reranker.rerank_async(query_text, candidates, top_n=top_k)
    context = assemble_context(query_text, ranked)

    sources = [
        {
            "source_id": rc.chunk.get("chunk_id", ""),
            "title": rc.chunk.get("title", ""),
            "url": rc.chunk.get("source", ""),
            "snippet": rc.chunk.get("text", "")[:200],
            "relevance_score": rc.score,
            "doc_id": rc.chunk.get("doc_id", ""),
        }
        for rc in ranked
    ]
    return RAGResult(ranked_chunks=ranked, context=context, sources=sources)


def get_all_documents() -> list[dict]:
    return list(_doc_registry.values())


def get_document(doc_id: str) -> dict | None:
    return _doc_registry.get(doc_id)


async def delete_document(doc_id: str) -> bool:
    if doc_id not in _doc_registry:
        return False
    await lancestore.delete_chunks_by_doc(doc_id)
    del _doc_registry[doc_id]
    return True
