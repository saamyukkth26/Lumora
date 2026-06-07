import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock


@pytest.fixture
def mock_settings(monkeypatch):
    from src.config import Settings
    settings = Settings(
        anthropic_api_key="test-key",
        lancedb_path="./test_data/lancedb",
        neo4j_uri="",
    )
    monkeypatch.setattr("src.config.get_settings", lambda: settings)
    return settings


@pytest.fixture
def mock_embedder(monkeypatch):
    from src.rag.embedder import BGEEmbedder, EmbeddingResult
    mock = MagicMock(spec=BGEEmbedder)
    mock.is_loaded = True
    mock.encode.return_value = [EmbeddingResult(dense=[0.1] * 1024, sparse={})]
    mock.encode_async = AsyncMock(return_value=[EmbeddingResult(dense=[0.1] * 1024, sparse={})])
    monkeypatch.setattr("src.rag.embedder.BGEEmbedder.get_instance", lambda *a, **kw: mock)
    return mock
