from __future__ import annotations
from langchain_core.messages import SystemMessage, HumanMessage
from src.agents.state import AgentState
from src.agents.prompts.research import ROUTE_SYSTEM


async def route_query_node(state: AgentState, llm) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])

    try:
        response = await llm.ainvoke([
            SystemMessage(content=ROUTE_SYSTEM),
            HumanMessage(content=f"Query: {query}"),
        ])
        tool_choice = response.content.strip().strip('"').lower()
        valid = {"local", "web", "arxiv", "wikipedia", "multi"}
        if tool_choice not in valid:
            tool_choice = "web"
    except Exception:
        tool_choice = "web"

    steps.append(f"Routing query to: {tool_choice}")
    return {**state, "tool_choice": tool_choice, "agent_steps": steps}


def make_route_query_node(llm):
    async def node(state: AgentState) -> AgentState:
        return await route_query_node(state, llm)
    return node
