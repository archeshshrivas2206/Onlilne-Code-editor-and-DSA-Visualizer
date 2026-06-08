"""
metrics.py — Code quality metrics: line count, nesting depth, naming conventions.
"""
import ast
import re


def analyze_metrics(code: str) -> dict:
    """Return code quality metrics for the submitted code string."""
    lines = code.splitlines()
    total_lines = len(lines)
    blank_lines = sum(1 for l in lines if l.strip() == "")
    comment_lines = sum(1 for l in lines if l.strip().startswith("#"))
    code_lines = total_lines - blank_lines - comment_lines

    # Naming convention check
    naming_issues = _check_naming(code)

    # Max nesting depth (all block types)
    max_indent = _max_indent_depth(lines)

    # Average function length
    avg_fn_len = _avg_function_length(code)

    return {
        "total_lines": total_lines,
        "code_lines": code_lines,
        "comment_lines": comment_lines,
        "blank_lines": blank_lines,
        "max_nesting_depth": max_indent,
        "avg_function_length": avg_fn_len,
        "naming_issues": naming_issues,
        "has_docstrings": '"""' in code or "'''" in code,
    }


def _check_naming(code: str) -> list:
    """Detect non-snake_case variable/function names (PEP 8)."""
    issues = []
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return issues

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if not re.match(r'^[a-z_][a-z0-9_]*$', node.name):
                issues.append(f"Function '{node.name}' should be snake_case (line {node.lineno})")
        elif isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for t in targets:
                if isinstance(t, ast.Name):
                    name = t.id
                    # Skip common constants (ALL_CAPS)
                    if name.isupper():
                        continue
                    if not re.match(r'^[a-z_][a-z0-9_]*$', name):
                        issues.append(f"Variable '{name}' should be snake_case (line {node.lineno})")
    return issues[:5]  # cap at 5 to keep report concise


def _max_indent_depth(lines: list) -> int:
    """Approximate nesting depth by measuring indentation levels."""
    max_depth = 0
    for line in lines:
        if line.strip() == "":
            continue
        spaces = len(line) - len(line.lstrip())
        depth = spaces // 4
        max_depth = max(max_depth, depth)
    return max_depth


def _avg_function_length(code: str) -> float:
    """Average number of lines per function definition."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return 0.0

    lengths = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            end = getattr(node, 'end_lineno', node.lineno)
            lengths.append(end - node.lineno + 1)

    return round(sum(lengths) / len(lengths), 1) if lengths else 0.0
