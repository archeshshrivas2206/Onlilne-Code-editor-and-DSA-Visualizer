class ObservableArray:
    def __init__(self, arr):
        self.arr = arr
        self.steps = [{
            "array": arr.copy(),
            "swap": None
        }]

    def __getitem__(self, index):
        return self.arr[index]

    def __setitem__(self, index, value):
        old_value = self.arr[index]
        self.arr[index] = value

        self.steps.append({
            "array": self.arr.copy(),
            "swap": index
        })

    def __len__(self):
        return len(self.arr)

    def get_steps(self):
        return self.steps