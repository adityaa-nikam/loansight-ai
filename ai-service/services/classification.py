"""Document classification service using Gemini."""

import json
import logging
import io
import google.generativeai as genai
from PIL import Image

from config import get_settings
from schemas.common import ClassificationResult, DocumentType
from utils.prompts import CLASSIFICATION_PROMPT, CLASSIFICATION_VISION_PROMPT

logger = logging.getLogger(__name__)


def classify_document(text: str, file_bytes: bytes | None = None, content_type: str | None = None) -> ClassificationResult:
    """Classify a document using Gemini LLM.

    Uses text-based classification first. If text is insufficient,
    falls back to vision-based classification.

    Args:
        text: Extracted text from the document
        file_bytes: Original file bytes (for vision fallback)
        content_type: MIME type of the file

    Returns:
        ClassificationResult with document_type, confidence, and reasoning
    """
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)

    # If we have meaningful text, use text-based classification
    if text and len(text.strip()) > 50:
        return _classify_from_text(model, text)

    # Fall back to vision-based classification
    if file_bytes and content_type:
        return _classify_from_vision(model, file_bytes, content_type)

    # Cannot classify
    return ClassificationResult(
        document_type=DocumentType.UNKNOWN,
        confidence=0.0,
        reasoning="No text or image content available for classification",
    )


def _classify_from_text(model, text: str) -> ClassificationResult:
    """Classify document using extracted text."""
    try:
        # Truncate very long texts to avoid token limits
        truncated_text = text[:8000] if len(text) > 8000 else text
        prompt = CLASSIFICATION_PROMPT.format(document_text=truncated_text)

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up potential markdown code blocks
        if result_text.startswith("```"):
            result_text = result_text.strip("`").strip()
            if result_text.startswith("json"):
                result_text = result_text[4:].strip()

        result = json.loads(result_text)

        return ClassificationResult(
            document_type=DocumentType(result["document_type"]),
            confidence=min(max(float(result["confidence"]), 0.0), 1.0),
            reasoning=result.get("reasoning", ""),
        )
    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.error(f"Classification parsing failed: {e}, raw: {result_text[:200]}")
        return ClassificationResult(
            document_type=DocumentType.UNKNOWN,
            confidence=0.0,
            reasoning=f"Failed to parse classification result: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        return ClassificationResult(
            document_type=DocumentType.UNKNOWN,
            confidence=0.0,
            reasoning=f"Classification error: {str(e)}",
        )


def _classify_from_vision(model, file_bytes: bytes, content_type: str) -> ClassificationResult:
    """Classify document using Gemini Vision (for images or scanned PDFs)."""
    try:
        import fitz

        if content_type == "application/pdf":
            # Convert first page to image
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            page = doc[0]
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))
            doc.close()
        else:
            image = Image.open(io.BytesIO(file_bytes))

        response = model.generate_content([CLASSIFICATION_VISION_PROMPT, image])
        result_text = response.text.strip()

        # Clean up markdown
        if result_text.startswith("```"):
            result_text = result_text.strip("`").strip()
            if result_text.startswith("json"):
                result_text = result_text[4:].strip()

        result = json.loads(result_text)

        return ClassificationResult(
            document_type=DocumentType(result["document_type"]),
            confidence=min(max(float(result["confidence"]), 0.0), 1.0),
            reasoning=result.get("reasoning", ""),
        )
    except Exception as e:
        logger.error(f"Vision classification failed: {e}")
        return ClassificationResult(
            document_type=DocumentType.UNKNOWN,
            confidence=0.0,
            reasoning=f"Vision classification error: {str(e)}",
        )
