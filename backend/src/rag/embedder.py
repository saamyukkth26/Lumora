from __future__ import annotations
import asyncio
from dataclasses import dataclass, field
from typing import ClassVar
from src.utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class EmbeddingResult:
    dense: list[float]
    sparse: dict[int, float] = field(default_factory=dict)  # empty for Ada-002 (dense-only)


class AzureEmbedder:
    """
    Singleton Azure OpenAI embedder (text-embedding-ada-002, 1536-d).
    Replaces BGE-M3 — no local model download, works out of the box with Azure credentials.
    Sparse weights are left empty; RRF fusion falls back to dense-only ranking.
    """

    _instance: ClassVar[AzureEmbedder | None] = None

    def __init__(self, deployment: str, endpoint: str, api_key: str, api_version: str) -> None:
        self.deployment = deployment
        self.endpoint = endpoint
        self.api_key = api_key
        self.api_version = api_version
        self._client = None
        self.embedding_dim = 1536

    @classmethod
    def get_instance(cls) -> AzureEmbedder:
        if cls._instance is None:
            raise RuntimeError("AzureEmbedder not initialized. Call init() first.")
        return cls._instance

    @classmethod
    def init(cls, deployment: str, endpoint: str, api_key: str, api_version: str) -> AzureEmbedder:
        cls._instance = cls(deployment, endpoint, api_key, api_version)
        cls._instance.load()
        return cls._instance

    def load(self) -> None:
        from openai import AzureOpenAI
        self._client = AzureOpenAI(
            api_key=self.api_key,
            azure_endpoint=self.endpoint,
            api_version=self.api_version,
        )
        logger.info(f"Azure embedder ready: deployment={self.deployment}")

    @property
    def is_loaded(self) -> bool:
        return self._client is not None

    def encode(self, texts: list[str]) -> list[EmbeddingResult]:
        if not self._client:
            raise RuntimeError("Embedder not loaded.")

        # Clean texts — Azure rejects empty strings
        cleaned = [t.strip().replace("\n", " ") or "empty" for t in texts]

        response = self._client.embeddings.create(
            input=cleaned,
            model=self.deployment,
        )
        results = []
        for item in response.data:
            results.append(EmbeddingResult(dense=item.embedding, sparse={}))
        return results

    async def encode_async(self, texts: list[str]) -> list[EmbeddingResult]:
        return await asyncio.to_thread(self.encode, texts)


# Module-level alias so the rest of the codebase imports consistently
BGEEmbedder = AzureEmbedder
