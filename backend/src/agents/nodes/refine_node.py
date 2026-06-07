from __future__ import annotations
from langchain_core.messages import SystemMessage, HumanMessage
from src.agents.state import AgentState
from src.agents.prompts.refine import REFINE_SYSTEM, REFINE_USER


async def refine_node(state: AgentState, llm) -> AgentState:
    query = state.get("query", "")
    feedback = state.get("critique_feedback", "")
    iteration = state.get("iteration_count", 0) + 1
    steps = state.get("agent_steps", [])
    steps.append(f"Refining query (attempt {iteration})...")

    try:
        response = await llm.ainvoke([
            SystemMessage(content=REFINE_SYSTEM),
            HumanMessage(content=REFINE_USER.format(query=query, feedback=feedback)),
        ])
        refined = response.content.strip()
    except Exception:
        refined = query  # fallback: keep original

    return {
        **state,
        "refined_query": refined,
        "iteration_count": iteration,
        "search_results": [],   # clear for fresh search
        "local_chunks": [],
        "agent_steps": steps,
    }


def make_refine_node(llm):
    async def node(state: AgentState) -> AgentState:
        return await refine_node(state, llm)
    return node
