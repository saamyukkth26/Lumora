"""MCP server: secure local filesystem access within allowed base directory."""
from mcp.server.fastmcp import FastMCP
from pathlib import Path
import os

mcp = FastMCP("lumora-filesystem")
BASE_DIR = Path(os.environ.get("FILESYSTEM_BASE_DIR", "./data/uploads")).resolve()


def _safe_path(relative_path: str) -> Path:
    resolved = (BASE_DIR / relative_path).resolve()
    if not str(resolved).startswith(str(BASE_DIR)):
        raise PermissionError(f"Access denied: {relative_path} is outside allowed directory")
    return resolved


@mcp.tool()
async def read_file(path: str) -> dict:
    """Read the text content of a local file within the allowed base directory."""
    full_path = _safe_path(path)
    if not full_path.exists():
        return {"error": f"File not found: {path}"}
    if not full_path.is_file():
        return {"error": f"Not a file: {path}"}
    content = full_path.read_text(encoding="utf-8", errors="replace")
    return {"content": content, "size_bytes": full_path.stat().st_size, "path": path}


@mcp.tool()
async def list_files(directory: str = "") -> dict:
    """List files in a directory within the allowed base path."""
    full_path = _safe_path(directory) if directory else BASE_DIR
    if not full_path.is_dir():
        return {"error": f"Not a directory: {directory}"}
    files = []
    for item in full_path.iterdir():
        files.append({
            "name": item.name,
            "type": "directory" if item.is_dir() else "file",
            "size": item.stat().st_size if item.is_file() else 0,
        })
    return {"files": files, "directory": directory or ""}


@mcp.tool()
async def search_files(pattern: str, search_content: bool = False) -> dict:
    """Search for files by name pattern within allowed directory."""
    matches = []
    for file_path in BASE_DIR.rglob("*"):
        if not file_path.is_file():
            continue
        relative = str(file_path.relative_to(BASE_DIR))
        if pattern.lower() in file_path.name.lower():
            match = {"path": relative, "name": file_path.name}
            if search_content:
                try:
                    text = file_path.read_text(encoding="utf-8", errors="replace")
                    if pattern.lower() in text.lower():
                        idx = text.lower().find(pattern.lower())
                        match["snippet"] = text[max(0, idx - 50):idx + 100]
                except Exception:
                    pass
            matches.append(match)
    return {"matches": matches[:50]}


if __name__ == "__main__":
    mcp.run(transport="stdio")
