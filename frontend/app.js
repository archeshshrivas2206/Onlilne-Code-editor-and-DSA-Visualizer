let editor;

/* -------------------- LOAD MONACO AFTER PAGE LOAD -------------------- */

window.onload = function () {

    require.config({
        paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" }
    });

    require(["vs/editor/editor.main"], function () {

        editor = monaco.editor.create(document.getElementById("editor"), {

            value: `def bubble_sort(arr):

    n = len(arr)

    for i in range(n):
        for j in range(n-1):

            if arr.compare(j, j+1):

                arr[j], arr[j+1] = arr[j+1], arr[j]`,

            language: "python",
            theme: "vs-dark",
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: false }

        });

    });

};


/* -------------------- MODE SWITCHING -------------------- */

function changeMode(mode) {

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

    /* Reset layout to default */
    bars.style.flexDirection = "row";
    bars.style.alignItems = "center";


    /* Hide all sections */
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