"""Centralized Gemini API gateway with rate limiting, retry, and backoff."""

import asyncio
import logging
import random
import time
from typing import Any

import google.generativeai as genai
from PIL import Image

from config import get_settings

logger = logging.getLogger(__name__)

# Module-level state
_configured = False
_model = None
_request_timestamps: list[float] = []
_lock = asyncio.Lock()
_call_counter = 0


def _ensure_configured():
    """Configure the Gemini SDK once."""
    global _configured, _model
    if not _configured:
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel(settings.gemini_model)
        _configured = True
    return _model


async def _wait_for_rate_limit():
    """Wait if we're exceeding the configured RPM."""
    settings = get_settings()
    rpm = settings.gemini_rpm
    now = time.time()

    # Clean timestamps older than 60 seconds
    while _request_timestamps and _request_timestamps[0] < now - 60:
        _request_timestamps.pop(0)

    if len(_request_timestamps) >= rpm:
        # Calculate wait time until the oldest request expires
        wait_time = 60 - (now - _request_timestamps[0]) + 0.5
        if wait_time > 0:
            logger.info(f"[GeminiGateway] Rate limit reached ({rpm} RPM). Waiting {wait_time:.1f}s...")
            await asyncio.sleep(wait_time)


def _parse_json_response(text: str) -> str:
    """Strip markdown code fences from a Gemini JSON response."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`").strip()
        if text.startswith("json"):
            text = text[4:].strip()
    return text


async def generate(
    prompt: str | list[Any],
    *,
    purpose: str = "unknown",
) -> str:
    """Send a request to Gemini through the centralized gateway.

    Handles:
    - Rate limiting (RPM)
    - Concurrency control (lock)
    - Retry with exponential backoff + jitter on 429/503
    - Request counting for monitoring

    Args:
        prompt: A string prompt or a list containing text + PIL images for Vision.
        purpose: Human-readable label for logging (e.g., "classify+extract PAN").

    Returns:
        Raw response text from Gemini.

    Raises:
        Exception: After max retries exhausted.
    """
    global _call_counter

    settings = get_settings()
    max_retries = settings.gemini_max_retries

    async with _lock:  # Concurrency control — sequential by default
        model = _ensure_configured()

        for attempt in range(max_retries + 1):
            try:
                await _wait_for_rate_limit()

                _request_timestamps.append(time.time())
                _call_counter += 1
                call_num = _call_counter

                logger.info(f"[GeminiGateway] Call #{call_num} — {purpose} (attempt {attempt + 1})")

                # Run the blocking Gemini call in a thread to not block the event loop
                response = await asyncio.to_thread(model.generate_content, prompt)

                logger.info(f"[GeminiGateway] Call #{call_num} — {purpose} — OK")
                return response.text.strip()

            except Exception as e:
                error_str = str(e)
                is_retryable = ("429" in error_str or "503" in error_str or "RESOURCE_EXHAUSTED" in error_str)
                
                # Do not retry if we hit the DAILY free tier limit (it won't recover in a few seconds)
                if "GenerateRequestsPerDay" in error_str:
                    is_retryable = False
                    logger.error(f"[GeminiGateway] ❌ DAILY Quota Exceeded. Cannot retry.")

                if is_retryable and attempt < max_retries:
                    import re
                    # Look for "Please retry in X.XXs."
                    match = re.search(r"retry in ([\d\.]+)s", error_str)
                    if match:
                        delay = float(match.group(1)) + 1.0  # add 1s buffer
                        logger.warning(
                            f"[GeminiGateway] Call #{_call_counter} — {purpose} — "
                            f"Gemini requested exact wait. Sleeping {delay:.1f}s (attempt {attempt + 1}/{max_retries + 1})."
                        )
                    else:
                        # Exponential backoff with jitter
                        base_delay = 2 ** (attempt + 1)  # 2, 4, 8 seconds
                        jitter = random.uniform(0, base_delay * 0.5)
                        delay = base_delay + jitter

                        logger.warning(
                            f"[GeminiGateway] Call #{_call_counter} — {purpose} — "
                            f"Retryable error (attempt {attempt + 1}/{max_retries + 1}). "
                            f"Waiting {delay:.1f}s before retry. Error: {error_str[:120]}"
                        )
                        
                    await asyncio.sleep(delay)
                    continue

                # Non-retryable or max retries exhausted
                logger.error(
                    f"[GeminiGateway] Call #{_call_counter} — {purpose} — "
                    f"Failed after {attempt + 1} attempt(s): {error_str[:200]}"
                )
                raise


def get_stats() -> dict:
    """Return gateway statistics for monitoring."""
    return {
        "total_calls": _call_counter,
        "recent_requests_in_window": len(_request_timestamps),
    }
