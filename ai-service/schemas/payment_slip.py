"""Payment slip extraction schema."""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class PaymentComponent(BaseModel):
    component: str = Field(..., description="e.g. Salary, Deductions, Net Payment, Basic Pay, HRA")
    amount: float = Field(..., description="Amount for this component")
    status: Optional[str] = Field(None, description="Status/note, e.g. 'Paid'")

    @field_validator("amount", mode="before")
    @classmethod
    def clean_amount(cls, v):
        if isinstance(v, str):
            v = "".join(ch for ch in v if ch.isdigit() or ch in ".-")
            if v in ("", "-", "."):
                return 0.0
        return float(v) if v is not None else 0.0


class PaymentSlip(BaseModel):
    employee_name: Optional[str] = Field(None, description="Employee full name")
    employer: Optional[str] = Field(None, description="Employer / organization name")
    payment_month: Optional[str] = Field(None, description="Payment month, e.g. July 2026")
    payment_date: Optional[str] = Field(None, description="Date of payment")
    payment_amount: Optional[float] = Field(default=0.0, description="Total or base payment amount")
    employee_id: Optional[str] = Field(None, description="Employee ID or reference code")
    bank: Optional[str] = Field(None, description="Bank name")
    branch: Optional[str] = Field(None, description="Bank branch")
    account_reference: Optional[str] = Field(None, description="Account number or reference")
    ifsc: Optional[str] = Field(None, description="IFSC code")
    components: List[PaymentComponent] = Field(default_factory=list, description="List of payment breakdown rows")
    net_payment: Optional[float] = Field(default=0.0, description="Net payment / take-home amount")

    @field_validator("payment_amount", "net_payment", mode="before")
    @classmethod
    def clean_currency(cls, v):
        """Strip currency symbols/commas/OCR noise so '₹65,000.00' -> 65000.00."""
        if isinstance(v, str):
            v = "".join(ch for ch in v if ch.isdigit() or ch in ".-")
            if v in ("", "-", "."):
                return 0.0
        return float(v) if v is not None else 0.0
