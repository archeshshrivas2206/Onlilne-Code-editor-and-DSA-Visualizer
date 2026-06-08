"""
complexity.py — AST-based time & space complexity estimator.
"""
import ast


def analyze_complexity(code: str) -> dict:
    """Parse code and infer Big-O complexity from loop nesting and recursion."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {
            "time_complexity": "Unknown",
            "space_complexity": "Unknown",
            "explanation": f"Could not parse code: {e}",
            "nested_loop_depth": 0,
            "has_recursion": False,
        }

    # --- detect recursion (direct self-calls) ---
    func_names = {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)}
    has_recursion = False
    for func_def in ast.walk(tree):
        if not isinstance(func_def, ast.FunctionDef):
            continue
        for node in ast.walk(func_def):
            if isinstance(node, ast.Call):
                name = None
                if isinstance(node.func, ast.Name):
                    name = node.func.id
                elif isinstance(node.func, ast.Attribute):
                    name = node.func.attr
                if name and name in func_names and name != func_def.name:
                    has_recursion = True
                elif name and name == func_def.name:
                    has_recursion = True

    # --- detect max loop nesting depth ---
    max_depth = _max_loop_depth(tree)

    # --- infer time complexity ---
    if max_depth >= 3:
        time_c = "O(n³)"
        time_exp = "Triple-nested loops detected — cubic time complexity."
    elif max_depth == 2:
        time_c = "O(n²)"
        time_exp = "Double-nested loops detected — quadratic time complexity."
    elif max_depth == 1:
        time_c = "O(n log n) or O(n)"
        time_exp = "Single loop detected. If divide-and-conquer, O(n log n); otherwise O(n)."
    else:
        time_c = "O(1) or O(log n)"
        time_exp = "No loops found. Constant or logarithmic time complexity."

    # --- infer space complexity ---
    if has_recursion:
        space_c = "O(log n) to O(n)"
        space_exp = "Recursive calls detected — stack frames consume auxiliary space."
    elif max_depth >= 2:
        space_c = "O(n)"
        space_exp = "Nested loops suggest linear auxiliary storage possible."
    else:
        space_c = "O(1)"
        space_exp = "No recursion and minimal loops — likely in-place, constant space."

    return {
        "time_complexity": time_c,
        "space_complexity": space_c,
        "explanation": f"{time_exp} {space_exp}",
        "nested_loop_depth": max_depth,
        "has_recursion": has_recursion,
    }


def _max_loop_depth(node, current=0) -> int:
    """Recursively find the deepest nesting level of for/while loops."""
    if isinstance(node, (ast.For, ast.While)):
        current += 1
    max_d = current
    for child in ast.iter_child_nodes(node):
        max_d = max(max_d, _max_loop_depth(child, current))
    return max_d
