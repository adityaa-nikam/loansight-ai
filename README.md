# LoanSight AI — Underwriting Intelligence Platform

> **An Enterprise-Grade, AI-Powered Loan Document Intelligence & Credit Assessment Platform.**

---

## 📌 Executive Summary

**LoanSight AI** is a modern microservices-based lending platform designed to automate retail loan underwriting for Indian banking standards (e.g., HDFC, ICICI, SBI). By combining **Computer Vision/OCR**, a **Deterministic Financial Risk Engine**, and a **Vector-Grounded Hybrid RAG Assistant**, LoanSight reduces manual loan processing time from **3 days to under 30 seconds**.

---

## ✨ Key Features & Capabilities

### 👨‍💻 For Applicants
- **Multi-Bank Application Flow**: Select lending partner bank, loan product (Personal, Home, Auto), requested amount, and tenure.
- **Document Ingestion**: Encrypted upload for identity proofs (PAN, Aadhaar) and financial proofs (Payslips, Bank Statements).
- **Real-Time Status Pipeline**: Instant tracking from `Submitted` to `Under Review` and `Approved`.

### 👩‍💼 For Loan Officers (Underwriting Workspace)
- **Unified Split-Pane Dashboard**: Inspect extracted financial metrics alongside original document previews.
- **Automated Discrepancy Detection**: Instant cross-matching highlights name/salary mismatches across PAN and bank statements.
- **Deterministic FOIR Engine**: Calculates Fixed Obligation to Income Ratio (FOIR), net disposable income, and EMI caps.
- **Hybrid Vector RAG Assistant**: Query indexed bank underwriting manuals (ChromaDB + LangChain + Gemini/Groq) for policy-cited credit decision support.
- **Immutable Audit Trail**: Append-only log tracking every status change, reprocessing event, and officer note.

---

## 🛠️ Microservices Architecture & Tech Stack

                              ┌───────────────────────────────┐
                              │   React 19 + Vite Frontend    │
                              │   (Tailwind CSS v4 + Lucide)  │
                              └───────────────┬───────────────┘
                                              │ HTTP / REST
                                              ▼
                              ┌───────────────────────────────┐
                              │   Node.js + Express API       │
                              │   (JWT Auth, App Lifecycle)   │
                              └───────┬───────────────┬───────┘
                                      │               │
                     ┌────────────────┘               └────────────────┐
                     ▼                                                 ▼
         ┌──────────────────────┐                           ┌──────────────────────┐
         │ MongoDB (Mongoose 8) │                           │ Python 3.11 FastAPI  │
         │ Application Data &   │                           │ AI Microservice      │
         │ Audit Logs           │                           └──────────┬───────────┘
         └──────────────────────┘                                      │
                                                           ┌───────────┴───────────┐
                                                           ▼                       ▼
                                                ┌────────────────────┐  ┌────────────────────┐
                                                │ Tesseract OCR &    │  │ LangChain + RAG    │
                                                │ PDF Parsing        │  │ ChromaDB Vector    │
                                                └────────────────────┘  └────────────────────┘



graph TD
    subgraph ClientLayer ["🌐 Client Layer"]
        CustomerApp["📱 Applicant Portal<br/><i>React 19 + Tailwind v4</i><br/>Port 5173"]
        OfficerApp["👩‍💼 Officer Underwriting Workspace<br/><i>React 19 + RAG Copilot HUD</i><br/>Port 5173"]
    end

    subgraph ServerLayer ["⚡ Server Layer"]
        ExpressAPI["⚙️ Express 4 API<br/>Port 5000"]
        JWTAuth["🔐 JWT Auth<br/><i>bcrypt + Tokens</i>"]
        Multer["📁 Multer<br/><i>Document Uploads</i>"]
        AppEngine["🔄 Application Lifecycle<br/><i>State Machine & Audit Trail</i>"]
    end

    subgraph DataLayer ["💾 Data Layer"]
        MongoDB[("🍃 MongoDB<br/><i>Mongoose ODM</i>")]
        UploadsStorage["📁 /uploads<br/><i>Static PDF/Image Files</i>"]
    end

    subgraph AILayer ["🤖 AI Microservice Layer"]
        FastAPI["🚀 FastAPI Service<br/>Port 8000"]
        OCR["👁️ Tesseract OCR & PDFPlumber<br/><i>Field Extraction</i>"]
        FOIR["📊 Deterministic Engine<br/><i>FOIR Math & Discrepancies</i>"]
        ChromaRAG["📚 ChromaDB Vector Store<br/><i>LangChain Bank Policy RAG</i>"]
        LLM["🧠 Gemini / Groq API<br/><i>LLM Decision Reasoning</i>"]
    end

    CustomerApp -->|axios| ExpressAPI
    OfficerApp -->|axios| ExpressAPI
    ExpressAPI --> JWTAuth
    ExpressAPI --> Multer
    ExpressAPI --> AppEngine
    ExpressAPI -->|mongoose| MongoDB
    Multer --> UploadsStorage
    ExpressAPI -->|HTTP REST| FastAPI
    FastAPI --> OCR
    FastAPI --> FOIR
    FastAPI --> ChromaRAG
    FastAPI --> LLM




### Stack Breakdown

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Lucide Icons, React Router 7 | High-precision executive UI, Applicant Portal, Officer Underwriting Workspace |
| **Backend API** | Node.js, Express 4, MongoDB, Mongoose 8, JWT, Multer | Core business logic, authentication, status state machine, upload storage |
| **AI Service** | Python 3.11, FastAPI, Pydantic, Uvicorn | High-throughput AI microservice for OCR, extraction, and validation |
| **OCR & Extraction**| Tesseract OCR, PDFPlumber, PyPDF | Extraction of names, monthly salary, account numbers, and DOB |
| **RAG & Vector AI** | LangChain, ChromaDB, Google Gemini API, Groq LLM | Vector indexing of banking policy manuals & interactive Assistant Q&A |

---

## 📁 Repository Structure

loansight/ ├── frontend/ # React + Vite Application │ ├── src/ │ │ ├── components/ # Executive UI system & Officer widgets │ │ │ ├── common/ # Button, Modal, Drawer, Table, Toast, Confirm │ │ │ ├── layout/ # Navbar, Footer, Container │ │ │ ├── officer/ # OfficerSidebar, LoanAssistantChat, VerificationTab │ │ │ └── ui/ # DocumentRow, FileUpload, RiskIndicator, AIEvidenceBlock │ │ ├── context/ # AuthContext, ToastContext, ConfirmContext, LanguageContext │ │ ├── pages/ # Landing, Login, Register, ApplyLoan, Officer Pages │ │ └── services/ # Axios API service handlers │ └── package.json │ ├── backend/ # Node.js Express API Server │ ├── src/ │ │ ├── config/ # DB connection & server environment │ │ ├── controllers/ # Auth & Application controllers │ │ ├── middleware/ # JWT auth, error handlers, Multer upload │ │ ├── models/ # User & Application Mongoose schemas │ │ └── routes/ # REST API endpoints │ ├── uploads/ # Document storage directory │ └── package.json │ ├── ai-service/ # Python FastAPI Microservice │ ├── main.py # FastAPI entry point │ ├── services/ # Document extraction, RAG, Financial Validators │ │ ├── loan_officer_assistant.py # RAG Assistant with safe-dict parsers │ │ ├── policy_rag.py # ChromaDB vector index & embeddings │ │ ├── deterministic_validator.py # FOIR & credit rule calculations │ │ └── identity_parser.py # PAN/Aadhaar & Salary parsing │ ├── data/ # Sample bank policy PDFs & vector indexes │ └── requirements.txt └── README.md


---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0+
- **Python**: v3.10+
- **MongoDB**: Local instance or MongoDB Atlas URI
- **Tesseract OCR**: (Optional, for scanned image parsing)

---

### 1️⃣ Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/adityaa-nikam/loansight-main.git
cd loansight-main

# Install Node backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install

# Install Python AI Service dependencies
cd ../ai-service
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
PORT=5000
MONGODB_URI=mongodb://localhost:27017/loansight
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:5173
PORT=8000
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
VITE_API_BASE_URL=http://localhost:5000/api
