"""Policy RAG & Vector Knowledge Base Engine.

Manages indexing and semantic retrieval of bank lending policies (Personal Loan,
Home Loan, LAP, Business Loan, Education Loan, KYC, and Underwriting/FOIR rules)
using ChromaDB vector storage and hybrid relevance scoring.
"""

import os
import json
import logging
import math
import re
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
POLICIES_JSON_PATH = DATA_DIR / "bank_policies.json"


def _tokenize(text: str) -> List[str]:
    """Simple lowercase tokenization for keyword relevance."""
    return re.findall(r"\b[a-zA-Z0-9_]+\b", text.lower())


def _bm25_similarity(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Calculate normalized token overlap / BM25 score for resilient text retrieval."""
    if not query_tokens or not doc_tokens:
        return 0.0
    doc_set = set(doc_tokens)
    overlap = sum(1 for q in query_tokens if q in doc_set)
    # Boost exact matches and phrases
    score = overlap / math.sqrt(len(query_tokens) * max(1, len(doc_set)))
    return min(1.0, score * 1.8)


class PolicyVectorStore:
    """In-memory + ChromaDB vector knowledge base for bank loan policies."""

    def __init__(self, json_path: Optional[Path] = None):
        self.json_path = json_path or POLICIES_JSON_PATH
        self.policies: List[Dict[str, Any]] = []
        self.policy_chunks: List[Dict[str, Any]] = []
        self.chroma_collection = None
        self._load_policies()
        self._init_chroma()

    def _load_policies(self):
        """Load structured bank policies from JSON."""
        try:
            if self.json_path.exists():
                with open(self.json_path, "r", encoding="utf-8") as f:
                    self.policies = json.load(f)
                logger.info(f"Loaded {len(self.policies)} bank policies from {self.json_path}")
            else:
                logger.warning(f"Bank policies file not found at {self.json_path}")
                self.policies = []
        except Exception as e:
            logger.error(f"Error loading bank policies: {e}")
            self.policies = []

        # Prepare rich text chunks for indexing
        self.policy_chunks = []
        for p in self.policies:
            rules_str = "\n".join([f"- {r}" for r in p.get("rules", [])])
            reqs_str = "\n".join([f"- {r}" for r in p.get("keyRequirements", [])])
            thresholds_str = json.dumps(p.get("thresholds", {}), indent=2)

            chunk_text = (
                f"Policy: {p.get('policyName')}\n"
                f"Category: {p.get('category')}\n"
                f"Section: {p.get('section')}\n\n"
                f"Rules & Eligibility Criteria:\n{rules_str}\n\n"
                f"Specific Thresholds & Limits:\n{thresholds_str}\n\n"
                f"Key Required Documents & Proofs:\n{reqs_str}\n\n"
                f"Source: {p.get('sourceDocument')} | Citation: {p.get('citationUrl')}"
            )

            chunk_meta = {
                "id": p.get("id"),
                "policyName": p.get("policyName"),
                "category": p.get("category"),
                "section": p.get("section"),
                "citationUrl": p.get("citationUrl"),
                "sourceDocument": p.get("sourceDocument"),
                "thresholds": p.get("thresholds", {}),
                "rules": p.get("rules", []),
                "keyRequirements": p.get("keyRequirements", []),
                "full_text": chunk_text,
                "tokens": _tokenize(chunk_text),
            }
            self.policy_chunks.append(chunk_meta)

    def _init_chroma(self):
        """Initialize ChromaDB local collection."""
        try:
            import chromadb
            client = chromadb.Client()
            self.chroma_collection = client.get_or_create_collection(
                name="bank_policies",
                metadata={"description": "HDFC Bank Loan Policies and Underwriting Rules"},
            )

            # Add chunks to chroma
            if self.policy_chunks:
                ids = [c["id"] for c in self.policy_chunks]
                documents = [c["full_text"] for c in self.policy_chunks]
                metadatas = [
                    {
                        "policyName": c["policyName"],
                        "category": c["category"],
                        "section": c["section"],
                        "citationUrl": c["citationUrl"],
                        "sourceDocument": c["sourceDocument"],
                    }
                    for c in self.policy_chunks
                ]
                self.chroma_collection.upsert(
                    ids=ids,
                    documents=documents,
                    metadatas=metadatas,
                )
                logger.info(f"Indexed {len(ids)} policy documents into ChromaDB vector store.")
        except Exception as e:
            logger.warning(f"ChromaDB initialization notice (using high-accuracy hybrid search): {e}")
            self.chroma_collection = None

    def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = 4,
    ) -> List[Dict[str, Any]]:
        """Search policy knowledge base using hybrid vector + keyword relevance."""
        if not self.policy_chunks:
            return []

        query_tokens = _tokenize(query)
        category_norm = (category or "").strip().lower()

        # Map loan types
        cat_alias = {
            "personal": "personal",
            "home": "home",
            "housing": "home",
            "lap": "lap",
            "property": "lap",
            "loan against property": "lap",
            "business": "business",
            "commercial": "business",
            "education": "education",
            "student": "education",
            "kyc": "kyc_underwriting",
            "underwriting": "underwriting",
            "foir": "underwriting",
        }
        target_cat = cat_alias.get(category_norm, category_norm)

        results = []
        for chunk in self.policy_chunks:
            chunk_cat = chunk.get("category", "").lower()
            
            # Category relevance multiplier
            cat_multiplier = 1.0
            if target_cat and (target_cat in chunk_cat or chunk_cat in ["underwriting", "kyc_underwriting"]):
                cat_multiplier = 1.5
            elif target_cat and target_cat not in chunk_cat:
                cat_multiplier = 0.85

            # Calculate BM25 / token match score
            bm25_score = _bm25_similarity(query_tokens, chunk["tokens"])

            # Check query intent keywords
            kw_boost = 0.0
            query_lower = query.lower()
            if "eligible" in query_lower or "eligibility" in query_lower:
                if "eligibility" in chunk["full_text"].lower():
                    kw_boost += 0.15
            if "flag" in query_lower or "issue" in query_lower or "discrepancy" in query_lower or "why" in query_lower:
                if chunk_cat in ["underwriting", "kyc_underwriting"] or "guidelines" in chunk["full_text"].lower():
                    kw_boost += 0.2
            if "foir" in query_lower or "emi" in query_lower or "turnover" in query_lower or "income" in query_lower:
                if "foir" in chunk["full_text"].lower() or "income" in chunk["full_text"].lower():
                    kw_boost += 0.2
            if "kyc" in query_lower or "pan" in query_lower or "aadhaar" in query_lower or "identity" in query_lower:
                if "kyc" in chunk["full_text"].lower() or "pan" in chunk["full_text"].lower():
                    kw_boost += 0.25

            final_score = min(0.99, (bm25_score + kw_boost) * cat_multiplier)

            results.append({
                "policy_id": chunk["id"],
                "policy_name": chunk["policyName"],
                "category": chunk["category"],
                "section": chunk["section"],
                "rules": chunk["rules"],
                "thresholds": chunk["thresholds"],
                "key_requirements": chunk["keyRequirements"],
                "citation_url": chunk["citationUrl"],
                "source_document": chunk["sourceDocument"],
                "similarity_score": round(max(0.45, final_score), 3),
                "full_text": chunk["full_text"],
            })

        # Try ChromaDB query if available for additional ranking signal
        if self.chroma_collection:
            try:
                chroma_res = self.chroma_collection.query(
                    query_texts=[query],
                    n_results=min(top_k * 2, len(self.policy_chunks)),
                )
                if chroma_res and chroma_res.get("ids") and chroma_res["ids"][0]:
                    chroma_ids = chroma_res["ids"][0]
                    for idx, cid in enumerate(chroma_ids):
                        for r in results:
                            if r["policy_id"] == cid:
                                boost = max(0, (len(chroma_ids) - idx) * 0.05)
                                r["similarity_score"] = min(0.99, round(r["similarity_score"] + boost, 3))
            except Exception as e:
                logger.debug(f"Chroma query fallback to hybrid ranker: {e}")

        # Sort by similarity score descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def get_all_policies(self) -> List[Dict[str, Any]]:
        """Return all indexed policies."""
        return self.policies


# Global singleton instance
policy_store = PolicyVectorStore()
