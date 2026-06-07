from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.config import get_settings
from src.utils.logging import setup_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    setup_logging(settings.debug)
    logger.info("Starting Lumora backend...")

    # 1. Initialize embedder — Azure preferred, Gemini fallback
    if settings.use_azure:
        from src.rag.embedder import AzureEmbedder
        try:
            AzureEmbedder.init(
                deployment=settings.azure_openai_emb_deployment,
                endpoint=settings.azure_openai_emb_endpoint,
                api_key=settings.azure_openai_emb_api_key,
                api_version=settings.azure_openai_emb_api_version,
            )
            logger.info("Azure embedder initialized (1536-d)")
        except Exception as e:
            logger.warning(f"Azure embedder init failed: {e}")
    elif settings.google_api_key:
        from src.rag.embedder import GeminiEmbedder
        try:
            GeminiEmbedder.init(
                api_key=settings.google_api_key,
                model=settings.google_embedding_model,
            )
            # Update LanceDB dim for Gemini (768-d)
            settings.__dict__['embedding_dim'] = 768
            logger.info("Gemini embedder initialized (3072-d)")
        except Exception as e:
            logger.warning(f"Gemini embedder init failed: {e}")

    # 2. Reranker — soft-load, fallback is built-in if unavailable
    from src.rag.reranker import BGEReranker
    reranker = BGEReranker.get_instance()
    try:
        reranker.load()
    except Exception as e:
        logger.warning(f"Reranker model load failed (fallback active): {e}")

    # 3. Initialize LanceDB
    from src.rag import store as lancestore
    await lancestore.init_store(settings.lancedb_path)

    # 4. Initialize Knowledge Graph (Neo4j or NetworkX fallback)
    from src.knowledge_graph import client as kg
    import os
    os.makedirs("./data", exist_ok=True)
    await kg.init_graph(
        neo4j_uri=settings.neo4j_uri,
        neo4j_user=settings.neo4j_username,
        neo4j_password=settings.neo4j_password,
        fallback_path="./data/graph.json",
    )

    # 5. Initialize LangGraph research agent
    try:
        from src.services.llm_factory import get_llm
        from src.agents.research_graph import init_research_graph
        llm = get_llm(settings)
        init_research_graph(llm)
    except Exception as e:
        logger.warning(f"Research graph init skipped (no API key configured): {e}")

    logger.info("Lumora backend ready")
    yield

    logger.info("Shutting down Lumora backend...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Lumora API",
        description="Personal Second Brain with Autonomous Research Agents",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    origins = ["*"] if settings.allowed_origins == "*" else settings.allowed_origins.split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Disable nginx buffering for SSE
    @app.middleware("http")
    async def add_sse_headers(request: Request, call_next):
        response = await call_next(request)
        if "text/event-stream" in response.headers.get("content-type", ""):
            response.headers["X-Accel-Buffering"] = "no"
        return response

    # Routes
    from src.api.router import api_router
    app.include_router(api_router)

    @app.get("/")
    async def root():
        return {"name": "Lumora", "version": settings.app_version, "docs": "/docs"}

    return app


app = create_app()
