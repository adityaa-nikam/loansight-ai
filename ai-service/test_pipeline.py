"""Test script for Mistral PDF extraction pipeline.
Generates dummy payment slip PDFs and tests native extraction, OCR fallback, and structured Mistral extraction.
"""

import os
import io
import json
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv

load_dotenv()

def create_native_payment_slip_pdf(output_path: str = "dummy_payment2.pdf"):
    """Create a digital PDF with embedded text layer."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4
    
    text = """
ACME TECH SOLUTIONS PRIVATE LIMITED
Tower B, Cyber City, Gurugram, Haryana - 122002

PAYMENT SLIP / SALARY ADVICE

Employee Name: Rajesh Kumar Sharma
Employee ID: EMP-2024-8841
Employer: Acme Tech Solutions Pvt Ltd
Payment Month: July 2026
Payment Date: 31-07-2026
Bank Name: HDFC Bank
Branch: Cyber City Branch, Gurugram
Account Reference: XX1234567890
IFSC Code: HDFC0001234
Total Payment Amount: Rs. 85,000.00

-----------------------------------------------------------------------------------
PAYMENT BREAKDOWN / COMPONENTS
-----------------------------------------------------------------------------------
Component                     Amount (INR)            Status / Note
-----------------------------------------------------------------------------------
Basic Salary                  50,000.00               Paid
House Rent Allowance (HRA)    20,000.00               Paid
Special Allowance             15,000.00               Paid
Provident Fund (PF)           -6,000.00               Deducted
Professional Tax                -200.00               Deducted
Income Tax (TDS)              -3,800.00               Deducted
-----------------------------------------------------------------------------------
Net Payment Disbursed:        75,000.00               Credited to Account
-----------------------------------------------------------------------------------
    """
    
    rect = fitz.Rect(50, 50, 545, 790)
    page.insert_textbox(rect, text, fontsize=11, fontname="helv", color=(0, 0, 0))
    doc.save(output_path)
    doc.close()
    print(f"Created native digital PDF: {output_path}")


def create_scanned_payment_slip_pdf(output_path: str = "dummy_payment2_scanned.pdf"):
    """Create an image-only (scanned) PDF with NO text layer to test OCR fallback."""
    # Create image using PIL
    img = Image.new("RGB", (1200, 1600), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    lines = [
        "ACME TECH SOLUTIONS PRIVATE LIMITED",
        "Tower B, Cyber City, Gurugram - 122002",
        "",
        "PAYMENT SLIP / SALARY ADVICE",
        "",
        "Employee Name: Rajesh Kumar Sharma",
        "Employee ID: EMP-2024-8841",
        "Employer: Acme Tech Solutions Pvt Ltd",
        "Payment Month: July 2026",
        "Payment Date: 31-07-2026",
        "Bank: HDFC Bank",
        "Branch: Cyber City Branch",
        "Account Reference: XX1234567890",
        "IFSC: HDFC0001234",
        "Payment Amount: 85000.00",
        "",
        "COMPONENTS:",
        "- Basic Salary: 50000.00 (Paid)",
        "- House Rent Allowance: 20000.00 (Paid)",
        "- Special Allowance: 15000.00 (Paid)",
        "- PF Deduction: -6000.00 (Deducted)",
        "- TDS Deduction: -3800.00 (Deducted)",
        "",
        "Net Payment: 75000.00"
    ]
    
    y = 80
    for line in lines:
        draw.text((80, y), line, fill=(20, 20, 20))
        y += 40
        
    # Save as image-only PDF using fitz
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    doc = fitz.open()
    img_doc = fitz.open("png", img_bytes)
    pdf_bytes = img_doc.convert_to_pdf()
    img_pdf = fitz.open("pdf", pdf_bytes)
    doc.insert_pdf(img_pdf)
    doc.save(output_path)
    doc.close()
    print(f"Created scanned (image-only) PDF: {output_path}")


if __name__ == "__main__":
    create_native_payment_slip_pdf("dummy_payment2.pdf")
    create_scanned_payment_slip_pdf("dummy_payment2_scanned.pdf")
    
    from services.mistral_extractor import extract_text_from_pdf_data, extract_structured_data_mistral
    
    # 1. Test Native Extraction on dummy_payment2.pdf
    with open("dummy_payment2.pdf", "rb") as f:
        pdf_bytes = f.read()
    native_text, method1 = extract_text_from_pdf_data(pdf_bytes)
    print(f"\n[Test 1] Native PDF Extraction: Method = '{method1}', Chars = {len(native_text)}")
    assert method1 == "native", f"Expected native, got {method1}"
    assert len(native_text) > 40, "Expected > 40 chars"
    print("[PASS] Test 1: Native extraction works correctly.")
    
    # 2. Test OCR Fallback on dummy_payment2_scanned.pdf
    with open("dummy_payment2_scanned.pdf", "rb") as f:
        scanned_bytes = f.read()
    ocr_text, method2 = extract_text_from_pdf_data(scanned_bytes)
    print(f"\n[Test 2] Scanned PDF Extraction: Method = '{method2}', Chars = {len(ocr_text)}")
    assert method2 == "ocr", f"Expected ocr, got {method2}"
    assert len(ocr_text) > 20, "Expected > 20 chars from OCR"
    print("[PASS] Test 2: OCR fallback works correctly.")
    
    # 3. Test Mistral Extraction (if API key is available)
    api_key = os.getenv("MISTRAL_API_KEY")
    if api_key:
        print("\n[Test 3] Testing Mistral LLM Structured Extraction...")
        extracted = extract_structured_data_mistral("payment_slip", native_text)
        print("Mistral Structured Output:")
        print(json.dumps(extracted, indent=2))
        assert extracted.get("employee_name"), "Expected employee_name in output"
        print("[PASS] Test 3: Mistral structured extraction succeeded!")
    else:
        print("\n[INFO] MISTRAL_API_KEY not configured in .env; skipping live LLM test.")
