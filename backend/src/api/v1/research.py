from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from src.models.research import ResearchRequest, ResearchJob, ResearchJobSummary
from src.services import job_store
from src.config import get_settings
from src.utils.logging import get_logger
import asyncio
import json
from datetime import datetime, timezone

router = APIRouter(prefix="/research", tags=["research"])
logger = get_logger(__name__)


@router.post("/jobs", response_model=dict)
async def create_research_job(
    request: ResearchRequest,
    x_anthropic_key: str = Header(default=""),
    x_openai_key: str = Header(default=""),
):
    job_id = job_store.create_job(request.query, request.depth, request.session_id)
    asyncio.create_task(_run_research_job(job_id, request, x_anthropic_key, x_openai_key))
    return {"job_id": job_id, "status": "pending"}


async def _run_research_job(
    job_id: str,
    request: ResearchRequest,
    anthropic_key: str,
    openai_key: str,
) -> None:
    settings = get_settings()
    ant_key = anthropic_key or settings.anthropic_api_key
    oai_key = openai_key or settings.openai_api_key

    job_store.update_job(job_id, status="running", progress=5, current_step="Initializing agent...")

    try:
        from src.services.llm_factory import get_llm_from_keys
        from src.agents.research_graph import build_research_graph
        from src.agents.state import AgentState

        llm = get_llm_from_keys(ant_key, oai_key, streaming=False)
        graph = build_research_graph(llm)

        initial_state: AgentState = {
            "query": request.query,
            "refined_query": "",
            "search_results": [],
            "local_chunks": [],
            "draft_answer": "",
            "critique_passed": False,
            "critique_feedback": "",
            "iteration_count": 0,
            "sources": [],
            "final_answer": "",
            "tool_choice": "",
            "session_id": request.session_id,
            "depth": request.depth,
            "agent_steps": [],
        }

        config = {"configurable": {"thread_id": job_id}}
        job_store.update_job(job_id, progress=10)

        final_state = await graph.ainvoke(initial_state, config=config)

        job_store.update_job(
            job_id,
            status="completed",
            progress=100,
            current_step="Done",
            result={
                "report": final_state.get("final_answer", ""),
                "sources": final_state.get("sources", []),
                "agent_steps": final_state.get("agent_steps", []),
                "iterations": final_state.get("iteration_count", 0),
            },
            agent_steps=final_state.get("agent_steps", []),
            completed_at=datetime.now(timezone.utc),
        )
    except Exception as e:
        logger.error(f"Research job {job_id} failed: {e}")
        job_store.update_job(job_id, status="failed", error=str(e), completed_at=datetime.now(timezone.utc))


@router.get("/jobs/{job_id}")
async def get_research_job(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@router.get("/jobs/{job_id}/stream")
async def stream_research_job(job_id: str):
    async def event_stream():
        prev_step = ""
        prev_progress = -1
        for _ in range(300):  # max 5 min polling
            job = job_store.get_job(job_id)
            if not job:
                yield f"event: error\ndata: {json.dumps({'error': 'Job not found'})}\n\n"
                return

            steps = job.get("agent_steps", [])
            current = steps[-1] if steps else ""
            if current != prev_step or job["progress"] != prev_progress:
                yield f"event: update\ndata: {json.dumps({'status': job['status'], 'progress': job['progress'], 'current_step': current})}\n\n"
                prev_step = current
                prev_progress = job["progress"]

            if job["status"] in ("completed", "failed"):
                yield f"event: done\ndata: {json.dumps({'status': job['status'], 'job_id': job_id})}\n\n"
                return

            await asyncio.sleep(1)

    return StreamingResponse(event_stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/jobs")
async def list_research_jobs(session_id: str = ""):
    return job_store.get_all_jobs(session_id)


@router.delete("/jobs/{job_id}")
async def delete_research_job(job_id: str):
    deleted = job_store.delete_job(job_id)
    if not deleted:
        raise HTTPException(404, "Job not found")
    return {"deleted": True, "job_id": job_id}
