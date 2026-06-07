from fastapi import APIRouter
from src.services.timeline import get_timeline_events

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("")
async def get_timeline():
    return {"events": get_timeline_events()}
