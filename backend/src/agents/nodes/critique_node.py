from __future__ import annotations
import json
from langchain_core.messages import SystemMessage, HumanMessage
from src.agents.state import AgentState
from src.agents.prompts.critique import CRITIQUE_SYSTEM, CRITIQUE_USER


async def critique_node(state: AgentState, llm) -> AgentState:
    query = state.get("query", "")
    draft = state.get("draft_answer", "")
    steps = state.get("agent_steps", [])
    steps.append("Critiquing answer quality...")

    try:
        response = await llm.ainvoke([
            SystemMessage(content=CRITIQUE_SYSTEM),
            HumanMessage(content=CRITIQUE_USER.format(query=query, draft_answer=draft)),
        ])
        # Parse JSON from response
        content = response.content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        result = json.loads(content)
        passed = bool(result.get("passed", False))
        feedback = str(result.get("feedback", ""))
    except Exception:
        # Default to passing if critique fails
        passed = True
        feedback = ""

    return {
        **state,
        "critique_passed": passed,
        "critique_feedback": feedback,
        "agent_steps": steps,
    }


def make_critique_node(llm):
    async def node(state: AgentState) -> AgentState:
        return await critique_node(state, llm)
    return node
