"""
tools.py — All 6 agent tool functions.

Tools 1-5 are pure Python (no LLM).
Tool 6 calls Gemini with a narrow refactor-only prompt.
"""
import os
import json
import re
import ast
import subprocess
import tempfile

from analysis.complexity import analyze_complexity
from analysis.metrics import analyze_metrics
from security.security_scanner import run_ruff, run_bandit


# ─────────────────────────────────────────────────────────────────────────────
# Tool 1 — Syntax / Lint Analysis (Ruff)
# ─────────────────────────────────────────────────────────────────────────────

def syntax_analysis(code: str) -> dict:
    """Run Ruff on the code. Return structured lint findings."""
    findings = run_ruff(code)
    return {
        "tool": "ruff",
        "findings": findings,
        "total_issues": len(findings),
        "summary": f"{len(findings)} lint issue(s) found." if findings else "No lint issues.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tool 2 — Complexity Analysis (AST)
# ─────────────────────────────────────────────────────────────────────────────

def complexity_analysis(code: str) -> dict:
    """Analyze time/space complexity via AST inspection."""
    return analyze_complexity(code)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 3 — Security Scan (Bandit)
# ─────────────────────────────────────────────────────────────────────────────

def security_scan(code: str) -> dict:
    """Run Bandit on the code. Return severity-classified findings."""
    issues = run_bandit(code)

    # Determine overall risk level
    severities = [i.get("severity", "LOW") for i in issues]
    if "HIGH" in severities:
        risk = "HIGH"
    elif "MEDIUM" in severities:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "tool": "bandit",
        "risk_level": risk,
        "issues": issues,
        "total_issues": len(issues),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tool 4 — Trace Analysis
# ─────────────────────────────────────────────────────────────────────────────

def trace_analysis(trace: list) -> dict:
    """
    Analyze the execution trace produced by ObservableArray.
    Returns swap count, comparison count, most active line, worst-case flag.
    """
    if not trace:
        return {
            "total_swaps": 0,
            "total_comparisons": 0,
            "most_active_line": None,
            "worst_case_detected": False,
            "pattern_note": "No trace data provided.",
        }

    total_swaps = 0
    total_comparisons = 0
    line_counts: dict = {}

    for step in trace:
        if step.get("swap") is not None:
            # swap can be a single int or list of two ints (merged steps)
            swap_val = step["swap"]
            if isinstance(swap_val, list):
                total_swaps += 1
            else:
                total_swaps += 1

        if step.get("compare") is not None:
            total_comparisons += 1

        line = step.get("line")
        if line:
            line_counts[line] = line_counts.get(line, 0) + 1

    most_active_line = max(line_counts, key=line_counts.get) if line_counts else None

    # Heuristic: if swaps > n² / 4 for inferred n, likely worst case
    # We approximate n from the array length in first step
    n = len(trace[0].get("array", [])) if trace else 0
    worst_case_detected = n > 0 and total_comparisons > (n * n) // 2

    # Build pattern note
    if worst_case_detected:
        pattern_note = (
            f"High comparison count ({total_comparisons}) relative to array size ({n}) "
            "suggests a near worst-case input ordering (e.g. reverse-sorted array)."
        )
    elif total_swaps == 0:
        pattern_note = "No swaps performed — input was already sorted (best-case scenario)."
    else:
        pattern_note = (
            f"Algorithm performed {total_swaps} swap(s) and {total_comparisons} comparison(s). "
            "Appears to be an average-case scenario."
        )

    return {
        "total_swaps": total_swaps,
        "total_comparisons": total_comparisons,
        "most_active_line": most_active_line,
        "worst_case_detected": worst_case_detected,
        "pattern_note": pattern_note,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tool 5 — Optimization Suggestion (rule-based lookup table)
# ─────────────────────────────────────────────────────────────────────────────

_ALGO_PATTERNS = {
    "bubble_sort": {
        "suggested_algo": "Tim Sort / Merge Sort",
        "improvement": "Bubble Sort is O(n²) average/worst. Tim Sort (Python's built-in) is O(n log n) average and O(n) best-case.",
    },
    "selection_sort": {
        "suggested_algo": "Heap Sort",
        "improvement": "Selection Sort is O(n²) always. Heap Sort achieves O(n log n) guaranteed with O(1) extra space.",
    },
    "insertion_sort": {
        "suggested_algo": "Shell Sort / Tim Sort",
        "improvement": "Insertion Sort is O(n²) worst. Shell Sort reduces this to O(n log²n). For large data, Tim Sort is O(n log n).",
    },
    "quick_sort": {
        "suggested_algo": "Intro Sort",
        "improvement": "Quick Sort is O(n²) worst-case. Intro Sort switches to Heap Sort when recursion depth exceeds 2·log(n), giving guaranteed O(n log n).",
    },
    "merge_sort": {
        "suggested_algo": "Tim Sort (already optimal)",
        "improvement": "Merge Sort is already O(n log n) in all cases. Tim Sort is an optimized variant for real-world data with natural runs.",
    },
    "heap_sort": {
        "suggested_algo": "Tim Sort (for practical use)",
        "improvement": "Heap Sort is O(n log n) guaranteed. However poor cache performance makes Tim Sort faster in practice.",
    },
    "linear_search": {
        "suggested_algo": "Binary Search (if sorted)",
        "improvement": "Linear Search is O(n). Binary Search on sorted data is O(log n) — a dramatic improvement for large datasets.",
    },
    "binary_search": {
        "suggested_algo": "Already optimal for sorted arrays",
        "improvement": "Binary Search is O(log n) — optimal for searching sorted arrays.",
    },
}

def optimization_suggestion(code: str, complexity: dict) -> dict:
    """
    Detect the algorithm from the code and return a better alternative suggestion.
    Rule-based — no LLM involved.
    """
    code_lower = code.lower()
    detected = "unknown"

    # Simple keyword detection (order matters — more specific first)
    if "heap_sort" in code_lower or "heapify" in code_lower:
        detected = "heap_sort"
    elif "merge_sort" in code_lower or "merge_sort_range" in code_lower:
        detected = "merge_sort"
    elif "quick_sort" in code_lower or "partition" in code_lower:
        detected = "quick_sort"
    elif "bubble_sort" in code_lower:
        detected = "bubble_sort"
    elif "selection_sort" in code_lower:
        detected = "selection_sort"
    elif "insertion_sort" in code_lower:
        detected = "insertion_sort"
    elif "binary_search" in code_lower:
        detected = "binary_search"
    elif "linear_search" in code_lower:
        detected = "linear_search"

    if detected in _ALGO_PATTERNS:
        rec = _ALGO_PATTERNS[detected]
        return {
            "current_algo": detected.replace("_", " ").title(),
            "suggested_algo": rec["suggested_algo"],
            "improvement": rec["improvement"],
        }

    # Generic fallback based on complexity
    time_c = complexity.get("time_complexity", "")
    if "n²" in time_c or "n2" in time_c.lower():
        return {
            "current_algo": "Unknown O(n²) algorithm",
            "suggested_algo": "Merge Sort / Quick Sort",
            "improvement": "Any O(n²) sort can be replaced with an O(n log n) algorithm for arrays larger than ~16 elements.",
        }

    return {
        "current_algo": "Unknown",
        "suggested_algo": "No suggestion",
        "improvement": "Algorithm not recognized. Ensure the function name matches a known DSA pattern.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Tool 6 — Code Refactor (calls Gemini with a narrow prompt)
# ─────────────────────────────────────────────────────────────────────────────

def code_refactor(code: str) -> str:
    """
    Ask Gemini to refactor the code for readability and performance.
    Returns the refactored code string only.
    Tries gemini-2.5-flash, then falls back to gemini-2.5-flash-lite, with retries.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return "# API key not set — skipping refactor."

    try:
        from google import genai as google_genai
        from google.genai import types as google_types
        import time

        client = google_genai.Client(api_key=api_key)

        prompt = (
            "Refactor the following Python code ONLY for readability and minor performance improvements.\n"
            "Rules:\n"
            "- Keep the same algorithm logic and function signatures\n"
            "- Add brief docstrings and inline comments\n"
            "- Improve variable names if they are unclear\n"
            "- Return ONLY the refactored Python code, no explanation, no markdown fences\n\n"
            f"```python\n{code}\n```"
        )

        models_to_try = [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-flash-lite-latest"
        ]

        last_error = None
        raw = ""

        for model_name in models_to_try:
            max_retries = 3
            backoff_seconds = 1.5
            
            for attempt in range(max_retries):
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=google_types.GenerateContentConfig(
                            temperature=0.2,
                            max_output_tokens=2048,
                        ),
                    )
                    raw = response.text.strip()
                    # Strip markdown code fences if model wraps them
                    if raw.startswith("```"):
                        raw = re.sub(r"^```[a-z]*\n?", "", raw)
                        raw = re.sub(r"\n?```$", "", raw)
                    return raw.strip()
                except Exception as e:
                    err_str = str(e)
                    last_error = e
                    is_transient = any(kw in err_str for kw in ["503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED", "demand"])
                    
                    if is_transient and attempt < max_retries - 1:
                        time.sleep(backoff_seconds * (2 ** attempt))
                    else:
                        break

        # If we reach here, all failed
        raise last_error

    except Exception as e:
        return f"# Refactor failed: {e}\n{code}"
