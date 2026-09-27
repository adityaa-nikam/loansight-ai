import os
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    print(f"Health status: {response.status_code}, body: {response.json()}")
    assert response.status_code == 200

def test_extract_text_native():
    with open("dummy_payment2.pdf", "rb") as f:
        response = client.post(
            "/api/extract-text?document_type=salary_slip",
            files={"file": ("dummy_payment2.pdf", f, "application/pdf")}
        )
    print(f"Extract text status: {response.status_code}, has_text: {response.json().get('has_text')}")
    assert response.status_code == 200
    assert response.json().get("has_text") is True

def test_verify_application():
    payload = {
        "application_id": "app-12345",
        "applicant_declared": {
            "name": "Rajesh Kumar",
            "declared_monthly_income": 80000,
        },
        "documents": [
            {
                "document_type": "SALARY_SLIP",
                "original_name": "slip.pdf",
                "extracted_data": {
                    "employee_name": "Rajesh Kumar",
                    "employer": "Tech Corp",
                    "net_salary": 80000,
                    "gross_salary": 90000,
                },
            }
        ],
    }
    response = client.post("/api/verify-application", json=payload)
    print(f"Verify application status: {response.status_code}, data: {response.json().get('verificationStatus')}")
    assert response.status_code == 200
    assert response.json().get("verificationStatus") is not None

if __name__ == "__main__":
    test_health()
    test_extract_text_native()
    test_verify_application()
    print("[PASS] FastAPI endpoints verified successfully.")
