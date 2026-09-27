"""Common schemas for AI document processing."""

from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Any


class DocumentType(str, Enum):
    PAN = "PAN"
    AADHAAR = "AADHAAR"
    SALARY_SLIP = "SALARY_SLIP"
    PAYMENT_SLIP = "PAYMENT_SLIP"
    BANK_STATEMENT = "BANK_STATEMENT"
    FORM_16 = "FORM_16"
    OTHER = "OTHER"
    UNKNOWN = "UNKNOWN"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRY_PENDING = "retry_pending"


class ClassificationResult(BaseModel):
    """Result of document classification."""

    document_type: DocumentType = Field(description="Predicted document type")
    confidence: float = Field(ge=0.0, le=1.0, description="Classification confidence score")
    reasoning: str = Field(default="", description="Brief reasoning for the classification")


class ProcessingResult(BaseModel):
    """Complete result of document processing (classification + extraction)."""

    document_type: DocumentType
    confidence: float = Field(ge=0.0, le=1.0)
    processing_status: ProcessingStatus = ProcessingStatus.COMPLETED
    extracted_data: Optional[dict[str, Any]] = None
    processing_error: Optional[str] = None
    raw_text_preview: Optional[str] = Field(
        default=None, description="First 500 chars of extracted text for debugging"
    )
    extraction_method: Optional[str] = Field(
        default=None, description="Extraction method used: 'native' or 'ocr'"
    )
    # Optimization monitoring fields
    file_hash: Optional[str] = Field(default=None, description="SHA-256 hash of uploaded file")
    gemini_calls_made: int = Field(default=0, description="Number of Gemini API calls made")
    retry_count: int = Field(default=0, description="Number of retries due to rate limits")
    document_type_match: Optional[bool] = Field(
        default=None, description="Whether AI-predicted type matches expected type"
    )


class ProcessDocumentRequest(BaseModel):
    """Request to process a document — used when the file is sent as a path."""

    file_path: Optional[str] = None
    document_id: Optional[str] = None
