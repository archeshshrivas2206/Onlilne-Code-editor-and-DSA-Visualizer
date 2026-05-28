let matrix = [];
let matrixSize = 3;

function initMatrix() {
    if (window.engine) window.engine.stop();
    const sizeSelect = document.getElementById("matrixSize");
    matrixSize = parseInt(sizeSelect ? sizeSelect.value : 3) || 3;

    matrix = [];
    let val = 1;
    for (let r = 0; r < matrixSize; r++) {
        const row = [];
        for (let c = 0; c < matrixSize; c++) {
            row.push(val++);
        }
        matrix.push(row);
    }
    renderMatrixGrid();
    const out = document.getElementById("matrixOutput");
    if (out) out.innerText = "Matrix initialized.";
}

function randomizeMatrix() {
    if (window.engine) window.engine.stop();
    matrix = [];
    for (let r = 0; r < matrixSize; r++) {
        const row = [];
        for (let c = 0; c < matrixSize; c++) {
            row.push(Math.floor(Math.random() * 90) + 10);
        }
        matrix.push(row);
    }
    renderMatrixGrid();
    const out = document.getElementById("matrixOutput");
    if (out) out.innerText = "Randomized matrix values.";
}

function renderMatrixGrid(highlightCells) {
    const container = document.getElementById("bars");
    container.innerHTML = "";

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.gap = "10px";
    container.style.padding = "25px";

    // Matrix Wrapper
    const gridWrapper = document.createElement("div");
    gridWrapper.style.display = "flex";
    gridWrapper.style.flexDirection = "column";
    gridWrapper.style.gap = "8px";
    gridWrapper.style.background = "rgba(255, 255, 255, 0.015)";
    gridWrapper.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    gridWrapper.style.borderRadius = "12px";
    gridWrapper.style.padding = "20px";
    gridWrapper.style.boxShadow = "inset 0 0 30px rgba(255, 255, 255, 0.02)";

    // 1. Column indices header row
    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.gap = "8px";
    headerRow.style.alignItems = "center";

    const cornerSpacer = document.createElement("div");
    cornerSpacer.style.width = "40px";
    cornerSpacer.style.height = "40px";
    headerRow.appendChild(cornerSpacer);

    for (let c = 0; c < matrixSize; c++) {
        const colIdx = document.createElement("div");
        colIdx.style.width = "75px";
        colIdx.style.display = "flex";
        colIdx.style.justifyContent = "center";
        colIdx.style.fontSize = "0.85rem";
        colIdx.style.fontWeight = "bold";
        colIdx.style.color = "rgba(255, 255, 255, 0.35)";
        colIdx.innerText = `c=${c}`;
        headerRow.appendChild(colIdx);
    }
    gridWrapper.appendChild(headerRow);

    // 2. Rows with row indices and cells
    for (let r = 0; r < matrixSize; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.gap = "8px";
        rowDiv.style.alignItems = "center";

        const rowLabel = document.createElement("div");
        rowLabel.style.width = "40px";
        rowLabel.style.display = "flex";
        rowLabel.style.justifyContent = "flex-end";
        rowLabel.style.paddingRight = "8px";
        rowLabel.style.fontSize = "0.85rem";
        rowLabel.style.fontWeight = "bold";
        rowLabel.style.color = "rgba(255, 255, 255, 0.35)";
        rowLabel.innerText = `r=${r}`;
        rowDiv.appendChild(rowLabel);

        for (let c = 0; c < matrixSize; c++) {
            const cellVal = matrix[r][c];
            const cellKey = `${r}_${c}`;

            const cellBox = document.createElement("div");
            cellBox.style.width = "75px";
            cellBox.style.height = "75px";
            cellBox.style.borderRadius = "8px";
            cellBox.style.position = "relative";
            cellBox.style.display = "flex";
            cellBox.style.flexDirection = "column";
            cellBox.style.alignItems = "center";
            cellBox.style.justifyContent = "center";
            cellBox.style.color = "white";
            cellBox.style.transition = "all 0.25s ease";
            
            const coordTag = document.createElement("span");
            coordTag.style.position = "absolute";
            coordTag.style.top = "4px";
            coordTag.style.left = "6px";
            coordTag.style.fontSize = "0.6rem";
            coordTag.style.color = "rgba(255, 255, 255, 0.25)";
            coordTag.innerText = `[${r},${c}]`;
            cellBox.appendChild(coordTag);

            const valText = document.createElement("span");
            valText.style.fontSize = "1.2rem";
            valText.style.fontWeight = "bold";
            valText.innerText = cellVal;
            cellBox.appendChild(valText);

            let highlightState = highlightCells ? highlightCells[cellKey] : null;

            if (highlightState === 'checking') {
                cellBox.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
                cellBox.style.boxShadow = "0 0 15px rgba(245, 158, 11, 0.4)";
                cellBox.style.transform = "scale(1.08)";
                cellBox.style.border = "1px solid rgba(245, 158, 11, 0.6)";
            } else if (highlightState === 'swapped') {
                cellBox.style.background = "linear-gradient(135deg, #10b981, #059669)";
                cellBox.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
                cellBox.style.transform = "scale(1.08)";
                cellBox.style.border = "1px solid rgba(16, 185, 129, 0.6)";
            } else {
                cellBox.style.background = "rgba(30, 41, 59, 0.6)";
                cellBox.style.border = "1px solid rgba(255, 255, 255, 0.08)";
                cellBox.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
            }

            rowDiv.appendChild(cellBox);
        }
        gridWrapper.appendChild(rowDiv);
    }
    container.appendChild(gridWrapper);
}

function animateTranspose() {
    if (window.engine) window.engine.stop();

    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Starting in-place transpose: swapping elements M[r][c] and M[c][r] for c > r."
    });

    for (let r = 0; r < matrixSize; r++) {
        for (let c = r + 1; c < matrixSize; c++) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${c}`] = 'checking';
            checkingHighlights[`${c}_${r}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: checkingHighlights,
                message: `Checking pair to swap: M[${r}][${c}] (${tempMatrix[r][c]}) and M[${c}][${r}] (${tempMatrix[c][r]})`
            });

            const tmp = tempMatrix[r][c];
            tempMatrix[r][c] = tempMatrix[c][r];
            tempMatrix[c][r] = tmp;

            const swappedHighlights = {};
            swappedHighlights[`${r}_${c}`] = 'swapped';
            swappedHighlights[`${c}_${r}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: swappedHighlights,
                message: `Swapped M[${r}][${c}] and M[${c}][${r}] successfully.`
            });
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = tempMatrix.map(row => [...row]);
        renderMatrixGrid();
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = "Transpose completed!";
    });
    window.engine.autoPlay();
}

function animateRotate90() {
    if (window.engine) window.engine.stop();

    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Rotate 90° Clockwise: First, we transpose the matrix (M[r][c] <-> M[c][r])."
    });

    for (let r = 0; r < matrixSize; r++) {
        for (let c = r + 1; c < matrixSize; c++) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${c}`] = 'checking';
            checkingHighlights[`${c}_${r}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: checkingHighlights,
                message: `[Transpose] Swapping M[${r}][${c}] and M[${c}][${r}]`
            });

            const tmp = tempMatrix[r][c];
            tempMatrix[r][c] = tempMatrix[c][r];
            tempMatrix[c][r] = tmp;

            const swappedHighlights = {};
            swappedHighlights[`${r}_${c}`] = 'swapped';
            swappedHighlights[`${c}_${r}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: swappedHighlights,
                message: `[Transpose] Swapped M[${r}][${c}] and M[${c}][${r}]`
            });
        }
    }

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Transpose done! Now, we reverse each row horizontally to complete the clockwise rotation."
    });

    for (let r = 0; r < matrixSize; r++) {
        let left = 0;
        let right = matrixSize - 1;
        while (left < right) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${left}`] = 'checking';
            checkingHighlights[`${r}_${right}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: checkingHighlights,
                message: `[Reverse Row ${r}] Swapping columns M[${r}][${left}] and M[${r}][${right}]`
            });

            const tmp = tempMatrix[r][left];
            tempMatrix[r][left] = tempMatrix[r][right];
            tempMatrix[r][right] = tmp;

            const swappedHighlights = {};
            swappedHighlights[`${r}_${left}`] = 'swapped';
            swappedHighlights[`${r}_${right}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: swappedHighlights,
                message: `[Reverse Row ${r}] Swapped columns M[${r}][${left}] and M[${r}][${right}]`
            });

            left++;
            right--;
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = tempMatrix.map(row => [...row]);
        renderMatrixGrid();
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = "Rotate 90° Clockwise completed!";
    });
    window.engine.autoPlay();
}

function animateMirror() {
    if (window.engine) window.engine.stop();

    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Horizontal Mirror: We reverse elements within each row from the outer columns inward."
    });

    for (let r = 0; r < matrixSize; r++) {
        let left = 0;
        let right = matrixSize - 1;
        while (left < right) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${left}`] = 'checking';
            checkingHighlights[`${r}_${right}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: checkingHighlights,
                message: `[Row ${r}] Swapping columns M[${r}][${left}] and M[${r}][${right}]`
            });

            const tmp = tempMatrix[r][left];
            tempMatrix[r][left] = tempMatrix[r][right];
            tempMatrix[r][right] = tmp;

            const swappedHighlights = {};
            swappedHighlights[`${r}_${left}`] = 'swapped';
            swappedHighlights[`${r}_${right}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: swappedHighlights,
                message: `[Row ${r}] Swapped columns M[${r}][${left}] and M[${r}][${right}]`
            });

            left++;
            right--;
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = tempMatrix.map(row => [...row]);
        renderMatrixGrid();
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = "Horizontal Mirror completed!";
    });
    window.engine.autoPlay();
}

function animateInvert() {
    if (window.engine) window.engine.stop();

    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Inverting values: Negating each cell value M[r][c] = -M[r][c]."
    });

    for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${c}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: checkingHighlights,
                message: `Inverting cell [${r}, ${c}]: negating ${tempMatrix[r][c]}`
            });

            tempMatrix[r][c] = -tempMatrix[r][c];

            const swappedHighlights = {};
            swappedHighlights[`${r}_${c}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: tempMatrix.map(row => [...row]),
                highlights: swappedHighlights,
                message: `Inverted cell [${r}, ${c}] to ${tempMatrix[r][c]}`
            });
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = tempMatrix.map(row => [...row]);
        renderMatrixGrid();
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = "Value inversion completed!";
    });
    window.engine.autoPlay();
}

function renderMatrixStep(step, index, allSteps) {
    const originalMatrix = matrix;
    matrix = step.matrixSnapshot;
    renderMatrixGrid(step.highlights);
    matrix = originalMatrix;

    const outputEl = document.getElementById("matrixOutput");
    if (outputEl) {
        outputEl.innerText = step.message;
    }
}

function loadUserMatrix() {
    if (window.engine) window.engine.stop();
    const inputVal = document.getElementById("matrixInput").value;
    const out = document.getElementById("matrixOutput");
    
    if (!inputVal) {
        if (out) out.innerText = "Please enter comma-separated numbers first.";
        return;
    }

    const parsed = inputVal.split(",")
        .map(v => v.trim())
        .filter(v => v !== "")
        .map(Number)
        .filter(n => !isNaN(n));

    if (parsed.length === 0) {
        if (out) out.innerText = "No valid numbers found in input.";
        return;
    }

    // Auto-detect matrix dimension based on element count
    const count = parsed.length;
    let detectedSize = matrixSize;
    if (count <= 4) {
        detectedSize = 2;
    } else if (count <= 9) {
        detectedSize = 3;
    } else {
        detectedSize = 4;
    }

    const sizeSelect = document.getElementById("matrixSize");
    if (sizeSelect) {
        sizeSelect.value = detectedSize.toString();
    }
    matrixSize = detectedSize;

    matrix = [];
    let idx = 0;
    for (let r = 0; r < matrixSize; r++) {
        const row = [];
        for (let c = 0; c < matrixSize; c++) {
            if (idx < parsed.length) {
                row.push(parsed[idx++]);
            } else {
                row.push(0);
            }
        }
        matrix.push(row);
    }

    renderMatrixGrid();
    if (out) out.innerText = `Loaded custom ${matrixSize}x${matrixSize} matrix!`;
}

window.initMatrix = initMatrix;
window.randomizeMatrix = randomizeMatrix;
window.animateTranspose = animateTranspose;
window.animateRotate90 = animateRotate90;
window.animateMirror = animateMirror;
window.animateInvert = animateInvert;
window.loadUserMatrix = loadUserMatrix;
