from __future__ import annotations
from src.rag import store as lancestore
from src.utils.logging import get_logger

logger = get_logger(__name__)


def _rrf_fusion(
    dense_results: list[dict],
    sparse_results: list[dict],
    k: int = 60,
    top_n: int = 20,
) -> list[dict]:
    scores: dict[str, float] = {}
    all_docs: dict[str, dict] = {}

    for rank, doc in enumerate(dense_results):
        cid = doc["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
        all_docs[cid] = doc

    for rank, doc in enumerate(sparse_results):
        cid = doc["chunk_id"]
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)
        all_docs[cid] = doc

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [all_docs[cid] for cid, _ in ranked[:top_n]]


def _get_embedder():
    from src.rag.embedder import GeminiEmbedder, AzureEmbedder
    try:
        return GeminiEmbedder.get_instance()
    except RuntimeError:
        return AzureEmbedder.get_instance()


async def hybrid_search(query: str, top_k: int = 20) -> list[dict]:
    embedder = _get_embedder()
    results = await embedder.encode_async([query])
    query_vec = results[0].dense

    dense_hits, fts_hits = await lancestore.vector_search(query_vec, top_k), await lancestore.fts_search(query, top_k)

    fused = _rrf_fusion(dense_hits, fts_hits, top_n=top_k)
    logger.debug(f"Hybrid search: {len(dense_hits)} dense + {len(fts_hits)} FTS → {len(fused)} fused")
    return fused
