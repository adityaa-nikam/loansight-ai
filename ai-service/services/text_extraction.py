"""Text extraction service — handles PDF text extraction and image preparation.

For native/digital PDFs: uses PyMuPDF only (NO Gemini call needed).
For images/scanned PDFs: uses Tesseract OCR locally (lazy-loaded).
"""

import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

# Page limits for fast extraction (digital PDFs rarely need every page parsed slowly)
DOC_PAGE_LIMITS = {
    "pan": 1,
    "aadhaar": 1,
    "aadhar": 1,
    "salary_slip": 3,
    "form16": 4,
    "bank_statement": 30,
}


def _fast_page_text(page: fitz.Page) -> str:
    """Fast single-pass text extraction for digital PDF pages."""
    text = page.get_text("text")
    if text.strip():
        return text

    blocks = page.get_text("blocks")
    lines = []
    for block in blocks:
        if len(block) >= 5 and block[6] == 0 and isinstance(block[4], str):
            cleaned = block[4].strip()
            if cleaned:
                lines.append(cleaned)
    return "\n".join(lines)


def extract_text_from_pdf(
    file_bytes: bytes,
    document_type: str | None = None,
) -> dict:
    """Extract text from a digital PDF using PyMuPDF (fitz).

    Uses a fast single-pass strategy tuned per document type.
    """
    text_parts = []
    page_count = 0
    pages_read = 0

    doc_type = (document_type or "").lower()
    page_limit = DOC_PAGE_LIMITS.get(doc_type)

    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            page_count = len(doc)
            limit = page_limit if page_limit is not None else page_count
            pages_to_read = min(page_count, limit)

            for page_idx in range(pages_to_read):
                page_text = _fast_page_text(doc[page_idx])
                pages_read += 1
                if page_text.strip():
                    text_parts.append(page_text)

            if pages_to_read < page_count:
                logger.info(
                    f"Fast PDF extract: read {pages_to_read}/{page_count} pages for {doc_type or 'unknown'}"
                )
    except Exception as e:
        logger.error(f"PyMuPDF text extraction failed: {e}")

    full_text = "\n\n".join(text_parts)
    has_text = len(full_text.strip()) > 10

    return {
        "text": full_text,
        "tables": [],
        "page_count": page_count,
        "pages_read": pages_read,
        "has_text": has_text,
        "ocr_engine": "pymupdf",
        "needs_vision": False,
    }


def compact_bank_statement(text: str, tables: list) -> str:
    """Compact bank statement data to reduce Gemini token usage."""
    header = text[:2000]

    if tables:
        compact_parts = [header, "\n--- TRANSACTIONS (COMPACT) ---"]
        row_count = 0
        for table in tables:
            for row in table:
                clean = [str(c).strip() if c else "" for c in row]
                if not any(clean):
                    continue
                compact_parts.append(" | ".join(clean))
                row_count += 1
                if row_count > 100:
                    compact_parts.append(f"... ({row_count}+ rows total, truncated)")
                    break
            if row_count > 100:
                break
        compact_text = "\n".join(compact_parts)
    else:
        compact_text = text

    if len(compact_text) > 6000:
        compact_text = compact_text[:6000] + "\n... (truncated)"

    return compact_text


def _preprocess_image_for_ocr(image_bytes: bytes):
    """Lazy-load heavy OCR deps only when processing images."""
    import cv2
    import numpy as np

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    height, width = gray.shape
    if height < 1000 or width < 1000:
        gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    return clahe.apply(gray)


def extract_text_from_image(file_bytes: bytes) -> dict:
    """Handle image files with Tesseract (lazy-loaded)."""
    try:
        import pytesseract

        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        processed_img = _preprocess_image_for_ocr(file_bytes)
        text = pytesseract.image_to_string(processed_img, config="--oem 3 --psm 3").strip()
        has_text = len(text) > 20
        return {
            "text": text if has_text else "[Image uploaded for record storage]",
            "tables": [],
            "page_count": 1,
            "has_text": True,
            "ocr_engine": "tesseract" if has_text else "stored_image",
            "needs_vision": False,
        }
    except Exception as e:
        logger.info(f"Image text extraction info: {e}")
        return {
            "text": "[Image uploaded for record storage]",
            "tables": [],
            "page_count": 1,
            "has_text": True,
            "ocr_engine": "stored_image",
            "needs_vision": False,
        }


def extract_text(
    file_bytes: bytes,
    content_type: str,
    document_type: str | None = None,
) -> dict:
    """Main entry point: extract text from any supported file type."""
    is_pdf = content_type == "application/pdf"
    is_image = content_type in ("image/jpeg", "image/png")

    if is_pdf:
        return extract_text_from_pdf(file_bytes, document_type=document_type)
    if is_image:
        return extract_text_from_image(file_bytes)
    raise ValueError(f"Unsupported content type: {content_type}")
