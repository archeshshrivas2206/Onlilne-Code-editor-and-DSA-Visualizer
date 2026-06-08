"""
review_agent.py — Orchestrator: runs all tools then calls Gemini for final report.
"""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from agent.tools import (
    syntax_analysis,
    complexity_analysis,
    security_scan,
    trace_analysis,
    optimization_suggestion,
    code_refactor,
)
from analysis.metrics import analyze_metrics
from agent.llm_client import generate_report


# Thread pool for running sync tools in async context
_executor = ThreadPoolExecutor(max_workers=6)


def _safe_run(fn, *args) -> Any:
    """Run a tool function, catching all exceptions so one failure doesn't block others."""
    try:
        return fn(*args)
    except Exception as e:
        return {"error": str(e), "tool_failed": True}


async def _run_in_thread(fn, *args) -> Any:
    """Wrap a synchronous tool in an executor for asyncio.gather compatibility."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _safe_run, fn, *args)


async def run_review(code: str, trace: list) -> dict:
    """
    Main agent entry point.
    1. Runs Tools 1–5 in parallel (asyncio.gather).
    2. Runs Tool 6 (refactor) after, since it depends on nothing and is slower.
    3. Collects all results → calls Gemini for final structured report.
    4. Returns the final report dict.
    """

    # ── Phase 1: run tools 1-5 and metrics in parallel ──────────────────────
    (
        syntax_result,
        complexity_result,
        security_result,
        trace_result,
        metrics_result,
    ) = await asyncio.gather(
        _run_in_thread(syntax_analysis, code),
        _run_in_thread(complexity_analysis, code),
        _run_in_thread(security_scan, code),
        _run_in_thread(trace_analysis, trace),
        _run_in_thread(analyze_metrics, code),
    )

    # ── Phase 2: optimization (needs complexity result) ──────────────────────
    opt_result = await _run_in_thread(optimization_suggestion, code, complexity_result)

    # ── Phase 3: refactor (separate Gemini call — runs after Phase 1) ────────
    refactor_result = await _run_in_thread(code_refactor, code)

    # ── Assemble context for main Gemini call ────────────────────────────────
    tool_outputs = {
        "syntax_analysis": syntax_result,
        "complexity_analysis": complexity_result,
        "security_scan": security_result,
        "trace_analysis": trace_result,
        "optimization_suggestion": opt_result,
        "code_refactor": refactor_result,
        "metrics": metrics_result,
    }

    # ── Phase 4: generate the full report via Gemini ─────────────────────────
    report = await _run_in_thread(generate_report, code, tool_outputs)

    # Attach raw tool outputs for transparency / debugging
    report["_tool_outputs"] = tool_outputs

    return report
