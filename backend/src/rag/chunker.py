from __future__ import annotations
from dataclasses import dataclass, field
import re
import hashlib


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    text: str
    chunk_index: int
    metadata: dict = field(default_factory=dict)

    @property
    def text_for_embedding(self) -> str:
        # BGE-M3 max 512 tokens ≈ first ~2000 chars
        return self.text[:2000]


def _split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    separators = ["\n\n", "\n", ". ", " ", ""]
    chunks: list[str] = []

    def split_by_separator(t: str, sep_idx: int) -> list[str]:
        if sep_idx >= len(separators):
            return [t]
        sep = separators[sep_idx]
        if not sep:
            # Character-level split
            return [t[i : i + chunk_size] for i in range(0, len(t), chunk_size - chunk_overlap)]

        parts = t.split(sep) if sep else list(t)
        result, current = [], ""
        for part in parts:
            candidate = (current + sep + part).strip() if current else part
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                if current:
                    result.append(current)
                if len(part) > chunk_size:
                    result.extend(split_by_separator(part, sep_idx + 1))
                    current = ""
                else:
                    current = part
        if current:
            result.append(current)
        return result

    raw_chunks = split_by_separator(text, 0)

    # Apply overlap: each chunk starts overlap chars before previous chunk ended
    for i, chunk in enumerate(raw_chunks):
        if i == 0 or chunk_overlap == 0:
            chunks.append(chunk)
        else:
            prev = chunks[-1]
            overlap_text = prev[-chunk_overlap:] if len(prev) > chunk_overlap else prev
            chunks.append(overlap_text + " " + chunk)

    return [c for c in chunks if c.strip()]


def chunk_document(
    doc_id: str,
    text: str,
    metadata: dict,
    chunk_size: int = 3200,  # ~800 tokens × 4 chars/token
    chunk_overlap: int = 600,  # ~150 tokens
) -> list[Chunk]:
    raw_chunks = _split_text(text, chunk_size, chunk_overlap)
    chunks = []
    for i, chunk_text in enumerate(raw_chunks):
        chunk_id = hashlib.sha256(f"{doc_id}_{i}_{chunk_text[:64]}".encode()).hexdigest()[:16]
        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                doc_id=doc_id,
                text=chunk_text.strip(),
                chunk_index=i,
                metadata={**metadata, "chunk_index": i},
            )
        )
    return chunks
