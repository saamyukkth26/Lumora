from __future__ import annotations
import re
from src.knowledge_graph import client as kg
from src.knowledge_graph.schema import new_id
from src.utils.logging import get_logger

logger = get_logger(__name__)

# Simple heuristic entity extraction (no LLM required — uses regex + capitalization)
_STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "and", "or", "but", "if",
    "in", "on", "at", "to", "for", "of", "with", "by", "from", "about",
    "into", "through", "during", "before", "after", "above", "below",
    "this", "that", "these", "those", "it", "its", "they", "them", "their",
    "he", "she", "we", "you", "i", "me", "my", "your", "our", "his", "her",
}


def _extract_entities(text: str) -> list[tuple[str, str]]:
    """Returns (label, node_type) pairs extracted from text."""
    entities = []

    # Capitalized multi-word phrases (proper nouns)
    proper_nouns = re.findall(r'\b([A-Z][a-z]+(?: [A-Z][a-z]+)+)\b', text)
    for noun in proper_nouns:
        if noun.lower() not in _STOP_WORDS and len(noun) > 3:
            entities.append((noun, "concept"))

    # Single capitalized words (not at sentence start)
    for match in re.finditer(r'(?<=[.?!]\s)([A-Z][a-z]{3,})\b|(?<!\. )([A-Z][a-z]{4,})\b', text):
        word = match.group(1) or match.group(2)
        if word and word.lower() not in _STOP_WORDS:
            entities.append((word, "concept"))

    # Deduplicate preserving order
    seen, unique = set(), []
    for e in entities:
        if e[0] not in seen:
            seen.add(e[0])
            unique.append(e)

    return unique[:30]  # limit per chunk


async def extract_entities_from_chunks(chunks: list, doc_id: str, doc_title: str) -> None:
    # Add document node
    await kg.add_node(doc_id, doc_title or doc_id, "document", {"source_type": "ingested"})

    entity_ids: dict[str, str] = {}

    for chunk in chunks:
        entities = _extract_entities(chunk.text)
        for label, node_type in entities:
            # Normalize label
            norm = label.lower().strip()
            if norm not in entity_ids:
                nid = new_id()
                entity_ids[norm] = nid
                await kg.add_node(nid, label, node_type, {})

            # Link entity to document
            await kg.add_edge(doc_id, entity_ids[norm], "mentions", weight=1.0)

    # Link co-occurring entities within each chunk
    for chunk in chunks:
        chunk_entities = [
            entity_ids[e[0].lower().strip()]
            for e in _extract_entities(chunk.text)
            if e[0].lower().strip() in entity_ids
        ]
        for i, eid_a in enumerate(chunk_entities):
            for eid_b in chunk_entities[i + 1:]:
                if eid_a != eid_b:
                    await kg.add_edge(eid_a, eid_b, "related_to", weight=0.5)

    logger.info(f"KG: extracted {len(entity_ids)} entities from doc {doc_id}")
