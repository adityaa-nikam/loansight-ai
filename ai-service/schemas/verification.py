"""Pydantic schemas for Cross-Document Verification and Groq Reasoning Analysis."""

from __future__ import annotations

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from enum import Enum


class CheckStatus(str, Enum):
    PASSED = "PASSED"
    WARNING = "WARNING"
    FLAGGED = "FLAGGED"


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class VerificationStatus(str, Enum):
    CONSISTENT = "CONSISTENT"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    INCOMPLETE = "INCOMPLETE"


class RecommendedAction(str, Enum):
    APPROVE_RECOMMENDED = "APPROVE_RECOMMENDED"
    MANUAL_REVIEW = "MANUAL_REVIEW"
    REQUEST_ADDITIONAL_DOCS = "REQUEST_ADDITIONAL_DOCS"


class EvidenceSide(BaseModel):
    """One side of a structured comparison (e.g. 'PAN: Manish Jaiswal')."""
    label: str = Field(..., description="Source document label, e.g. 'PAN Card', 'Bank Statement'")
    values: List[str] = Field(default_factory=list, description="Key-value pairs to display, e.g. ['PAN: Manish Jaiswal', 'Aadhaar: Manish Jaiswal']")


class VerificationCheck(BaseModel):
    """Deterministic validation check result."""
    type: str = Field(..., description="Check identifier, e.g. IDENTITY_NAME_MATCH")
    status: CheckStatus = Field(..., description="PASSED, WARNING, or FLAGGED")
    severity: SeverityLevel = Field(..., description="LOW, MEDIUM, or HIGH")
    message: str = Field(..., description="Explanation of the check outcome")
    evidence: Dict[str, Any] = Field(default_factory=dict, description="Extracted values and comparative data")
    sourceA: Optional[EvidenceSide] = Field(default=None, description="Left comparison column")
    sourceB: Optional[EvidenceSide] = Field(default=None, description="Right comparison column")


class FindingItem(BaseModel):
    """A high-level reasoning finding produced by Groq."""
    title: str = Field(..., description="Short finding title (e.g. 'Name Consistency Check')")
    subtitle: str = Field(default="", description="One-line description (e.g. 'Cross-check across all documents')")
    severity: SeverityLevel = Field(..., description="LOW, MEDIUM, or HIGH")
    explanation: List[str] = Field(default_factory=list, description="Short bullet-point explanations (2-3 items)")
    documents: List[str] = Field(default_factory=list, description="List of involved document types")
    sourceA: Optional[EvidenceSide] = Field(default=None, description="Left comparison column values")
    sourceB: Optional[EvidenceSide] = Field(default=None, description="Right comparison column values")


class GroqReasoningOutput(BaseModel):
    """Structured response from Groq reasoning layer."""
    verificationStatus: VerificationStatus = Field(..., description="CONSISTENT, REVIEW_REQUIRED, or INCOMPLETE")
    summary: str = Field(..., description="Concise 1-sentence officer-facing summary")
    riskLevel: SeverityLevel = Field(..., description="LOW, MEDIUM, or HIGH")
    verificationScore: int = Field(default=50, description="Overall verification score 0-100", ge=0, le=100)
    keyFindings: List[str] = Field(default_factory=list, description="3-5 short bullet-point key findings for the summary card")
    findings: List[FindingItem] = Field(default_factory=list, description="Detailed structured findings")
    recommendedAction: RecommendedAction = Field(..., description="Recommended officer action")


class VerificationAnalysisResult(BaseModel):
    """Complete application-level verification and reasoning result stored in MongoDB."""
    verificationStatus: VerificationStatus
    overallSeverity: SeverityLevel
    summary: str
    riskLevel: SeverityLevel
    verificationScore: int = Field(default=50, ge=0, le=100)
    keyFindings: List[str] = Field(default_factory=list)
    findings: List[FindingItem] = Field(default_factory=list)
    recommendedAction: RecommendedAction
    checks: List[VerificationCheck] = Field(default_factory=list)
    validatedAt: Optional[str] = None


class VerifyApplicationDocument(BaseModel):
    document_id: Optional[str] = None
    document_type: str
    original_name: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    extraction_method: Optional[str] = None


class VerifyApplicationRequest(BaseModel):
    application_id: str
    applicant_declared: Optional[Dict[str, Any]] = Field(default_factory=dict)
    documents: List[VerifyApplicationDocument] = Field(default_factory=list)
