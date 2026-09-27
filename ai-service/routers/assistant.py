"""Loan Officer AI Assistant & Policy Knowledge Base Router."""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.loan_officer_assistant import process_loan_officer_question
from services.policy_rag import policy_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["loan-assistant"])


class ConversationMessage(BaseModel):
    role: str
    content: str


class LoanAssistantRequest(BaseModel):
    application_id: str = Field(..., description="ID of the loan application in MongoDB")
    applicant_data: Dict[str, Any] = Field(..., description="Full applicant, document, and validation snapshot")
    question: str = Field(..., description="The loan officer's question")
    conversation_history: Optional[List[ConversationMessage]] = Field(
        default=None, description="Previous messages in current chat session"
    )


class PolicySearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: int = 5


@router.post("/loan-assistant")
async def loan_assistant_endpoint(request: LoanAssistantRequest):
    """Hybrid RAG endpoint answering loan officer inquiries using MongoDB applicant data and Bank Policy Vector DB."""
    try:
        history_dicts = (
            [{"role": m.role, "content": m.content} for m in request.conversation_history]
            if request.conversation_history
            else []
        )
        
        result = await process_loan_officer_question(
            application_id=request.application_id,
            applicant_data=request.applicant_data,
            question=request.question,
            conversation_history=history_dicts,
        )
        return result
    except Exception as e:
        logger.error(f"Error in loan assistant endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")


@router.get("/policies")
def get_all_policies_endpoint():
    """Retrieve all structured bank policies from the knowledge base."""
    return {"policies": policy_store.get_all_policies()}


@router.post("/policies/search")
def search_policies_endpoint(request: PolicySearchRequest):
    """Semantic vector search against the bank policies knowledge base."""
    results = policy_store.search(
        query=request.query,
        category=request.category,
        top_k=request.top_k,
    )
    return {"results": results, "query": request.query}
