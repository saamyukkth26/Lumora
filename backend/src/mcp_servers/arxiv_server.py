"""MCP server: Arxiv paper search and abstract fetch."""
from mcp.server.fastmcp import FastMCP
import asyncio

mcp = FastMCP("lumora-arxiv")


@mcp.tool()
async def arxiv_search(query: str, max_results: int = 5, sort_by: str = "relevance") -> dict:
    """Search Arxiv for academic papers. Returns title, authors, abstract, and PDF URL."""
    import arxiv
    sort_map = {
        "relevance": arxiv.SortCriterion.Relevance,
        "date": arxiv.SortCriterion.SubmittedDate,
    }
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=min(max_results, 10),
        sort_by=sort_map.get(sort_by, arxiv.SortCriterion.Relevance),
    )
    papers = await asyncio.to_thread(lambda: list(client.results(search)))
    return {
        "papers": [
            {
                "arxiv_id": p.entry_id.split("/")[-1],
                "title": p.title,
                "authors": [a.name for a in p.authors[:5]],
                "abstract": p.summary[:500],
                "pdf_url": p.pdf_url,
                "published": str(p.published)[:10],
                "categories": p.categories,
            }
            for p in papers
        ]
    }


@mcp.tool()
async def arxiv_fetch_abstract(arxiv_id: str) -> dict:
    """Fetch full abstract and metadata for a specific Arxiv paper by ID."""
    import arxiv
    client = arxiv.Client()
    search = arxiv.Search(id_list=[arxiv_id])
    papers = await asyncio.to_thread(lambda: list(client.results(search)))
    if not papers:
        return {"error": f"Paper {arxiv_id} not found"}
    p = papers[0]
    return {
        "arxiv_id": arxiv_id,
        "title": p.title,
        "authors": [a.name for a in p.authors],
        "abstract": p.summary,
        "pdf_url": p.pdf_url,
        "published": str(p.published)[:10],
        "categories": p.categories,
    }


if __name__ == "__main__":
    mcp.run(transport="stdio")
