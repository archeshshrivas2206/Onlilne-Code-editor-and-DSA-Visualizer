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
    return i + 1`
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
            theme: "vs-dark",
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }
        });

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

    const bars = document.getElementById("bars");

    /* Clear visualization */
    bars.innerHTML = "";

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