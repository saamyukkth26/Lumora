from __future__ import annotations
from typing import TypedDict, Any


class AgentState(TypedDict, total=False):
    query: str
    refined_query: str
    search_results: list[dict]
    local_chunks: list[dict]
    draft_answer: str
    critique_passed: bool
    critique_feedback: str
    iteration_count: int       # max 3
    sources: list[dict]
    final_answer: str
    tool_choice: str           # "local" | "web" | "arxiv" | "wikipedia" | "multi"
    session_id: str
    depth: int                 # 1-3 research depth
    agent_steps: list[str]
