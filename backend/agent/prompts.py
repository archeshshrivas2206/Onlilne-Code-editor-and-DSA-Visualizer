"""
prompts.py — Master prompt template sent to Gemini 2.5 Flash.
"""

SYSTEM_INSTRUCTION = """You are a senior software engineer and DSA expert conducting an automated code review.
You will be given:
1. The original Python code submitted by a student/developer.
2. Pre-computed analysis results from 5 specialized tools (syntax, complexity, security, runtime trace, optimization).

Your job is to synthesize all tool outputs into a single coherent review report.
IMPORTANT RULES:
- Do NOT contradict the tool-provided data (complexities, swap counts, security findings, etc.)
- Add your own observations, insights, and nuance on top of the tool results
- Be constructive, specific, and educational in tone
- Generate per-line annotations pointing out specific issues in the code
- Generate an annotated version of the code with AI comments inserted as Python comments
- Return ONLY a valid JSON object — no markdown, no explanation outside the JSON
"""

def build_prompt(code: str, tool_outputs: dict) -> str:
    syntax      = tool_outputs.get("syntax_analysis") or {}
    complexity  = tool_outputs.get("complexity_analysis") or {}
    security    = tool_outputs.get("security_scan") or {}
    trace       = tool_outputs.get("trace_analysis") or {}
    optimization= tool_outputs.get("optimization_suggestion") or {}
    refactored  = tool_outputs.get("code_refactor") or ""
    metrics     = tool_outputs.get("metrics") or {}

    prompt = f"""
You are reviewing the following Python DSA code:

```python
{code}
```

═══════════════════════════════════════════
TOOL ANALYSIS RESULTS (use these as ground truth)
═══════════════════════════════════════════

[TOOL 1 — SYNTAX / LINT ANALYSIS]
{_fmt(syntax)}

[TOOL 2 — COMPLEXITY ANALYSIS]
Time Complexity: {complexity.get("time_complexity", "Unknown")}
Space Complexity: {complexity.get("space_complexity", "Unknown")}
Explanation: {complexity.get("explanation", "")}
Loop Depth: {complexity.get("nested_loop_depth", "?")}
Has Recursion: {complexity.get("has_recursion", False)}

[TOOL 3 — SECURITY SCAN (Bandit)]
{_fmt(security)}

[TOOL 4 — RUNTIME TRACE ANALYSIS]
Total Swaps: {trace.get("total_swaps", 0)}
Total Comparisons: {trace.get("total_comparisons", 0)}
Most Active Line: {trace.get("most_active_line", "N/A")}
Worst-case Pattern Detected: {trace.get("worst_case_detected", False)}
Observation: {trace.get("pattern_note", "")}

[TOOL 5 — OPTIMIZATION SUGGESTION]
Current Algorithm: {optimization.get("current_algo", "Unknown")}
Suggested Algorithm: {optimization.get("suggested_algo", "None")}
Expected Improvement: {optimization.get("improvement", "None")}

[TOOL 6 — REFACTORED CODE]
```python
{refactored}
```

[CODE METRICS]
Total Lines: {metrics.get("total_lines", "?")}
Code Lines: {metrics.get("code_lines", "?")}
Max Nesting Depth: {metrics.get("max_nesting_depth", "?")}
Naming Issues: {metrics.get("naming_issues", [])}
Has Docstrings: {metrics.get("has_docstrings", False)}

═══════════════════════════════════════════
OUTPUT REQUIREMENTS
═══════════════════════════════════════════

Return ONLY the following JSON structure — no text before or after:

{{
  "annotations": [
    {{
      "line": <line_number_in_original_code>,
      "severity": "<error|warning|info>",
      "type": "<performance|style|bug|security|suggestion>",
      "message": "<clear explanation of the issue>",
      "suggestion": "<concrete fix or improvement>"
    }}
  ],
  "code_quality": {{
    "summary": "<2-3 sentence overall quality assessment>",
    "readability": "<assessment of code readability and structure>",
    "naming_conventions": "<assessment of variable/function naming>",
    "issues": ["<specific issue 1>", "<specific issue 2>"]
  }},
  "complexity": {{
    "time": "<time complexity from tool data>",
    "space": "<space complexity from tool data>",
    "explanation": "<clear explanation for a student to understand>"
  }},
  "security": {{
    "risk_level": "<LOW|MEDIUM|HIGH based on bandit findings>",
    "findings": [{{"issue": "<text>", "severity": "<HIGH|MEDIUM|LOW>", "line": <int or null>}}]
  }},
  "runtime_analysis": {{
    "total_swaps": <int>,
    "total_comparisons": <int>,
    "observation": "<insight about the algorithm's runtime behavior from the trace>"
  }},
  "optimization": {{
    "current_algorithm": "<detected algorithm name>",
    "suggested_algorithm": "<better alternative if any>",
    "expected_improvement": "<concrete Big-O improvement or explanation>"
  }},
  "optimized_code": "<the refactored code from tool 6, properly escaped for JSON>",
  "annotated_code": "<the original user code with # AI: <suggestion> comments inserted above lines that have issues>"
}}

IMPORTANT NOTES FOR ANNOTATIONS:
- The "line" field must reference the exact line number in the ORIGINAL user code (1-indexed)
- Generate at least 1 annotation if there are any issues; generate an empty array [] if the code is perfect
- severity must be one of: "error", "warning", "info"
- type must be one of: "performance", "style", "bug", "security", "suggestion"

IMPORTANT NOTES FOR ANNOTATED_CODE:
- Insert "# AI: <message>" comment lines ABOVE the lines that have issues
- Keep the original code intact — only add comment lines
- This should be valid Python (the AI comments are just regular Python comments)
"""
    return prompt.strip()


def _fmt(obj) -> str:
    """Format a dict or list cleanly for prompt injection."""
    if not obj:
        return "No issues found."
    if isinstance(obj, list):
        if not obj:
            return "No issues found."
        return "\n".join(f"  - {item}" for item in obj)
    if isinstance(obj, dict):
        return "\n".join(f"  {k}: {v}" for k, v in obj.items())
    return str(obj)
