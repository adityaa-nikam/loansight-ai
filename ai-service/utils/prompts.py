"""LLM prompt templates for document classification and extraction."""

# ---------------------------------------------------------------------------
# UNIFIED prompts — Classify + Extract in ONE Gemini call
# ---------------------------------------------------------------------------

UNIFIED_TEXT_PROMPT = """You are a document analysis expert for an Indian loan processing system.

The user uploaded a document that they labeled as: "{expected_type}"

Perform TWO tasks in a SINGLE response:

**Task 1 — Classification**: Determine the actual document type. Valid types:
- PAN: PAN card (Permanent Account Number)
- AADHAAR: Aadhaar card (UID)
- SALARY_SLIP: Monthly salary slip / payslip
- BANK_STATEMENT: Bank account statement
- FORM_16: Form 16 (TDS certificate from employer)
- OTHER: A recognizable document that doesn't fit the above
- UNKNOWN: Cannot determine

**Task 2 — Data Extraction**: Based on the ACTUAL document type you identified, extract ALL relevant structured data.

Extraction schemas by type:
- PAN: {{"pan_number","name","fathers_name","date_of_birth"}}
- AADHAAR: {{"aadhaar_number","name","date_of_birth","gender","address"}}
- SALARY_SLIP: {{"employee_name","employee_id","employer","designation","salary_month","pay_date","basic_salary","hra","gross_salary","pf","tax_deducted","total_deductions","net_salary","bank_account","pan_number"}}
- BANK_STATEMENT: {{"account_holder","bank_name","branch","account_number","ifsc_code","account_type","statement_period_from","statement_period_to","opening_balance","closing_balance","total_credits","total_debits","average_balance","salary_credits":[{{"date","description","amount"}}],"emi_debits":[{{"date","description","amount"}}],"transaction_count"}}
- FORM_16: {{"employee_name","pan_employee","employer_name","tan_employer","assessment_year","financial_year","gross_salary","total_exemptions","net_taxable_salary","total_income","section_80c","section_80d","total_deductions","total_taxable_income","tax_payable","tds_deducted"}}
- OTHER/UNKNOWN: null

For monetary amounts, use plain numbers without currency symbols or commas.
Set missing fields to null.

Respond ONLY with valid JSON:
{{
  "document_type": "<one of the types above>",
  "document_type_match": <true if matches expected_type, false otherwise>,
  "confidence": <float 0.0 to 1.0>,
  "reasoning": "<brief one-line explanation>",
  "extracted_data": {{ ... }} or null
}}

Document text:
---
{document_text}
---"""


UNIFIED_VISION_PROMPT = """You are a document analysis expert for an Indian loan processing system.

The user uploaded a document image that they labeled as: "{expected_type}"

Perform THREE tasks in a SINGLE response:

**Task 1 — OCR**: Read ALL text visible in this document image.

**Task 2 — Classification**: Determine the actual document type. Valid types:
PAN, AADHAAR, SALARY_SLIP, BANK_STATEMENT, FORM_16, OTHER, UNKNOWN

**Task 3 — Data Extraction**: Based on the ACTUAL type, extract structured data.

Extraction schemas:
- PAN: {{"pan_number","name","fathers_name","date_of_birth"}}
- AADHAAR: {{"aadhaar_number","name","date_of_birth","gender","address"}}
- SALARY_SLIP: {{"employee_name","employee_id","employer","designation","salary_month","gross_salary","net_salary"}}
- BANK_STATEMENT: {{"account_holder","bank_name","account_number"}}
- FORM_16: {{"employee_name","employer_name","gross_salary","tds_deducted"}}
- OTHER/UNKNOWN: null

For monetary amounts, use plain numbers. Set missing fields to null.

Respond ONLY with valid JSON:
{{
  "document_type": "<type>",
  "document_type_match": <true/false>,
  "confidence": <float 0.0 to 1.0>,
  "reasoning": "<brief explanation>",
  "extracted_data": {{ ... }} or null
}}"""


# ---------------------------------------------------------------------------
# Legacy prompts — kept for backward compatibility / individual operations
# ---------------------------------------------------------------------------

CLASSIFICATION_PROMPT = """You are a document classification expert for an Indian loan processing system.

Analyze the following document text and classify it into EXACTLY ONE of these categories:
- PAN: PAN card (Permanent Account Number)
- AADHAAR: Aadhaar card (UID)
- SALARY_SLIP: Monthly salary slip / payslip
- BANK_STATEMENT: Bank account statement
- FORM_16: Form 16 (TDS certificate from employer)
- OTHER: A recognizable document that doesn't fit the above categories
- UNKNOWN: Cannot determine the document type

Respond ONLY with valid JSON in this exact format:
{{
  "document_type": "<one of the types above>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<brief one-line explanation>"
}}

Document text:
---
{document_text}
---"""

CLASSIFICATION_VISION_PROMPT = """You are a document classification expert for an Indian loan processing system.

Look at this document image and classify it into EXACTLY ONE of these categories:
- PAN: PAN card (Permanent Account Number)
- AADHAAR: Aadhaar card (UID)
- SALARY_SLIP: Monthly salary slip / payslip
- BANK_STATEMENT: Bank account statement
- FORM_16: Form 16 (TDS certificate from employer)
- OTHER: A recognizable document that doesn't fit the above categories
- UNKNOWN: Cannot determine the document type

Respond ONLY with valid JSON in this exact format:
{{
  "document_type": "<one of the types above>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<brief one-line explanation>"
}}"""

SALARY_SLIP_EXTRACTION_PROMPT = """You are a precise data extraction expert. Extract structured information from this salary slip document.

Extract ALL available fields. If a field is not present in the document, set it to null.
For monetary amounts, use plain numbers without currency symbols or commas.

Respond ONLY with valid JSON matching this schema:
{{
  "employee_name": "string or null",
  "employee_id": "string or null",
  "employer": "string or null",
  "designation": "string or null",
  "salary_month": "string or null (e.g., 'July 2026')",
  "pay_date": "string or null",
  "basic_salary": "number or null",
  "hra": "number or null",
  "other_earnings": [{{"name": "string", "amount": "number"}}] or null,
  "gross_salary": "number or null",
  "pf": "number or null",
  "tax_deducted": "number or null",
  "other_deductions": [{{"name": "string", "amount": "number"}}] or null,
  "total_deductions": "number or null",
  "net_salary": "number or null",
  "bank_account": "string or null (partial is fine)",
  "pan_number": "string or null"
}}

Document text:
---
{document_text}
---"""

BANK_STATEMENT_EXTRACTION_PROMPT = """You are a precise data extraction expert. Extract structured information from this bank statement document.

Extract ALL available fields. If a field is not present, set it to null.
For monetary amounts, use plain numbers without currency symbols or commas.
For transactions, extract up to 10 sample transactions.
Identify salary/income credits (regular monthly credits from employers) and EMI debits (recurring loan payments).

Respond ONLY with valid JSON matching this schema:
{{
  "account_holder": "string or null",
  "bank_name": "string or null",
  "branch": "string or null",
  "account_number": "string or null",
  "ifsc_code": "string or null",
  "account_type": "string or null (Savings/Current)",
  "statement_period_from": "string or null",
  "statement_period_to": "string or null",
  "opening_balance": "number or null",
  "closing_balance": "number or null",
  "total_credits": "number or null",
  "total_debits": "number or null",
  "average_balance": "number or null",
  "salary_credits": [{{"date": "string", "description": "string", "amount": "number", "transaction_type": "CREDIT", "balance": "number or null"}}] or null,
  "emi_debits": [{{"date": "string", "description": "string", "amount": "number", "transaction_type": "DEBIT", "balance": "number or null"}}] or null,
  "transaction_count": "number or null",
  "sample_transactions": [{{"date": "string", "description": "string", "amount": "number", "transaction_type": "CREDIT or DEBIT", "balance": "number or null"}}] or null
}}

Document text:
---
{document_text}
---"""

FORM16_EXTRACTION_PROMPT = """You are a precise data extraction expert. Extract structured information from this Form 16 (TDS Certificate) document.

Extract ALL available fields. If a field is not present, set it to null.
For monetary amounts, use plain numbers without currency symbols or commas.

Respond ONLY with valid JSON matching this schema:
{{
  "employee_name": "string or null",
  "pan_employee": "string or null",
  "employer_name": "string or null",
  "tan_employer": "string or null",
  "assessment_year": "string or null",
  "financial_year": "string or null",
  "gross_salary": "number or null",
  "total_exemptions": "number or null",
  "net_taxable_salary": "number or null",
  "total_income": "number or null",
  "section_80c": "number or null",
  "section_80d": "number or null",
  "total_deductions": "number or null",
  "total_taxable_income": "number or null",
  "tax_payable": "number or null",
  "tds_deducted": "number or null"
}}

Document text:
---
{document_text}
---"""



PAN_EXTRACTION_PROMPT = """You are a precise data extraction expert. Extract structured information from this PAN (Permanent Account Number) card document.

Extract ALL available fields. If a field is not present, set it to null.

Respond ONLY with valid JSON matching this schema:
{{
  "pan_number": "string or null",
  "name": "string or null",
  "fathers_name": "string or null",
  "date_of_birth": "string or null"
}}

Document text:
---
{document_text}
---"""

AADHAAR_EXTRACTION_PROMPT = """You are a precise data extraction expert. Extract structured information from this Aadhaar card document.

Extract ALL available fields. If a field is not present, set it to null.
Ensure the Aadhaar number is just the 12 digits without spaces if possible.

Respond ONLY with valid JSON matching this schema:
{{
  "aadhaar_number": "string or null",
  "name": "string or null",
  "date_of_birth": "string or null",
  "gender": "string or null",
  "address": "string or null"
}}

Document text:
---
{document_text}
---"""

OCR_VISION_PROMPT = """Extract ALL text content from this document image. 
Preserve the layout structure as much as possible.
Include all text, numbers, tables, headers, and footers.
If there are tables, format them with clear column separation.
Return only the extracted text, no commentary."""

# Map document types to their extraction prompts
EXTRACTION_PROMPTS = {
    "SALARY_SLIP": SALARY_SLIP_EXTRACTION_PROMPT,
    "BANK_STATEMENT": BANK_STATEMENT_EXTRACTION_PROMPT,
    "FORM_16": FORM16_EXTRACTION_PROMPT,
    "PAN": PAN_EXTRACTION_PROMPT,
    "AADHAAR": AADHAAR_EXTRACTION_PROMPT,
}

# Map frontend document types to AI expected types
FRONTEND_TO_AI_TYPE = {
    "pan": "PAN",
    "aadhaar": "AADHAAR",
    "salary_slip": "SALARY_SLIP",
    "bank_statement": "BANK_STATEMENT",
    "form16": "FORM_16",
    "property_document": "OTHER",
    "other": "OTHER",
}
