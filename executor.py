from observable_array import ObservableArray

def execute_user_code(user_code: str, input_array: list, algorithm: str):
    local_vars = {}

    try:
        exec(user_code, {}, local_vars)

        if algorithm not in local_vars:
            return {"error": f"Function {algorithm} not found"}

        algo_function = local_vars[algorithm]

        observable_arr = ObservableArray(input_array)

        algo_function(observable_arr)

        return {"steps": observable_arr.get_steps()}

    except Exception as e:
        return {"error": str(e)}