from fastapi import APIRouter
from src.api.v1 import documents, chat, research, graph, health, timeline

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(documents.router)
api_router.include_router(chat.router)
api_router.include_router(research.router)
api_router.include_router(graph.router)
api_router.include_router(timeline.router)
