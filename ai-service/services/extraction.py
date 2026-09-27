"""Structured data extraction service using Gemini."""

import json
import logging
import google.generativeai as genai

from config import get_settings
from schemas.common import DocumentType
from schemas.salary_slip import SalarySlipData
from schemas.bank_statement import BankStatementData
from schemas.form16_itr import Form16Data
from schemas.identity import PanCardData, AadhaarCardData
from utils.prompts import EXTRACTION_PROMPTS

logger = logging.getLogger(__name__)

# Map document types to their Pydantic models
EXTRACTION_MODELS = {
    DocumentType.SALARY_SLIP: SalarySlipData,
    DocumentType.BANK_STATEMENT: BankStatementData,
    DocumentType.FORM_16: Form16Data,
    DocumentType.PAN: PanCardData,
    DocumentType.AADHAAR: AadhaarCardData,
}


def extract_structured_data(document_type: DocumentType, text: str) -> dict | None:
    """Extract structured data from document text based on its classified type.

    Args:
        document_type: The classified document type
        text: Extracted text from the document

    Returns:
        Dictionary of extracted fields, or None if extraction is not supported
    """
    # Check if we have an extraction prompt for this type
    type_key = document_type.value
    if type_key not in EXTRACTION_PROMPTS:
        logger.info(f"No extraction schema for document type: {type_key}")
        return None

    if not text or len(text.strip()) < 20:
        logger.warning("Insufficient text for extraction")
        return None

    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)

    try:
        # Truncate text to avoid token limits
        truncated_text = text[:12000] if len(text) > 12000 else text
        prompt = EXTRACTION_PROMPTS[type_key].format(document_text=truncated_text)

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        # Clean up markdown code blocks
        if result_text.startswith("```"):
            result_text = result_text.strip("`").strip()
            if result_text.startswith("json"):
                result_text = result_text[4:].strip()

        raw_data = json.loads(result_text)

        # Validate with Pydantic model
        pydantic_model = EXTRACTION_MODELS.get(document_type)
        if pydantic_model:
            validated = pydantic_model(**raw_data)
            # Return as dict, excluding None values for cleaner output
            return validated.model_dump(exclude_none=True)

        return raw_data

    except json.JSONDecodeError as e:
        logger.error(f"Extraction JSON parsing failed: {e}")
        logger.debug(f"Raw response: {result_text[:500]}")
        return None
    except Exception as e:
        logger.error(f"Extraction failed for {type_key}: {e}")
        return None
