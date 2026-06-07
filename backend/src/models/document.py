from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
import uuid


class DocumentUploadResponse(BaseModel):
    doc_id: str
    title: str
    status: Literal["processing", "ready", "failed"] = "processing"
    message: str = "Document queued for ingestion"


class DocumentSummary(BaseModel):
    doc_id: str
    title: str
    source: str
    file_type: Literal["pdf", "txt", "url", "md"]
    status: Literal["processing", "ready", "failed"]
    chunk_count: int = 0
    ingested_at: datetime
    size_bytes: int = 0


class DocumentDetail(DocumentSummary):
    content_preview: str = ""


class DocumentStatusResponse(BaseModel):
    doc_id: str
    status: Literal["processing", "ready", "failed"]
    chunk_count: int = 0
    error: str | None = None
