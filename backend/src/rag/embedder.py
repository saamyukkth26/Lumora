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


class GeminiEmbedder:
    """
    Singleton Google Gemini embedder (text-embedding-004, 768-d, free tier).
    Used when GOOGLE_API_KEY is set and Azure is not configured.
    """

    _instance: ClassVar["GeminiEmbedder | None"] = None

    def __init__(self, api_key: str, model: str = "models/gemini-embedding-001") -> None:
        self.api_key = api_key
        self.model = model
        self._client = None
        self.embedding_dim = 3072  # gemini-embedding-001 default output dim

    @classmethod
    def get_instance(cls) -> "GeminiEmbedder":
        if cls._instance is None:
            raise RuntimeError("GeminiEmbedder not initialized. Call init() first.")
        return cls._instance

    @classmethod
    def init(cls, api_key: str, model: str = "models/gemini-embedding-001") -> "GeminiEmbedder":
        cls._instance = cls(api_key, model)
        cls._instance.load()
        return cls._instance

    def load(self) -> None:
        import google.generativeai as genai
        genai.configure(api_key=self.api_key)
        self._client = genai
        logger.info(f"Gemini embedder ready: model={self.model}, dim=768")

    @property
    def is_loaded(self) -> bool:
        return self._client is not None

    def encode(self, texts: list[str]) -> list[EmbeddingResult]:
        if not self._client:
            raise RuntimeError("GeminiEmbedder not loaded.")
        cleaned = [t.strip().replace("\n", " ") or "empty" for t in texts]
        results = []
        for text in cleaned:
            response = self._client.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_document",
            )
            results.append(EmbeddingResult(dense=response["embedding"], sparse={}))
        return results

    async def encode_async(self, texts: list[str]) -> list[EmbeddingResult]:
        return await asyncio.to_thread(self.encode, texts)


# Module-level alias so the rest of the codebase imports consistently
BGEEmbedder = AzureEmbedder
