from __future__ import annotations
import asyncio
from dataclasses import dataclass
from typing import ClassVar
from src.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class RankedChunk:
    chunk: dict
    score: float


class BGEReranker:
    """Singleton bge-reranker-v2-m3 cross-encoder."""

    _instance: ClassVar[BGEReranker | None] = None

    def __init__(self, model_name: str = "BAAI/bge-reranker-v2-m3") -> None:
        self.model_name = model_name
        self._model = None

    @classmethod
    def get_instance(cls, model_name: str = "BAAI/bge-reranker-v2-m3") -> "BGEReranker":
        if cls._instance is None:
            cls._instance = cls(model_name)
        return cls._instance

    def load(self) -> None:
        logger.info(f"Loading reranker model: {self.model_name}")
        from FlagEmbedding import FlagReranker
        self._model = FlagReranker(self.model_name, use_fp16=True)
        logger.info("Reranker model loaded successfully")

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def rerank(self, query: str, chunks: list[dict], top_n: int = 5) -> list[RankedChunk]:
        if not self._model:
            # Fallback: return as-is with dummy scores
            return [RankedChunk(chunk=c, score=1.0 / (i + 1)) for i, c in enumerate(chunks[:top_n])]

        pairs = [(query, c.get("text", "")[:512]) for c in chunks]
        scores = self._model.compute_score(pairs, normalize=True)
        ranked = sorted(zip(scores, chunks), key=lambda x: x[0], reverse=True)
        return [RankedChunk(chunk=c, score=float(s)) for s, c in ranked[:top_n]]

    async def rerank_async(self, query: str, chunks: list[dict], top_n: int = 5) -> list[RankedChunk]:
        return await asyncio.to_thread(self.rerank, query, chunks, top_n)
