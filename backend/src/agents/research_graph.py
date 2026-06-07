from __future__ import annotations
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from src.agents.state import AgentState
from src.agents.nodes.research_node import make_route_query_node
from src.agents.nodes.tools_node import (
    retrieve_local_node,
    search_web_node,
    search_arxiv_node,
    search_wikipedia_node,
)
from src.agents.nodes.synthesize_node import make_synthesize_node
from src.agents.nodes.critique_node import make_critique_node
from src.agents.nodes.refine_node import make_refine_node
from src.utils.logging import get_logger

logger = get_logger(__name__)

MAX_ITERATIONS = 3


def _route_after_critique(state: AgentState) -> str:
    if state.get("critique_passed", False):
        return "format_output"
    if state.get("iteration_count", 0) >= MAX_ITERATIONS:
        return "format_output"
    return "refine_query"


def _route_tool_choice(state: AgentState) -> str:
    choice = state.get("tool_choice", "web")
    mapping = {
        "local": "retrieve_local",
        "web": "search_web",
        "arxiv": "search_arxiv",
        "wikipedia": "search_wikipedia",
        "multi": "retrieve_local",  # retrieve local first, then web handled in synthesize
    }
    return mapping.get(choice, "search_web")


async def _format_output_node(state: AgentState) -> AgentState:
    steps = state.get("agent_steps", [])
    steps.append("Formatting final answer...")
    return {
        **state,
        "final_answer": state.get("draft_answer", ""),
        "agent_steps": steps,
    }


def build_research_graph(llm):
    """Build and compile the LangGraph research agent."""
    workflow = StateGraph(AgentState)

    # Register nodes
    workflow.add_node("route_query", make_route_query_node(llm))
    workflow.add_node("retrieve_local", retrieve_local_node)
    workflow.add_node("search_web", search_web_node)
    workflow.add_node("search_arxiv", search_arxiv_node)
    workflow.add_node("search_wikipedia", search_wikipedia_node)
    workflow.add_node("synthesize", make_synthesize_node(llm))
    workflow.add_node("critique", make_critique_node(llm))
    workflow.add_node("refine_query", make_refine_node(llm))
    workflow.add_node("format_output", _format_output_node)

    # Entry
    workflow.add_edge(START, "route_query")

    # Tool routing
    workflow.add_conditional_edges(
        "route_query",
        _route_tool_choice,
        {
            "retrieve_local": "retrieve_local",
            "search_web": "search_web",
            "search_arxiv": "search_arxiv",
            "search_wikipedia": "search_wikipedia",
        },
    )

    # All tools converge to synthesize
    for tool_node in ["retrieve_local", "search_web", "search_arxiv", "search_wikipedia"]:
        workflow.add_edge(tool_node, "synthesize")

    # Critique loop
    workflow.add_edge("synthesize", "critique")
    workflow.add_conditional_edges(
        "critique",
        _route_after_critique,
        {"format_output": "format_output", "refine_query": "refine_query"},
    )
    workflow.add_edge("refine_query", "route_query")
    workflow.add_edge("format_output", END)

    checkpointer = MemorySaver()
    graph = workflow.compile(checkpointer=checkpointer)
    logger.info("Research graph compiled successfully")
    return graph


# Module-level singleton — initialized in FastAPI lifespan
RESEARCH_GRAPH = None


def init_research_graph(llm) -> None:
    global RESEARCH_GRAPH
    RESEARCH_GRAPH = build_research_graph(llm)
    logger.info("Research graph singleton initialized")
