from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ResearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    depth: int = Field(default=2, ge=1, le=3)
    session_id: str = ""


class ResearchJobSummary(BaseModel):
    job_id: str
    query: str
    status: Literal["pending", "running", "completed", "failed"]
    depth: int
    created_at: datetime


class ResearchResult(BaseModel):
    report: str
    sources: list[dict] = []
    agent_steps: list[str] = []
    iterations: int = 0
    tokens_used: int = 0


class ResearchJob(ResearchJobSummary):
    progress: int = 0  # 0-100
    current_step: str = ""
    result: ResearchResult | None = None
    error: str | None = None
    completed_at: datetime | None = None
