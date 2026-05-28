import sys
import io
import traceback
from observable_array import ObservableArray


def execute_user_code(user_code: str, input_array: list, algorithm: str):

    local_vars = {}
    captured_output = io.StringIO()

    try:

        import ast
        
        # Redirect stdout to capture print() calls
        old_stdout = sys.stdout
        sys.stdout = captured_output
        
        # Unified scope so sibling functions (and recursive calls) can look each other up
        exec_scope = {
            "print": print,
            "len": len,
            "range": range,
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,
            "list": list,
            "dict": dict,
            "set": set,
            "min": min,
            "max": max,
            "abs": abs
        }
        exec(user_code, exec_scope)
        local_vars = exec_scope

        actual_algo_name = algorithm
        
        # Fallback to dynamic detection if provided name not matched
        if not algorithm or algorithm not in local_vars:
            try:
                tree = ast.parse(user_code)
                # Find all function definitions at the module root
                fns = [n.name for n in tree.body if isinstance(n, ast.FunctionDef)]
                if fns:
                    actual_algo_name = fns[-1] # conventionally the entry point
            except Exception:
                pass # In case parsing fails fallback to old check below

        if not actual_algo_name or actual_algo_name not in local_vars:
            return {"error": "Entry function could not be auto-detected. Please define a function."}

        algo_function = local_vars[actual_algo_name]

        observable_arr = ObservableArray(input_array)

        # ---- TRACE FUNCTION ----
        def trace_lines(frame, event, arg):

            if event == "line":
                if frame.f_code.co_filename == "<string>":
                    lineno = frame.f_lineno
                    # Capture primitives
                    vars_snapshot = {k: v for k, v in frame.f_locals.items() if isinstance(v, (int, float, str, bool))}
                    
                    observable_arr.steps.append({
                        "array": observable_arr.arr.copy(),
                        "swap": None,
                        "compare": None,
                        "line": lineno,
                        "variables": vars_snapshot
                    })

            return trace_lines

        # Start tracing
        sys.settrace(trace_lines)

        # Run algorithm
        algo_function(observable_arr)

        # Stop tracing & restore stdout
        sys.settrace(None)
        sys.stdout = old_stdout

        return {
            "steps": observable_arr.get_steps(),
            "console_output": captured_output.getvalue()
        }

    except SyntaxError as e:
        sys.settrace(None)
        sys.stdout = old_stdout
        return {
            "error": str(e),
            "error_line": e.lineno,
            "error_type": "SyntaxError",
            "console_output": captured_output.getvalue()
        }
    except Exception as e:
        sys.settrace(None)
        sys.stdout = old_stdout
        # Try to extract line number from traceback
        error_line = None
        tb = traceback.extract_tb(e.__traceback__)
        for frame in reversed(tb):
            if frame.filename == "<string>":
                error_line = frame.lineno
                break
        
        return {
            "error": str(e),
            "error_line": error_line,
            "error_type": type(e).__name__,
            "console_output": captured_output.getvalue()
        }