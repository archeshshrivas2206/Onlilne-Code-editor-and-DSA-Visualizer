"""
llm_client.py — Gemini 2.0 Flash client wrapper using the new google-genai SDK.
"""
import os
import json
from google import genai
from google.genai import types
from agent.prompts import build_prompt, SYSTEM_INSTRUCTION
from dotenv import load_dotenv

_MODEL_NAME = "gemini-2.5-flash"


import time

def generate_report(code: str, tool_outputs: dict) -> dict:
    """
    Call Gemini with all tool outputs and return the structured review report.
    Tries gemini-2.5-flash, then falls back to gemini-2.5-flash-lite if the former is busy/503.
    Also handles 503/429 transient rate limits with exponential retries.
    """
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"error": "GEMINI_API_KEY is not set in .env"}

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(code, tool_outputs)
    
    # Ordered list of models to try in case of server overload (503 / 429)
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-flash-lite-latest"
    ]
    
    last_error = None
    raw_text = ""

    for model_name in models_to_try:
        max_retries = 3
        backoff_seconds = 1.5
        
        for attempt in range(max_retries):
            try:
                # Call Gemini generate_content
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        response_mime_type="application/json",
                        temperature=0.3,
                        max_output_tokens=4096,
                    ),
                )
                raw_text = response.text.strip()
                report = json.loads(raw_text)
                return report
                
            except json.JSONDecodeError as e:
                # If it's valid response but JSON parsing failed, return parsed details
                return {
                    "error": f"Gemini returned non-JSON response: {e}",
                    "raw_response": raw_text,
                }
            except Exception as e:
                err_str = str(e)
                last_error = e
                
                # Check if it is a transient error (503 Unavailable, 429 Resource Exhausted)
                is_transient = any(kw in err_str for kw in ["503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "demand"])
                
                if is_transient and attempt < max_retries - 1:
                    # Sleep and retry same model
                    sleep_time = backoff_seconds * (2 ** attempt)
                    time.sleep(sleep_time)
                else:
                    # Break out of loop to fallback to next model
                    break

    # If all models and all retries failed
    return {"error": f"Gemini API error (All fallback models exhausted): {str(last_error)}"}
