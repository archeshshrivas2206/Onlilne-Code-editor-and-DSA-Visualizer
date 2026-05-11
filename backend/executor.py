import sys
from observable_array import ObservableArray


def execute_user_code(user_code: str, input_array: list, algorithm: str):

    local_vars = {}

    try:

        exec(user_code, {}, local_vars)

        if algorithm not in local_vars:
            return {"error": f"Function {algorithm} not found"}

        algo_function = local_vars[algorithm]

        observable_arr = ObservableArray(input_array)

        # ---- TRACE FUNCTION ----
        def trace_lines(frame, event, arg):

            if event == "line":
                if frame.f_code.co_filename == "<string>":
                    lineno = frame.f_lineno
                    observable_arr.steps.append({
                        "array": observable_arr.arr.copy(),
                        "swap": None,
                        "compare": None,
                        "line": lineno
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