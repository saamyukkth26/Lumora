"""MCP server: web search via DuckDuckGo + webpage fetching."""
from mcp.server.fastmcp import FastMCP
import asyncio
import httpx
from bs4 import BeautifulSoup

mcp = FastMCP("lumora-web-search")


@mcp.tool()
async def web_search(query: str, max_results: int = 5) -> dict:
    """Search the web using DuckDuckGo. Returns title, URL, and snippet for top results."""
    from duckduckgo_search import DDGS
    results = await asyncio.to_thread(
        lambda: list(DDGS().text(query, max_results=min(max_results, 10)))
    )
    return {
        "results": [
            {"title": r.get("title", ""), "url": r.get("href", ""), "snippet": r.get("body", "")}
            for r in results
        ]
    }


@mcp.tool()
async def fetch_webpage(url: str, max_chars: int = 5000) -> dict:
    """Fetch and extract readable text content from a URL."""
    headers = {"User-Agent": "Lumora/1.0 (research assistant)"}
    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else url
    content = soup.get_text(separator="\n")
    content = " ".join(content.split())[:max_chars]
    return {"title": title, "content": content, "url": url}


if __name__ == "__main__":
    mcp.run(transport="stdio")
