from __future__ import annotations
from langchain_core.messages import SystemMessage, HumanMessage
from src.agents.state import AgentState
from src.agents.prompts.research import SYNTHESIZE_SYSTEM, SYNTHESIZE_USER


def _build_context(state: AgentState) -> str:
    parts = []
    for i, chunk in enumerate(state.get("local_chunks", []), 1):
        parts.append(f"[Local Source {i}] {chunk.get('title', 'Note')}\n{chunk.get('text', '')[:400]}")
    for i, result in enumerate(state.get("search_results", []), len(state.get("local_chunks", [])) + 1):
        parts.append(f"[Source {i}] {result.get('title', '')}\nURL: {result.get('url', '')}\n{result.get('snippet', '')[:400]}")
    return "\n\n---\n\n".join(parts) if parts else "No sources found."


async def synthesize_node(state: AgentState, llm) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])
    steps.append("Synthesizing answer...")
    context = _build_context(state)

    try:
        response = await llm.ainvoke([
            SystemMessage(content=SYNTHESIZE_SYSTEM),
            HumanMessage(content=SYNTHESIZE_USER.format(query=query, context=context)),
        ])
        draft = response.content
    except Exception as e:
        draft = f"I encountered an error while synthesizing: {e}"

    # Build sources list
    sources = []
    for chunk in state.get("local_chunks", []):
        sources.append({"title": chunk.get("title", ""), "url": chunk.get("source", ""), "snippet": chunk.get("text", "")[:150]})
    for result in state.get("search_results", []):
        sources.append({"title": result.get("title", ""), "url": result.get("url", ""), "snippet": result.get("snippet", "")[:150]})

    return {**state, "draft_answer": draft, "sources": sources, "agent_steps": steps}


def make_synthesize_node(llm):
    async def node(state: AgentState) -> AgentState:
        return await synthesize_node(state, llm)
    return node
