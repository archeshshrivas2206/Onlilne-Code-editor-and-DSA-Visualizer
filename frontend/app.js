let editor;
let currentLineDecoration = [];

/* -------------------- ALGORITHM TEMPLATES BANK -------------------- */
const ALGO_TEMPLATES = {
    bubble_sort: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            # Check if adjacent elements need swapping
            if arr.compare(j, j + 1):
                arr[j], arr[j+1] = arr[j+1], arr[j]`,

    selection_sort: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            # Look for the minimum value dynamically
            if arr.compare(min_idx, j):
                min_idx = j
        # Perform persistent swap if found
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,

    insertion_sort: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        j = i
        while j > 0 and arr.compare(j-1, j):
            arr[j-1], arr[j] = arr[j], arr[j-1]
            j -= 1`,

    quick_sort: `def quick_sort(arr):
    # Entry wrapper for auto-detect
    recursive_quick(arr, 0, len(arr) - 1)

def recursive_quick(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        recursive_quick(arr, low, pi - 1)
        recursive_quick(arr, pi + 1, high)

def partition(arr, low, high):
    pivot_idx = high
    i = low - 1
    for j in range(low, high):
        if arr.compare(pivot_idx, j):
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,

    merge_sort: `def merge_sort(arr):
    # In-place merge sort using ObservableArray
    merge_sort_range(arr, 0, len(arr) - 1)

def merge_sort_range(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort_range(arr, left, mid)
        merge_sort_range(arr, mid + 1, right)
        merge(arr, left, mid, right)

def merge(arr, left, mid, right):
    # Copy values to temp arrays
    left_vals = [arr[i] for i in range(left, mid + 1)]
    right_vals = [arr[j] for j in range(mid + 1, right + 1)]
    i = 0
    j = 0
    k = left
    while i < len(left_vals) and j < len(right_vals):
        if left_vals[i] <= right_vals[j]:
            arr[k] = left_vals[i]
            i += 1
        else:
            arr[k] = right_vals[j]
            j += 1
        k += 1
    while i < len(left_vals):
        arr[k] = left_vals[i]
        i += 1
        k += 1
    while j < len(right_vals):
        arr[k] = right_vals[j]
        j += 1
        k += 1`,

    heap_sort: `def heap_sort(arr):
    n = len(arr)
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr.compare(left, largest):
        largest = left
    if right < n and arr.compare(right, largest):
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`
};

/* -------------------- LOAD MONACO AFTER PAGE LOAD -------------------- */

window.onload = function () {

    require.config({
        paths: { vs: "./node_modules/monaco-editor/min/vs" }
    });

    require(["vs/editor/editor.main"], function () {

        editor = monaco.editor.create(document.getElementById("editor"), {
            value: ALGO_TEMPLATES.bubble_sort,
            language: "python",
            theme: "vs",
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });

        // Initialize Global Playback Engine
        if (window.engine) {
            window.engine.init();
        }

    });

};


/* -------------------- MONACO LINE HIGHLIGHT -------------------- */

function highlightLine(lineNumber) {

    if (!editor) return;

    currentLineDecoration = editor.deltaDecorations(
        currentLineDecoration,
        [
            {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: "executingLine"
                }
            }
        ]
    );
}


/* -------------------- MODE SWITCHING -------------------- */

function changeMode(mode, element) {

    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    const sortingSection = document.getElementById("sortingSection");
    const stackSection = document.getElementById("stackControls");
    const queueSection = document.getElementById("queueControls");
    const linkedListSection = document.getElementById("linkedListControls");
    const treeSection = document.getElementById("treeControls");
    const treeTraversalSection = document.getElementById("treeTraversalControls");
    const graphSection = document.getElementById("graphControls");
    const matrixSection = document.getElementById("matrixControls");

    const bars = document.getElementById("bars");

    /* Stop any active global playback */
    if (window.engine) window.engine.stop();

    /* Clear visualization */
    bars.innerHTML = "";
    document.getElementById("variableWatch").innerHTML = "";

    /* Reset layout */
    bars.style.flexDirection = "row";
    bars.style.alignItems = "center";

    /* Hide everything */
    sortingSection.style.display = "none";
    stackSection.style.display = "none";
    queueSection.style.display = "none";
    linkedListSection.style.display = "none";
    treeSection.style.display = "none";
    treeTraversalSection.style.display = "none";
    graphSection.style.display = "none";
    if (matrixSection) matrixSection.style.display = "none";

    /* Activate selected mode */

    if (mode === "sorting") {

        sortingSection.style.display = "block";

        bars.style.flexDirection = "row";
        bars.style.alignItems = "flex-end";

    }

    else if (mode === "stack") {

        stackSection.style.display = "block";

        bars.style.flexDirection = "column-reverse";
        bars.style.alignItems = "center";

    }

    else if (mode === "queue") {

        queueSection.style.display = "block";

        bars.style.flexDirection = "row";
        bars.style.alignItems = "center";

    }

    else if (mode === "linkedlist") {

        linkedListSection.style.display = "block";

        bars.style.display = "flex";
        bars.style.flexDirection = "row";
        bars.style.alignItems = "center";
        bars.style.justifyContent = "center";

    }

    else if (mode === "tree") {

        treeSection.style.display = "block";
        treeTraversalSection.style.display = "block";

        bars.style.flexDirection = "column";
        bars.style.alignItems = "center";

    }

    else if (mode === "graph") {

        graphSection.style.display = "block";

        bars.style.flexDirection = "row";
        bars.style.alignItems = "center";

    }

    else if (mode === "matrix") {

        if (matrixSection) matrixSection.style.display = "block";

        bars.style.display = "flex";
        bars.style.flexDirection = "column";
        bars.style.alignItems = "center";
        bars.style.justifyContent = "center";

        if (window.initMatrix) {
            window.initMatrix();
        }

    }

}

/* -------------------- TEMPLATE INJECTION -------------------- */
function loadTemplate(key) {
    if (!editor) return;
    
    const code = ALGO_TEMPLATES[key];
    if (code) {
        // Smoothly swap the model content
        editor.setValue(code);
    }
}