"""Form 16 extraction schemas."""

from __future__ import annotations

from typing import Optional, Any
from pydantic import BaseModel, Field, field_validator


def _clean_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return float(v)
    if isinstance(v, str):
        cleaned = "".join(ch for ch in v if ch.isdigit() or ch in ".-")
        if cleaned in ("", "-", "."):
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


class Form16Data(BaseModel):
    """Structured data extracted from Form 16."""

    employee_name: Optional[str] = Field(default=None, description="Employee name")
    pan_employee: Optional[str] = Field(default=None, description="Employee PAN number")
    employer_name: Optional[str] = Field(default=None, description="Employer / deductor name")
    tan_employer: Optional[str] = Field(default=None, description="Employer TAN number")
    assessment_year: Optional[str] = Field(default=None, description="Assessment year (e.g., 2026-27)")
    financial_year: Optional[str] = Field(default=None, description="Financial year (e.g., 2025-26)")

    # Income details
    gross_salary: Optional[float] = Field(default=None, description="Gross total salary")
    total_exemptions: Optional[float] = Field(default=None, description="Total exemptions under Section 10")
    net_taxable_salary: Optional[float] = Field(default=None, description="Net taxable salary")
    total_income: Optional[float] = Field(default=None, description="Gross total income")

    # Deductions
    section_80c: Optional[float] = Field(default=None, description="Deductions under Section 80C")
    section_80d: Optional[float] = Field(default=None, description="Deductions under Section 80D (health insurance)")
    total_deductions: Optional[float] = Field(default=None, description="Total deductions under Chapter VI-A")

    # Tax
    total_taxable_income: Optional[float] = Field(default=None, description="Total taxable income after deductions")
    tax_payable: Optional[float] = Field(default=None, description="Total tax payable")
    tds_deducted: Optional[float] = Field(default=None, description="TDS already deducted")

    @field_validator(
        "gross_salary",
        "total_exemptions",
        "net_taxable_salary",
        "total_income",
        "section_80c",
        "section_80d",
        "total_deductions",
        "total_taxable_income",
        "tax_payable",
        "tds_deducted",
        mode="before",
    )
    @classmethod
    def clean_numeric_fields(cls, v: Any) -> Optional[float]:
        return _clean_float(v)
