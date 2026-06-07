import re


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\x20-\x7E\n]", "", text)
    return text.strip()


def truncate_text(text: str, max_chars: int = 5000) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "..."


def count_tokens_approx(text: str) -> int:
    """Rough token count: ~4 chars per token."""
    return len(text) // 4
