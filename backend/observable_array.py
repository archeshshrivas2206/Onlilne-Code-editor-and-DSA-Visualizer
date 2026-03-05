class ObservableArray:

    def __init__(self, arr):
        self.arr = arr

        self.steps = [{
            "array": arr.copy(),
            "swap": None,
            "compare": None
        }]

    def __getitem__(self, index):
        return self.arr[index]

    def __setitem__(self, index, value):

        self.arr[index] = value

        self.steps.append({
            "array": self.arr.copy(),
            "swap": index,
            "compare": None
        })

    def compare(self, i, j):

        self.steps.append({
            "array": self.arr.copy(),
            "swap": None,
            "compare": [i, j]
        })

        return self.arr[i] > self.arr[j]

    def __len__(self):
        return len(self.arr)

    def get_steps(self):
        return self.steps