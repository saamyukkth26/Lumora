from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Azure OpenAI — LLM ────────────────────────────────
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_api_version: str = "2024-12-01-preview"
    azure_openai_deployment: str = "gpt-4o-mini"

    # ── Azure OpenAI — Embeddings ─────────────────────────
    azure_openai_emb_api_key: str = ""
    azure_openai_emb_endpoint: str = ""
    azure_openai_emb_api_version: str = "2025-01-01-preview"
    azure_openai_emb_deployment: str = "text-embedding-ada-002"

    # ── Google Gemini (free tier) ─────────────────────────
    google_api_key: str = ""
    google_gemini_model: str = "gemini-1.5-flash"
    google_embedding_model: str = "models/text-embedding-004"

    # ── Fallback: direct OpenAI / Anthropic (optional) ───
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    default_model: str = "gpt-4o-mini"

    # ── LanceDB ───────────────────────────────────────────
    lancedb_path: str = "./data/lancedb"

    # ── Neo4j AuraDB (optional — falls back to NetworkX) ──
    neo4j_uri: str = ""
    neo4j_username: str = "neo4j"
    neo4j_password: str = ""

    # ── MCP ───────────────────────────────────────────────
    filesystem_base_dir: str = "./data/uploads"

    # ── Embedding vector dimension ────────────────────────
    # text-embedding-ada-002 → 1536, BGE-M3 → 1024
    embedding_dim: int = 1536

    # ── CORS — set to Vercel URL in production ────────────
    allowed_origins: str = "*"

    # ── Uploads ───────────────────────────────────────────
    max_upload_size_mb: int = 50

    # ── App ───────────────────────────────────────────────
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Force provider override (set to "gemini", "azure", "openai", "anthropic") ──
    force_provider: str = ""

    @property
    def use_azure(self) -> bool:
        if self.force_provider:
            return self.force_provider == "azure"
        return bool(self.azure_openai_api_key and self.azure_openai_endpoint)

    @property
    def use_gemini(self) -> bool:
        if self.force_provider:
            return self.force_provider == "gemini"
        return bool(self.google_api_key) and not self.use_azure


@lru_cache
def get_settings() -> Settings:
    return Settings()
