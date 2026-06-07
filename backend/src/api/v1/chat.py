from fastapi import APIRouter, Header
from fastapi.responses import StreamingResponse
from src.models.chat import ChatRequest, ChatSession, SessionSummary, ChatMessage, Source
from src.config import get_settings
from src.utils.logging import get_logger
import uuid
import json
from datetime import datetime, timezone

router = APIRouter(prefix="/chat", tags=["chat"])
logger = get_logger(__name__)

# In-memory session store
_sessions: dict[str, list[dict]] = {}


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    x_anthropic_key: str = Header(default=""),
    x_openai_key: str = Header(default=""),
):
    settings = get_settings()
    anthropic_key = x_anthropic_key or settings.anthropic_api_key
    openai_key = x_openai_key or settings.openai_api_key

    session_id = request.session_id or str(uuid.uuid4())
    if session_id not in _sessions:
        _sessions[session_id] = []

    _sessions[session_id].append({
        "role": "user",
        "content": request.query,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    async def event_stream():
        try:
            from src.services.llm_factory import get_llm_from_keys
            from src.rag.pipeline import query as rag_query

            # Step 1: RAG retrieval
            yield f"event: agent_step\ndata: {json.dumps({'node': 'retrieve_local', 'message': 'Searching knowledge base...'})}\n\n"

            rag_result = await rag_query(request.query, top_k=5)

            yield f"event: agent_step\ndata: {json.dumps({'node': 'synthesize', 'message': 'Generating answer...'})}\n\n"

            # Step 2: LLM streaming
            llm = get_llm_from_keys(anthropic_key, openai_key, streaming=True)

            context = rag_result.context
            history = _sessions[session_id][-10:]  # last 10 messages for context

            system_prompt = (
                "You are Lumora, an intelligent personal research assistant. "
                "Use the provided context to answer accurately. "
                "Cite sources inline as [Source N]. "
                "If the context doesn't contain the answer, say so honestly."
            )

            messages_for_llm = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {request.query}"},
            ]

            full_response = ""
            async for chunk in llm.astream(messages_for_llm):
                delta = chunk.content if hasattr(chunk, "content") else str(chunk)
                if delta:
                    full_response += delta
                    yield f"event: token\ndata: {json.dumps({'delta': delta, 'session_id': session_id})}\n\n"

            # Store assistant message
            _sessions[session_id].append({
                "role": "assistant",
                "content": full_response,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            yield f"event: sources\ndata: {json.dumps({'sources': rag_result.sources})}\n\n"
            yield f"event: done\ndata: {json.dumps({'session_id': session_id})}\n\n"

        except Exception as e:
            logger.error(f"Chat stream error: {e}")
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/sessions", response_model=list[SessionSummary])
async def list_sessions():
    result = []
    for sid, messages in _sessions.items():
        last = messages[-1]["content"][:80] if messages else ""
        result.append(SessionSummary(
            session_id=sid,
            message_count=len(messages),
            last_message=last,
            updated_at=datetime.now(timezone.utc),
        ))
    return result


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    if session_id not in _sessions:
        from fastapi import HTTPException
        raise HTTPException(404, "Session not found")
    return {"session_id": session_id, "messages": _sessions[session_id]}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id in _sessions:
        del _sessions[session_id]
    return {"deleted": True, "session_id": session_id}
