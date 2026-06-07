from __future__ import annotations
from datetime import datetime, timezone
from src.rag.pipeline import get_all_documents
from src.services.job_store import get_all_jobs


def get_timeline_events() -> list[dict]:
    events = []

    for doc in get_all_documents():
        events.append({
            "event_id": f"doc_{doc['doc_id']}",
            "event_type": "document_ingested",
            "title": f"Document added: {doc['title']}",
            "description": f"Source: {doc['source']}",
            "timestamp": doc["ingested_at"].isoformat() if hasattr(doc["ingested_at"], "isoformat") else str(doc["ingested_at"]),
            "metadata": {"doc_id": doc["doc_id"], "file_type": doc["file_type"]},
        })

    for job in get_all_jobs():
        if job["status"] == "completed":
            events.append({
                "event_id": f"research_{job['job_id']}",
                "event_type": "research_completed",
                "title": f"Research: {job['query'][:60]}",
                "description": f"Depth {job['depth']} — {len(job.get('agent_steps', []))} steps",
                "timestamp": job["completed_at"].isoformat() if job.get("completed_at") else job["created_at"].isoformat(),
                "metadata": {"job_id": job["job_id"]},
            })

    events.sort(key=lambda e: e["timestamp"], reverse=True)
    return events
