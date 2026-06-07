from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Any
import uuid

_jobs: dict[str, dict] = {}


def create_job(query: str, depth: int, session_id: str = "") -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "job_id": job_id,
        "query": query,
        "depth": depth,
        "session_id": session_id,
        "status": "pending",
        "progress": 0,
        "current_step": "",
        "result": None,
        "error": None,
        "created_at": datetime.now(timezone.utc),
        "completed_at": None,
        "agent_steps": [],
    }
    return job_id


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)


def get_all_jobs(session_id: str = "") -> list[dict]:
    jobs = list(_jobs.values())
    if session_id:
        jobs = [j for j in jobs if j["session_id"] == session_id]
    return sorted(jobs, key=lambda j: j["created_at"], reverse=True)


def update_job(job_id: str, **kwargs: Any) -> None:
    if job_id in _jobs:
        _jobs[job_id].update(kwargs)


def delete_job(job_id: str) -> bool:
    if job_id in _jobs:
        del _jobs[job_id]
        return True
    return False
