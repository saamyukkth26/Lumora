from fastapi import APIRouter
from src.config import get_settings
from src.rag.embedder import BGEEmbedder
from src.rag.reranker import BGEReranker
from src.rag import store as lancestore

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def liveness():
    return {"status": "ok", "version": get_settings().app_version}


@router.get("/ready")
async def readiness():
    embedder = BGEEmbedder.get_instance()
    reranker = BGEReranker.get_instance()

    try:
        lancestore.get_table()
        db_status = "ok"
    except Exception:
        db_status = "not_ready"

    try:
        from src.knowledge_graph import client as kg
        kg_status = "neo4j" if kg._use_neo4j else "networkx"
    except Exception:
        kg_status = "unknown"

    return {
        "ready": embedder.is_loaded and db_status == "ok",
        "embedder": "ok" if embedder.is_loaded else "loading",
        "reranker": "ok" if reranker.is_loaded else "loading",
        "lancedb": db_status,
        "knowledge_graph": kg_status,
    }


@router.get("/models")
async def models():
    settings = get_settings()
    embedder = BGEEmbedder.get_instance()
    return {
        "embedder": settings.embedding_model,
        "reranker": settings.reranker_model,
        "embedder_loaded": embedder.is_loaded,
        "default_llm_model": settings.default_model,
        "has_anthropic_key": bool(settings.anthropic_api_key),
        "has_openai_key": bool(settings.openai_api_key),
    }
