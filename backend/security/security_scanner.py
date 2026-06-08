"""
security_scanner.py — Runs Bandit and Ruff on submitted code via subprocess.
"""
import subprocess
import tempfile
import os
import json


def run_ruff(code: str) -> list:
    """
    Write code to a temp file, run Ruff, return list of lint findings.
    Each finding: { rule, message, line, col }
    """
    findings = []
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            ["ruff", "check", "--output-format=json", tmp_path],
            capture_output=True,
            text=True,
            timeout=15,
        )

        if result.stdout.strip():
            data = json.loads(result.stdout)
            for item in data:
                findings.append({
                    "rule": item.get("code", ""),
                    "message": item.get("message", ""),
                    "line": item.get("location", {}).get("row", None),
                    "col": item.get("location", {}).get("column", None),
                })
    except FileNotFoundError:
        findings.append({"rule": "TOOL_MISSING", "message": "Ruff is not installed.", "line": None, "col": None})
    except subprocess.TimeoutExpired:
        findings.append({"rule": "TIMEOUT", "message": "Ruff timed out.", "line": None, "col": None})
    except Exception as e:
        findings.append({"rule": "ERROR", "message": str(e), "line": None, "col": None})
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    return findings


def run_bandit(code: str) -> list:
    """
    Write code to a temp file, run Bandit, return list of security issues.
    Each issue: { issue, severity, confidence, line }
    """
    issues = []
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, encoding="utf-8"
        ) as f:
            f.write(code)
            tmp_path = f.name

        result = subprocess.run(
            ["bandit", "-f", "json", "-q", tmp_path],
            capture_output=True,
            text=True,
            timeout=15,
        )

        # Bandit returns exit code 1 when issues found — that's fine
        output = result.stdout.strip() or result.stderr.strip()
        if output:
            data = json.loads(output)
            for item in data.get("results", []):
                issues.append({
                    "issue": item.get("issue_text", ""),
                    "severity": item.get("issue_severity", "LOW"),
                    "confidence": item.get("issue_confidence", "LOW"),
                    "line": item.get("line_number", None),
                    "test_id": item.get("test_id", ""),
                })
    except FileNotFoundError:
        issues.append({"issue": "Bandit is not installed.", "severity": "LOW", "confidence": "HIGH", "line": None, "test_id": "TOOL_MISSING"})
    except subprocess.TimeoutExpired:
        issues.append({"issue": "Bandit timed out.", "severity": "LOW", "confidence": "HIGH", "line": None, "test_id": "TIMEOUT"})
    except Exception as e:
        issues.append({"issue": str(e), "severity": "LOW", "confidence": "LOW", "line": None, "test_id": "ERROR"})
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except Exception:
                pass

    return issues
