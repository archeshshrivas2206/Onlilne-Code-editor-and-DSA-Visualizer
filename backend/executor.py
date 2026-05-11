import sys
from observable_array import ObservableArray


def execute_user_code(user_code: str, input_array: list, algorithm: str):

    local_vars = {}

    try:

        import ast
        
        exec(user_code, {}, local_vars)

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

        # Stop tracing
        sys.settrace(None)

        return {"steps": observable_arr.get_steps()}

    except Exception as e:
        return {"error": str(e)}