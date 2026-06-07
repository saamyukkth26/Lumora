from pathlib import Path


def extract_text_from_pdf(path: Path) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(str(path))
        pages = []
        for page_num, page in enumerate(doc, 1):
            text = page.get_text()
            if text.strip():
                pages.append(f"[Page {page_num}]\n{text}")
        doc.close()
        return "\n\n".join(pages)
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}") from e
