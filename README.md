# LoanLens AI

AI-powered loan document intelligence and decision-support platform.

> **Current implementation: Stage 1 — Platform Foundation**

---

## Project Overview

LoanLens AI is an intelligent lending platform that will use AI-powered document analysis to enable faster, explainable loan processing. The platform supports document intelligence, cross-validation, risk assessment, and decision support for loan officers.

This repository contains the Stage 1 foundation: the application shell, design system, public landing page, authentication UI, applicant portal, loan application form, and Express/MongoDB backend.

---

## Technology Stack

### Frontend
- React 19
- Vite 8
- Tailwind CSS 4
- React Router 7
- Axios
- Lucide React (icons)

### Backend
- Node.js
- Express 4
- MongoDB / Mongoose 8
- Helmet, CORS, Morgan

### Future (not yet implemented)
- Python / FastAPI AI service
- LangChain, ChromaDB
- Document OCR & processing

---

## Repository Structure

```
loanlens/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/    # Button, Input, Select, Card, Badge, StatusBadge
│   │   │   ├── layout/    # Navbar, Footer, Container, Section, PageHeader
│   │   │   └── ui/        # HeroVisualization
│   │   ├── pages/         # Landing, Login, Register, ApplicantPortal, ApplyLoan
│   │   ├── layouts/       # AppLayout (authenticated shell)
│   │   ├── services/      # API layer (api.js, applicationService.js)
│   │   ├── hooks/         # useForm
│   │   ├── utils/         # Validation utilities
│   │   ├── constants/     # Routes, mock data
│   │   └── routes/        # Route definitions
│   └── package.json
│
├── backend/               # Express API
│   ├── src/
│   │   ├── config/        # Environment config, DB connection
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Error handling, validation
│   │   ├── models/        # Mongoose schemas (User, LoanApplication)
│   │   ├── routes/        # Route definitions
│   │   ├── services/      # Business logic
│   │   └── utils/         # ApiError
│   ├── .env.example
│   └── package.json
│
├── README.md
├── .gitignore
└── package.json
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6+ (local or Atlas)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd loanlens

# Install all dependencies
npm run install:all
```

Or install individually:

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

---

## Running the Application

### Backend

```bash
cd backend
cp .env.example .env    # Configure environment variables
npm run dev             # Starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm run dev             # Starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                    | Default                              |
|----------------|--------------------------------|--------------------------------------|
| `NODE_ENV`     | Environment mode               | `development`                        |
| `PORT`         | Server port                    | `5000`                               |
| `MONGODB_URI`  | MongoDB connection string      | `mongodb://localhost:27017/loanlens`  |
| `CORS_ORIGIN`  | Allowed CORS origin            | `http://localhost:5173`              |

### Frontend

| Variable             | Description      | Default |
|----------------------|------------------|---------|
| `VITE_API_BASE_URL`  | API base URL     | `/api`  |

---

## Available Routes

### Frontend

| Route              | Description            |
|--------------------|------------------------|
| `/`                | Landing page           |
| `/login`           | Sign in                |
| `/register`        | Create account         |
| `/applicant`       | Applicant dashboard    |
| `/applicant/apply` | New loan application   |

### API Endpoints

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/health`           | Health check             |
| POST   | `/api/applications`     | Create loan application  |
| GET    | `/api/applications/:id` | Get application by ID    |

---

## MongoDB Configuration

The application expects a MongoDB instance. For local development:

1. Install and start MongoDB locally
2. The default connection string is `mongodb://localhost:27017/loanlens`
3. The database and collections are created automatically

For MongoDB Atlas, update `MONGODB_URI` in your `.env` file with your connection string.

**Note:** If `MONGODB_URI` is not set in development mode, the server will start without a database connection (with a warning). In production, it will fail with a clear error.

---

## Future Architecture

```
Applicant → React → Node/Express → MongoDB + Document Storage
                                  → Python/FastAPI AI Service
                                    → Document Processing
                                    → Classification & OCR
                                    → Financial Analysis
                                    → Risk Assessment
                                    → Explainable AI
                                  → Loan Officer Review
```

The Python AI service will be introduced in future stages as an independent microservice communicating with the Node backend.

---

## What's NOT Implemented Yet

The following are planned for future stages:

- JWT authentication
- Document upload & processing
- OCR / document classification
- Financial data extraction
- Cross-document validation
- Fraud/anomaly detection
- Risk scoring & assessment
- AI assistants (RAG, policy chat)
- Loan officer dashboard
- Admin dashboard
- Audit trails & notifications
- Python FastAPI AI service
