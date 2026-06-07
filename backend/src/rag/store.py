from __future__ import annotations
import lancedb
import pyarrow as pa
from pathlib import Path
from src.utils.logging import get_logger
from src.rag.chunker import Chunk

logger = get_logger(__name__)


def _get_embedding_dim() -> int:
    try:
        from src.rag.embedder import GeminiEmbedder
        return GeminiEmbedder.get_instance().embedding_dim
    except RuntimeError:
        pass
    try:
        from src.rag.embedder import AzureEmbedder
        return AzureEmbedder.get_instance().embedding_dim
    except RuntimeError:
        pass
    return 1536


def _make_schema(dim: int) -> pa.Schema:
    return pa.schema([
        pa.field("chunk_id", pa.string()),
        pa.field("doc_id", pa.string()),
        pa.field("text", pa.string()),
        pa.field("source", pa.string()),
        pa.field("title", pa.string()),
        pa.field("file_type", pa.string()),
        pa.field("chunk_index", pa.int32()),
        pa.field("ingested_at", pa.timestamp("ms")),
        pa.field("vector", pa.list_(pa.float32(), dim)),
    ])


TABLE_NAME = "chunks"
_db: lancedb.DBConnection | None = None
_table = None
_row_count = 0


def get_db() -> lancedb.DBConnection:
    global _db
    if _db is None:
        raise RuntimeError("LanceDB not initialized")
    return _db


def get_table():
    global _table
    if _table is None:
        raise RuntimeError("LanceDB table not initialized")
    return _table


async def init_store(db_path: str) -> None:
    global _db, _table, _row_count
    import os, shutil
    Path(db_path).mkdir(parents=True, exist_ok=True)

    # Allow wiping stale data via env var (set once, then remove)
    if os.environ.get("RESET_LANCEDB", "").lower() in ("1", "true", "yes"):
        shutil.rmtree(db_path, ignore_errors=True)
        Path(db_path).mkdir(parents=True, exist_ok=True)
        logger.warning("RESET_LANCEDB=true — wiped LanceDB data directory")

    _db = lancedb.connect(db_path)

    dim = _get_embedding_dim()
    schema = _make_schema(dim)

    table_names = _db.table_names()
    if TABLE_NAME in table_names:
        existing = _db.open_table(TABLE_NAME)
        # Check vector dimension — drop and recreate if mismatch
        try:
            existing_schema = existing.schema
            vector_field = next(
                (existing_schema.field(name) for name in existing_schema.names if name == "vector"),
                None,
            )
            # list_size may be an attribute or accessible via pa type inspection
            existing_dim = None
            if vector_field is not None:
                t = vector_field.type
                existing_dim = getattr(t, "list_size", None) or getattr(t, "value_type", None) and t.list_size
        except Exception:
            existing_dim = None

        if existing_dim != dim:
            logger.warning(f"Vector dim mismatch (existing={existing_dim}, required={dim}). Dropping table.")
            _db.drop_table(TABLE_NAME)
            _table = _db.create_table(TABLE_NAME, schema=schema)
            _row_count = 0
            logger.info(f"Recreated LanceDB table '{TABLE_NAME}' with dim={dim}")
        else:
            _table = existing
            _row_count = _table.count_rows()
            logger.info(f"Opened existing LanceDB table '{TABLE_NAME}' with {_row_count} rows (dim={dim})")
    else:
        _table = _db.create_table(TABLE_NAME, schema=schema)
        _row_count = 0
        logger.info(f"Created new LanceDB table '{TABLE_NAME}' with dim={dim}")


async def upsert_chunks(chunks: list[Chunk], vectors: list[list[float]]) -> None:
    global _row_count
    import pandas as pd
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    records = []
    for chunk, vec in zip(chunks, vectors):
        records.append({
            "chunk_id": chunk.chunk_id,
            "doc_id": chunk.doc_id,
            "text": chunk.text,
            "source": chunk.metadata.get("source", ""),
            "title": chunk.metadata.get("title", ""),
            "file_type": chunk.metadata.get("file_type", "txt"),
            "chunk_index": chunk.chunk_index,
            "ingested_at": now,
            "vector": vec,
        })

    table = get_table()
    table.add(records)
    _row_count += len(records)

    # Create indexes after first batch
    if _row_count == len(records):
        try:
            table.create_index(metric="cosine", num_partitions=8, num_sub_vectors=16)
            table.create_fts_index(["text"])
            logger.info("Created ANN + FTS indexes on chunks table")
        except Exception as e:
            logger.warning(f"Index creation skipped: {e}")


async def delete_chunks_by_doc(doc_id: str) -> int:
    table = get_table()
    before = table.count_rows()
    table.delete(f"doc_id = '{doc_id}'")
    after = table.count_rows()
    return before - after


async def get_chunk_count_by_doc(doc_id: str) -> int:
    table = get_table()
    return table.count_rows(f"doc_id = '{doc_id}'")


async def vector_search(query_vec: list[float], top_k: int = 20) -> list[dict]:
    table = get_table()
    results = (
        table.search(query_vec, query_type="vector")
        .limit(top_k)
        .to_list()
    )
    return results


async def fts_search(query: str, top_k: int = 20) -> list[dict]:
    table = get_table()
    try:
        results = (
            table.search(query, query_type="fts")
            .limit(top_k)
            .to_list()
        )
        return results
    except Exception:
        return []
