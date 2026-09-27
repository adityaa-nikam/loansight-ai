"""LoanLens AI Service — Document Intelligence API."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.documents import router as documents_router
from routers.assistant import router as assistant_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="LoanLens AI Service",
    description="AI-powered document intelligence for loan processing",
    version="1.0.0",
)

# CORS — allow Node.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(documents_router)
app.include_router(assistant_router)


@app.on_event("startup")
async def startup_event():
    from config import get_settings

    settings = get_settings()
    if not settings.gemini_api_key or settings.gemini_api_key == "your_gemini_api_key_here":
        logger.warning(
            "⚠️  GEMINI_API_KEY not configured! "
            "Set it in ai-service/.env — Get a key from https://aistudio.google.com/"
        )
    else:
        logger.info(f"✅ Gemini API key configured (model: {settings.gemini_model})")

    if not settings.mistral_api_key:
        logger.warning(
            "⚠️  MISTRAL_API_KEY not configured! "
            "Set it in ai-service/.env for Mistral document extraction"
        )
    else:
        logger.info(f"✅ Mistral API key configured (model: {settings.mistral_model})")

    if not settings.groq_api_key:
        logger.warning(
            "⚠️  GROQ_API_KEY not configured! "
            "Set it in ai-service/.env for Groq cross-document verification analysis"
        )
    else:
        logger.info(f"✅ Groq API key configured (model: {settings.groq_model})")

    logger.info("🚀 LoanLens AI Service started on http://localhost:8000")
    logger.info("📄 API docs: http://localhost:8000/docs")
