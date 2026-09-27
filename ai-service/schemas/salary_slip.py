"""Salary slip extraction schema."""

from __future__ import annotations

from typing import Optional, List, Any
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


class DeductionItem(BaseModel):
    """A single deduction line item."""

    name: Optional[str] = Field(default="", description="Name of the deduction (e.g., PF, TDS, ESI)")
    amount: Optional[float] = Field(default=0.0, description="Deduction amount")

    @field_validator("amount", mode="before")
    @classmethod
    def clean_amount(cls, v: Any) -> Optional[float]:
        val = _clean_float(v)
        return val if val is not None else 0.0


class EarningItem(BaseModel):
    """A single earning line item."""

    name: Optional[str] = Field(default="", description="Name of the earning (e.g., Basic, HRA, DA)")
    amount: Optional[float] = Field(default=0.0, description="Earning amount")

    @field_validator("amount", mode="before")
    @classmethod
    def clean_amount(cls, v: Any) -> Optional[float]:
        val = _clean_float(v)
        return val if val is not None else 0.0


class SalarySlipData(BaseModel):
    """Structured data extracted from a salary slip."""

    employee_name: Optional[str] = Field(default=None, description="Employee full name")
    employee_id: Optional[str] = Field(default=None, description="Employee ID / code")
    employer: Optional[str] = Field(default=None, description="Company / employer name")
    designation: Optional[str] = Field(default=None, description="Job title / designation")
    salary_month: Optional[str] = Field(default=None, description="Month and year of the salary (e.g., July 2026)")
    pay_date: Optional[str] = Field(default=None, description="Date of payment")

    # Earnings
    basic_salary: Optional[float] = Field(default=None, description="Basic salary amount")
    hra: Optional[float] = Field(default=None, description="House Rent Allowance")
    other_earnings: Optional[List[EarningItem]] = Field(default_factory=list, description="Other earning components")
    gross_salary: Optional[float] = Field(default=None, description="Total gross salary")

    # Deductions
    pf: Optional[float] = Field(default=None, description="Provident Fund deduction")
    tax_deducted: Optional[float] = Field(default=None, description="TDS / income tax deducted")
    other_deductions: Optional[List[DeductionItem]] = Field(default_factory=list, description="Other deduction items")
    total_deductions: Optional[float] = Field(default=None, description="Total deductions")

    # Net
    net_salary: Optional[float] = Field(default=None, description="Net salary (take-home pay)")

    # Bank details (if present)
    bank_account: Optional[str] = Field(default=None, description="Bank account number (partial)")
    pan_number: Optional[str] = Field(default=None, description="PAN number on the slip")

    @field_validator(
        "basic_salary",
        "hra",
        "gross_salary",
        "pf",
        "tax_deducted",
        "total_deductions",
        "net_salary",
        mode="before",
    )
    @classmethod
    def clean_numeric_fields(cls, v: Any) -> Optional[float]:
        return _clean_float(v)
