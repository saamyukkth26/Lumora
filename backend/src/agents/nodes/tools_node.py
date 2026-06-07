from __future__ import annotations
from src.agents.state import AgentState
from src.utils.logging import get_logger

logger = get_logger(__name__)


async def retrieve_local_node(state: AgentState) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])
    steps.append("Searching local knowledge base...")

    try:
        from src.rag.pipeline import query as rag_query
        result = await rag_query(query, top_k=5)
        local_chunks = [
            {"text": rc.chunk.get("text", ""), "source": rc.chunk.get("source", ""), "title": rc.chunk.get("title", ""), "score": rc.score}
            for rc in result.ranked_chunks
        ]
    except Exception as e:
        logger.error(f"Local retrieval error: {e}")
        local_chunks = []

    return {**state, "local_chunks": local_chunks, "agent_steps": steps}


async def search_web_node(state: AgentState) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])
    steps.append("Searching the web...")

    try:
        from duckduckgo_search import DDGS
        import asyncio
        results = await asyncio.to_thread(
            lambda: list(DDGS().text(query, max_results=5))
        )
        search_results = [{"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")} for r in results]
    except Exception as e:
        logger.error(f"Web search error: {e}")
        search_results = []

    existing = state.get("search_results", [])
    return {**state, "search_results": existing + search_results, "agent_steps": steps}


async def search_arxiv_node(state: AgentState) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])
    steps.append("Searching Arxiv for papers...")

    try:
        import arxiv
        import asyncio
        client = arxiv.Client()
        search = arxiv.Search(query=query, max_results=5, sort_by=arxiv.SortCriterion.Relevance)
        papers = await asyncio.to_thread(lambda: list(client.results(search)))
        search_results = [
            {
                "title": p.title,
                "url": p.pdf_url,
                "snippet": p.summary[:300],
                "authors": [a.name for a in p.authors[:3]],
                "published": str(p.published)[:10],
                "source": "arxiv",
            }
            for p in papers
        ]
    except Exception as e:
        logger.error(f"Arxiv search error: {e}")
        search_results = []

    existing = state.get("search_results", [])
    return {**state, "search_results": existing + search_results, "agent_steps": steps}


async def search_wikipedia_node(state: AgentState) -> AgentState:
    query = state.get("refined_query") or state.get("query", "")
    steps = state.get("agent_steps", [])
    steps.append("Searching Wikipedia...")

    try:
        import wikipediaapi
        import asyncio
        wiki = wikipediaapi.Wikipedia(language="en", user_agent="Lumora/1.0")
        page = await asyncio.to_thread(wiki.page, query)
        if page.exists():
            search_results = [{
                "title": page.title,
                "url": page.fullurl,
                "snippet": page.summary[:600],
                "source": "wikipedia",
            }]
        else:
            search_results = []
    except Exception as e:
        logger.error(f"Wikipedia search error: {e}")
        search_results = []

    existing = state.get("search_results", [])
    return {**state, "search_results": existing + search_results, "agent_steps": steps}
