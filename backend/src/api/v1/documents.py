from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil
import uuid
from src.rag.pipeline import ingest_document, get_all_documents, get_document, delete_document
from src.rag import store as lancestore
from src.models.document import DocumentUploadResponse, DocumentSummary, DocumentDetail, DocumentStatusResponse
from src.config import get_settings
from datetime import datetime, timezone

router = APIRouter(prefix="/documents", tags=["documents"])
UPLOAD_DIR = Path("./data/uploads")


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile | None = File(default=None),
    url: str = Form(default=""),
):
    settings = get_settings()
    if file:
        if file.size and file.size > settings.max_upload_size_mb * 1024 * 1024:
            raise HTTPException(400, f"File too large. Max {settings.max_upload_size_mb}MB")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        suffix = Path(file.filename or "upload").suffix or ".txt"
        save_path = UPLOAD_DIR / f"{uuid.uuid4()}{suffix}"
        with save_path.open("wb") as f:
            shutil.copyfileobj(file.file, f)
        source = str(save_path)
        title = Path(file.filename or "upload").stem
    elif url:
        source = url
        title = url[:60]
    else:
        raise HTTPException(400, "Provide either a file or a URL")

    doc_id = await ingest_document(source)
    return DocumentUploadResponse(doc_id=doc_id, title=title, status="processing")


@router.get("", response_model=list[DocumentSummary])
async def list_documents(skip: int = 0, limit: int = 50):
    docs = get_all_documents()
    return [
        DocumentSummary(
            doc_id=d["doc_id"],
            title=d["title"],
            source=d["source"],
            file_type=d["file_type"],
            status=d["status"],
            chunk_count=d.get("chunk_count", 0),
            ingested_at=d["ingested_at"],
            size_bytes=d.get("size_bytes", 0),
        )
        for d in docs[skip : skip + limit]
    ]


@router.get("/{doc_id}", response_model=DocumentDetail)
async def get_doc(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    chunk_count = await lancestore.get_chunk_count_by_doc(doc_id)
    return DocumentDetail(
        doc_id=doc["doc_id"],
        title=doc["title"],
        source=doc["source"],
        file_type=doc["file_type"],
        status=doc["status"],
        chunk_count=chunk_count,
        ingested_at=doc["ingested_at"],
        size_bytes=doc.get("size_bytes", 0),
    )


@router.get("/{doc_id}/status", response_model=DocumentStatusResponse)
async def doc_status(doc_id: str):
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    chunk_count = await lancestore.get_chunk_count_by_doc(doc_id) if doc["status"] == "ready" else 0
    return DocumentStatusResponse(
        doc_id=doc_id,
        status=doc["status"],
        chunk_count=chunk_count,
        error=doc.get("error"),
    )


@router.delete("/{doc_id}")
async def delete_doc(doc_id: str):
    deleted = await delete_document(doc_id)
    if not deleted:
        raise HTTPException(404, "Document not found")
    return {"deleted": True, "doc_id": doc_id}
