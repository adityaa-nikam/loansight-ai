"""Identity document extraction schemas."""

from pydantic import BaseModel, Field
from typing import Optional

class PanCardData(BaseModel):
    """Structured data extracted from a PAN card."""
    
    pan_number: Optional[str] = Field(default=None, description="PAN (Permanent Account Number)")
    name: Optional[str] = Field(default=None, description="Name of the card holder")
    fathers_name: Optional[str] = Field(default=None, description="Father's name")
    date_of_birth: Optional[str] = Field(default=None, description="Date of birth")

class AadhaarCardData(BaseModel):
    """Structured data extracted from an Aadhaar card."""
    
    aadhaar_number: Optional[str] = Field(default=None, description="12-digit Aadhaar number")
    name: Optional[str] = Field(default=None, description="Name of the card holder")
    date_of_birth: Optional[str] = Field(default=None, description="Date of birth or Year of birth")
    gender: Optional[str] = Field(default=None, description="Gender (Male/Female/Other)")
    address: Optional[str] = Field(default=None, description="Full address if present")
