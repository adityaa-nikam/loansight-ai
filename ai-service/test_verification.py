"""Test script for Cross-Document Verification & Groq Reasoning Pipeline.

Tests:
1. A consistent application where all documents, identity, employment, and income agree.
2. An inconsistent application where salary, name, and employer information conflict.
"""

import os
import sys
import json
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from schemas.verification import (
    VerifyApplicationDocument,
    VerifyApplicationRequest,
    VerificationStatus,
    SeverityLevel,
)
from services.deterministic_validator import run_deterministic_validation
from services.groq_reasoning import run_groq_reasoning

load_dotenv()


def test_consistent_application():
    print("\n" + "=" * 60)
    print("TEST 1: CONSISTENT APPLICATION")
    print("=" * 60)

    applicant_declared = {
        "applicant_name": "Rajesh Kumar Sharma",
        "declared_monthly_income": 75000,
        "loan_type": "personal",
        "requested_amount": 500000,
        "employment_type": "salaried",
    }

    documents = [
        VerifyApplicationDocument(
            document_type="PAN",
            original_name="pan_card.pdf",
            extracted_data={
                "name": "Rajesh Kumar Sharma",
                "pan_number": "ABCDE1234F",
                "date_of_birth": "15-08-1990",
            },
        ),
        VerifyApplicationDocument(
            document_type="AADHAAR",
            original_name="aadhaar.pdf",
            extracted_data={
                "name": "Rajesh Kumar Sharma",
                "date_of_birth": "15-08-1990",
                "gender": "Male",
            },
        ),
        VerifyApplicationDocument(
            document_type="SALARY_SLIP",
            original_name="salary_slip_july.pdf",
            extracted_data={
                "employee_name": "Rajesh Kumar Sharma",
                "employer": "Acme Tech Solutions Pvt Ltd",
                "net_salary": 75000,
                "gross_salary": 85000,
                "pan_number": "ABCDE1234F",
            },
        ),
        VerifyApplicationDocument(
            document_type="BANK_STATEMENT",
            original_name="bank_statement.pdf",
            extracted_data={
                "account_holder": "Rajesh Kumar Sharma",
                "salary_credits": [
                    {"date": "31-05-2026", "amount": 75000, "description": "ACH SALARY ACME TECH"},
                    {"date": "30-06-2026", "amount": 75000, "description": "ACH SALARY ACME TECH"},
                    {"date": "31-07-2026", "amount": 75000, "description": "ACH SALARY ACME TECH"},
                ],
                "emi_debits": [
                    {"date": "05-07-2026", "amount": 10000, "description": "HDFC LOAN EMI"},
                ],
            },
        ),
        VerifyApplicationDocument(
            document_type="FORM_16",
            original_name="form16.pdf",
            extracted_data={
                "employee_name": "Rajesh Kumar Sharma",
                "employer_name": "Acme Tech Solutions Pvt Ltd",
                "pan_employee": "ABCDE1234F",
                "gross_salary": 1020000,  # 85,000 * 12
            },
        ),
    ]

    # Step 1: Deterministic check
    checks, status, severity = run_deterministic_validation(applicant_declared, documents)
    print(f"Deterministic Status: {status.value} | Severity: {severity.value}")
    print(f"Total Checks: {len(checks)}")
    for c in checks:
        print(f"  [{c.status.value}] {c.type}: {c.message}")

    assert status == VerificationStatus.CONSISTENT, f"Expected CONSISTENT, got {status}"
    assert severity == SeverityLevel.LOW, f"Expected LOW severity, got {severity}"

    # Step 2: Groq reasoning
    groq_out = run_groq_reasoning(applicant_declared, checks, status, severity)
    print("\nGroq Reasoning Output:")
    print(f"  Status: {groq_out.verificationStatus}")
    print(f"  Risk Level: {groq_out.riskLevel}")
    print(f"  Recommended Action: {groq_out.recommendedAction}")
    print(f"  Summary: {groq_out.summary}")
    print(f"  Findings: {len(groq_out.findings)}")
    for f in groq_out.findings:
        print(f"    - {f.title} ({f.severity}): {f.explanation}")

    print("\n[PASS] Consistent application verified successfully!")


def test_inconsistent_application():
    print("\n" + "=" * 60)
    print("TEST 2: INCONSISTENT APPLICATION")
    print("=" * 60)

    applicant_declared = {
        "applicant_name": "Rajesh Kumar Sharma",
        "declared_monthly_income": 120000,  # Declares 120k, but slip shows 50k
        "loan_type": "personal",
        "requested_amount": 1000000,
        "employment_type": "salaried",
    }

    documents = [
        VerifyApplicationDocument(
            document_type="PAN",
            original_name="pan_card.pdf",
            extracted_data={
                "name": "Rajesh Kumar Sharma",
                "pan_number": "ABCDE1234F",
                "date_of_birth": "15-08-1990",
            },
        ),
        VerifyApplicationDocument(
            document_type="AADHAAR",
            original_name="aadhaar.pdf",
            extracted_data={
                "name": "Suresh Kumar Sharma",  # Name mismatch
                "date_of_birth": "10-01-1985",    # DOB mismatch
                "gender": "Male",
            },
        ),
        VerifyApplicationDocument(
            document_type="SALARY_SLIP",
            original_name="salary_slip_july.pdf",
            extracted_data={
                "employee_name": "Rajesh Sharma",
                "employer": "Acme Tech Solutions Pvt Ltd",
                "net_salary": 50000,
                "gross_salary": 55000,
                "pan_number": "XYZPW9999K",  # PAN mismatch
            },
        ),
        VerifyApplicationDocument(
            document_type="BANK_STATEMENT",
            original_name="bank_statement.pdf",
            extracted_data={
                "account_holder": "Rajesh Sharma",
                "salary_credits": [
                    {"date": "31-07-2026", "amount": 30000, "description": "SALARY CREDIT"},  # Mismatch with slip 50k
                ],
            },
        ),
        VerifyApplicationDocument(
            document_type="FORM_16",
            original_name="form16.pdf",
            extracted_data={
                "employee_name": "Rajesh Sharma",
                "employer_name": "Global Retail Enterprise Ltd",  # Employer mismatch
                "pan_employee": "XYZPW9999K",
                "gross_salary": 400000,
            },
        ),
    ]

    # Step 1: Deterministic check
    checks, status, severity = run_deterministic_validation(applicant_declared, documents)
    print(f"Deterministic Status: {status.value} | Severity: {severity.value}")
    print(f"Total Checks: {len(checks)}")
    for c in checks:
        print(f"  [{c.status.value}] ({c.severity.value}) {c.type}: {c.message}")

    assert status == VerificationStatus.REVIEW_REQUIRED, f"Expected REVIEW_REQUIRED, got {status}"
    assert severity == SeverityLevel.HIGH, f"Expected HIGH severity, got {severity}"

    # Step 2: Groq reasoning
    groq_out = run_groq_reasoning(applicant_declared, checks, status, severity)
    print("\nGroq Reasoning Output:")
    print(f"  Status: {groq_out.verificationStatus}")
    print(f"  Risk Level: {groq_out.riskLevel}")
    print(f"  Recommended Action: {groq_out.recommendedAction}")
    print(f"  Summary: {groq_out.summary}")
    print(f"  Findings: {len(groq_out.findings)}")
    for f in groq_out.findings:
        print(f"    - {f.title} ({f.severity}): {f.explanation} (Docs: {f.documents})")

    print("\n[PASS] Inconsistent application verified successfully!")


if __name__ == "__main__":
    test_consistent_application()
    test_inconsistent_application()
    print("\n" + "=" * 60)
    print("ALL CROSS-DOCUMENT VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)
