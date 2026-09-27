"""Groq Reasoning Layer for Cross-Document Verification Analysis.

Consumes structured deterministic validation results and produces an objective,
officer-facing verification summary and findings without recalculating arithmetic.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

from config import get_settings
from schemas.verification import (
    VerificationCheck,
    CheckStatus,
    SeverityLevel,
    VerificationStatus,
    RecommendedAction,
    FindingItem,
    EvidenceSide,
    GroqReasoningOutput,
    VerificationAnalysisResult,
)

logger = logging.getLogger(__name__)

GROQ_SYSTEM_PROMPT = """You are the Senior Cross-Document Verification & Analysis Specialist for the LoanLens Indian loan origination system.

Your role:
1. Interpret the deterministic mathematical and cross-document validation checks calculated by Python.
2. Synthesize an objective, professional, concise summary for the loan officer.
3. Produce structured findings with clear comparison data.
4. Provide a recommended officer action and verification score.

Critical Guidelines:
- Do NOT declare documents "fraudulent", "fake", or "forged". Use professional compliance language such as "Discrepancy detected", "Verification required", "Income variance".
- Do NOT make definitive loan approval/rejection decrees. The final credit decision strictly remains with the human loan officer.
- Do NOT invent information not present in the checks or evidence.
- Reflect the deterministic checks accurately.
- Keep all text concise and to-the-point.

Return strict JSON adhering to the required schema:
{{
  "verificationStatus": "CONSISTENT" | "REVIEW_REQUIRED" | "INCOMPLETE",
  "summary": "<concise 1-sentence officer summary>",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "verificationScore": <integer 0-100, where 100=fully consistent, 0=critical discrepancies>,
  "keyFindings": [
    "<short bullet point 1>",
    "<short bullet point 2>",
    "<short bullet point 3>"
  ],
  "findings": [
    {{
      "title": "<short title>",
      "subtitle": "<one-line description>",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "explanation": ["<bullet 1>", "<bullet 2>"],
      "documents": ["<DOC_TYPE_1>", "<DOC_TYPE_2>"],
      "sourceA": {{"label": "<source label>", "values": ["<key: value>"]}},
      "sourceB": {{"label": "<source label>", "values": ["<key: value>"]}}
    }}
  ],
  "recommendedAction": "APPROVE_RECOMMENDED" | "MANUAL_REVIEW" | "REQUEST_ADDITIONAL_DOCS"
}}

Scoring guidelines for verificationScore:
- 90-100: All checks passed, no discrepancies
- 70-89: Minor warnings, generally acceptable
- 50-69: Multiple warnings or minor flags requiring attention
- 30-49: Significant discrepancies, requires manual review
- 0-29: Critical discrepancies across multiple documents

Keep keyFindings to 3-5 short bullet points (max 15 words each).
Keep finding explanations to 2-3 bullet points each.
"""


def _calculate_verification_score(
    checks: List[VerificationCheck],
    overall_status: VerificationStatus,
    overall_severity: SeverityLevel,
) -> int:
    """Calculate a 0-100 verification score from deterministic checks."""
    if not checks:
        return 50

    total = len(checks)
    passed = sum(1 for c in checks if c.status == CheckStatus.PASSED)
    warnings = sum(1 for c in checks if c.status == CheckStatus.WARNING)
    flagged = sum(1 for c in checks if c.status == CheckStatus.FLAGGED)

    # Base score from pass ratio (scaled to 60-100 range for passed checks)
    pass_ratio = passed / total if total > 0 else 0.5
    base_score = int(40 + (pass_ratio * 60))

    # Penalties (gentler than before)
    penalty = 0
    penalty += flagged * 8       # Each flag costs 8 points
    penalty += warnings * 3      # Each warning costs 3 points

    score = max(10, min(100, base_score - penalty))

    # Caps based on overall status
    if overall_status == VerificationStatus.REVIEW_REQUIRED and score > 75:
        score = 72
    if overall_severity == SeverityLevel.HIGH and score > 65:
        score = min(score, 55)

    return score


def _generate_key_findings(checks: List[VerificationCheck]) -> List[str]:
    """Generate short bullet-point key findings from checks."""
    findings = []
    for check in checks:
        if check.status == CheckStatus.FLAGGED:
            if check.type == "IDENTITY_NAME_MATCH":
                findings.append("Name mismatch detected across documents")
            elif check.type == "DECLARED_VS_SLIP_INCOME":
                findings.append("Income declared is higher than bank credits")
            elif check.type == "SLIP_VS_BANK_SALARY":
                findings.append("No regular salary credits found in bank")
            elif check.type == "DOB_CONSISTENCY":
                findings.append("Date of birth inconsistency found")
            elif check.type == "PAN_CONSISTENCY":
                findings.append("PAN number mismatch across documents")
            elif check.type == "EMPLOYER_CONSISTENCY":
                findings.append("Employer name mismatch detected")
            elif check.type == "SLIP_VS_FORM16_INCOME":
                findings.append("Salary slip vs Form 16 income variance")
            else:
                findings.append(check.message[:60])
        elif check.status == CheckStatus.WARNING:
            if check.type == "SLIP_VS_BANK_SALARY":
                findings.append("Salary credit pattern needs verification")
            elif check.type == "EXISTING_EMI_BURDEN":
                findings.append("High existing EMI obligations detected")
            elif check.type == "DECLARED_VS_SLIP_INCOME":
                findings.append("Minor income declaration variance")

    high_count = sum(1 for c in checks if c.severity == SeverityLevel.HIGH and c.status != CheckStatus.PASSED)
    if high_count > 1:
        findings.append(f"Multiple high-risk discrepancies identified")

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for f in findings:
        if f not in seen:
            seen.add(f)
            unique.append(f)

    return unique[:5]  # Max 5 key findings


def _generate_fallback_reasoning(
    checks: List[VerificationCheck],
    overall_status: VerificationStatus,
    overall_severity: SeverityLevel,
) -> GroqReasoningOutput:
    """Generate high-quality rule-based reasoning if Groq is unavailable or key not set."""
    findings: List[FindingItem] = []

    doc_type_mapping = {
        "IDENTITY_NAME_MATCH": ["PAN", "AADHAAR", "SALARY_SLIP", "BANK_STATEMENT"],
        "DOB_CONSISTENCY": ["PAN", "AADHAAR"],
        "PAN_CONSISTENCY": ["PAN", "SALARY_SLIP", "FORM_16"],
        "AADHAAR_VERIFICATION": ["AADHAAR"],
        "EMPLOYER_CONSISTENCY": ["SALARY_SLIP", "FORM_16"],
        "DECLARED_VS_SLIP_INCOME": ["SALARY_SLIP"],
        "SLIP_VS_BANK_SALARY": ["SALARY_SLIP", "BANK_STATEMENT"],
        "SLIP_VS_FORM16_INCOME": ["SALARY_SLIP", "FORM_16"],
        "EXISTING_EMI_BURDEN": ["BANK_STATEMENT"],
    }

    title_mapping = {
        "IDENTITY_NAME_MATCH": "Name Consistency Check",
        "DOB_CONSISTENCY": "Date of Birth Verification",
        "PAN_CONSISTENCY": "PAN Verification",
        "AADHAAR_VERIFICATION": "Aadhaar Verification",
        "EMPLOYER_CONSISTENCY": "Employer Name Alignment",
        "DECLARED_VS_SLIP_INCOME": "Income Verification",
        "SLIP_VS_BANK_SALARY": "Salary Credit Pattern",
        "SLIP_VS_FORM16_INCOME": "Annual Salary vs Form 16",
        "EXISTING_EMI_BURDEN": "Existing Loan Obligations",
    }

    subtitle_mapping = {
        "IDENTITY_NAME_MATCH": "Cross-check across all documents",
        "DOB_CONSISTENCY": "PAN and Aadhaar DOB comparison",
        "PAN_CONSISTENCY": "PAN format and validity check",
        "AADHAAR_VERIFICATION": "Aadhaar format and validity",
        "EMPLOYER_CONSISTENCY": "Employment records alignment",
        "DECLARED_VS_SLIP_INCOME": "Salary slip vs bank statement",
        "SLIP_VS_BANK_SALARY": "Regular salary credits in bank",
        "SLIP_VS_FORM16_INCOME": "Annual income cross-reference",
        "EXISTING_EMI_BURDEN": "Outstanding loan obligation review",
    }

    for check in checks:
        if check.status in (CheckStatus.FLAGGED, CheckStatus.WARNING):
            title = title_mapping.get(check.type, check.type.replace("_", " ").title())
            subtitle = subtitle_mapping.get(check.type, "Cross-document verification")
            docs = doc_type_mapping.get(check.type, ["DOCUMENTS"])

            # Build explanation as bullet points
            explanation_bullets = [check.message]
            if check.evidence:
                for k, v in list(check.evidence.items())[:2]:
                    if k not in ("lowest_match_score", "match_score") and v is not None:
                        explanation_bullets.append(f"{k.replace('_', ' ').title()}: {v}")

            findings.append(FindingItem(
                title=title,
                subtitle=subtitle,
                severity=check.severity,
                explanation=explanation_bullets[:3],
                documents=docs,
                sourceA=check.sourceA,
                sourceB=check.sourceB,
            ))

    # Add passed checks as LOW severity findings
    for check in checks:
        if check.status == CheckStatus.PASSED:
            title = title_mapping.get(check.type, check.type.replace("_", " ").title())
            subtitle = subtitle_mapping.get(check.type, "Verification check")
            docs = doc_type_mapping.get(check.type, ["DOCUMENTS"])

            findings.append(FindingItem(
                title=title,
                subtitle=subtitle,
                severity=SeverityLevel.LOW,
                explanation=[check.message],
                documents=docs,
                sourceA=check.sourceA,
                sourceB=check.sourceB,
            ))

    verification_score = _calculate_verification_score(checks, overall_status, overall_severity)
    key_findings = _generate_key_findings(checks)

    if overall_status == VerificationStatus.CONSISTENT:
        summary = "All cross-document identity, employment, and income checks are consistent and verified."
        rec_action = RecommendedAction.APPROVE_RECOMMENDED
        if not key_findings:
            key_findings = ["All document checks passed", "No discrepancies detected", "Identity and income verified"]
    elif overall_status == VerificationStatus.REVIEW_REQUIRED:
        flagged_count = sum(1 for c in checks if c.status == CheckStatus.FLAGGED)
        summary = f"Application contains {flagged_count} flagged item(s) requiring manual review by the loan officer."
        rec_action = RecommendedAction.MANUAL_REVIEW
    else:
        summary = "Additional documents are required to complete cross-document verification."
        rec_action = RecommendedAction.REQUEST_ADDITIONAL_DOCS

    return GroqReasoningOutput(
        verificationStatus=overall_status,
        summary=summary,
        riskLevel=overall_severity,
        verificationScore=verification_score,
        keyFindings=key_findings,
        findings=findings,
        recommendedAction=rec_action,
    )


def run_groq_reasoning(
    applicant_declared: Dict[str, Any],
    checks: List[VerificationCheck],
    overall_status: VerificationStatus,
    overall_severity: SeverityLevel,
) -> GroqReasoningOutput:
    """
    Execute Groq LLM reasoning on deterministic verification results.
    """
    settings = get_settings()
    api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY", "")

    if not api_key:
        logger.info("[Groq] GROQ_API_KEY not configured — using deterministic reasoning synthesis.")
        return _generate_fallback_reasoning(checks, overall_status, overall_severity)

    try:
        model_name = settings.groq_model or "openai/gpt-oss-120b"
        model = ChatGroq(
            model=model_name,
            temperature=0.1,
            groq_api_key=api_key,
        )

        structured_llm = model.with_structured_output(GroqReasoningOutput)

        # Build sourceA/sourceB data from checks for Groq context
        checks_payload = []
        for c in checks:
            check_data = {
                "type": c.type,
                "status": c.status.value,
                "severity": c.severity.value,
                "message": c.message,
                "evidence": c.evidence,
            }
            if c.sourceA:
                check_data["sourceA"] = {"label": c.sourceA.label, "values": c.sourceA.values}
            if c.sourceB:
                check_data["sourceB"] = {"label": c.sourceB.label, "values": c.sourceB.values}
            checks_payload.append(check_data)

        # Prepare concise structured payload for Groq
        facts_payload = {
            "applicant_declared": applicant_declared,
            "deterministic_status": overall_status.value,
            "deterministic_severity": overall_severity.value,
            "deterministic_checks": checks_payload,
        }

        prompt = ChatPromptTemplate.from_messages([
            ("system", GROQ_SYSTEM_PROMPT),
            (
                "human",
                "Analyze the following deterministic cross-document verification results and generate the structured officer assessment.\n\nIMPORTANT: Include sourceA and sourceB comparison pairs in each finding for tabular display. Keep explanations as short bullet points (2-3 per finding). Calculate verificationScore based on the check results.\n\n{facts}",
            ),
        ])

        messages = prompt.format_messages(facts=json.dumps(facts_payload, indent=2))
        result = structured_llm.invoke(messages)

        if isinstance(result, GroqReasoningOutput):
            groq_output = result
        elif isinstance(result, dict):
            groq_output = GroqReasoningOutput(**result)
        else:
            groq_output = GroqReasoningOutput(**dict(result))

        # Ensure verificationScore is reasonable — override if Groq gave a bad score
        calculated_score = _calculate_verification_score(checks, overall_status, overall_severity)
        if abs(groq_output.verificationScore - calculated_score) > 25:
            groq_output.verificationScore = calculated_score

        # Ensure keyFindings is populated
        if not groq_output.keyFindings:
            groq_output.keyFindings = _generate_key_findings(checks)

        return groq_output

    except Exception as e:
        logger.info(f"[Groq] LLM reasoning notice: {e}. Utilizing deterministic reasoning synthesis engine.")
        return _generate_fallback_reasoning(checks, overall_status, overall_severity)
