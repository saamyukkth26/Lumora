"""MCP server: Wikipedia article search and section fetch."""
from mcp.server.fastmcp import FastMCP
import asyncio

mcp = FastMCP("lumora-wikipedia")


@mcp.tool()
async def wikipedia_search(query: str, sentences: int = 5, language: str = "en") -> dict:
    """Search Wikipedia and return a summary of the most relevant article."""
    import wikipediaapi
    wiki = wikipediaapi.Wikipedia(language=language, user_agent="Lumora/1.0")
    page = await asyncio.to_thread(wiki.page, query)
    if not page.exists():
        return {"error": f"No Wikipedia article found for: {query}"}
    summary = " ".join(page.summary.split(". ")[:sentences]) + "."
    return {
        "title": page.title,
        "summary": summary,
        "url": page.fullurl,
        "categories": list(page.categories.keys())[:10],
    }


@mcp.tool()
async def wikipedia_section(page_title: str, section: str) -> dict:
    """Fetch a specific section from a Wikipedia article."""
    import wikipediaapi
    wiki = wikipediaapi.Wikipedia(language="en", user_agent="Lumora/1.0")
    page = await asyncio.to_thread(wiki.page, page_title)
    if not page.exists():
        return {"error": f"Page '{page_title}' not found"}
    for sec in page.sections:
        if sec.title.lower() == section.lower():
            return {"title": page.title, "section": sec.title, "content": sec.text[:2000], "url": page.fullurl}
    return {"error": f"Section '{section}' not found in '{page_title}'"}


if __name__ == "__main__":
    mcp.run(transport="stdio")
