let matrix = [];
let matrixRows = 3;
let matrixCols = 3;

function initMatrix() {
    if (window.engine) window.engine.stop();
    const rowsSelect = document.getElementById("matrixRows");
    const colsSelect = document.getElementById("matrixCols");
    
    let rVal = parseInt(rowsSelect ? rowsSelect.value : 3) || 3;
    let cVal = parseInt(colsSelect ? colsSelect.value : 3) || 3;
    
    // Clamp matrix dimensions between 1 and 8
    matrixRows = Math.max(1, Math.min(8, rVal));
    matrixCols = Math.max(1, Math.min(8, cVal));
    
    if (rowsSelect) rowsSelect.value = matrixRows.toString();
    if (colsSelect) colsSelect.value = matrixCols.toString();

    matrix = [];
    let val = 1;
    for (let r = 0; r < matrixRows; r++) {
        const row = [];
        for (let c = 0; c < matrixCols; c++) {
            row.push(val++);
        }
        matrix.push(row);
    }
    renderMatrixGrid();
    const out = document.getElementById("matrixOutput");
    if (out) out.innerText = `Matrix initialized (${matrixRows}x${matrixCols}).`;
}

function randomizeMatrix() {
    if (window.engine) window.engine.stop();
    matrix = [];
    for (let r = 0; r < matrixRows; r++) {
        const row = [];
        for (let c = 0; c < matrixCols; c++) {
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

    if (!matrix || matrix.length === 0) return;

    const rows = matrix.length;
    const cols = matrix[0].length;

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
    gridWrapper.style.background = "rgba(255, 255, 255, 0.015)";
    gridWrapper.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    gridWrapper.style.borderRadius = "12px";
    gridWrapper.style.padding = "20px";
    gridWrapper.style.boxShadow = "inset 0 0 30px rgba(255, 255, 255, 0.02)";

    // Compute cell dimensions dynamically based on max(rows, cols) to fit screen beautifully
    const maxDim = Math.max(rows, cols);
    const cellSize = maxDim <= 3 ? 75 : (maxDim === 4 ? 60 : (maxDim <= 6 ? 45 : 38));
    const valFontSize = maxDim <= 3 ? "1.2rem" : (maxDim === 4 ? "1.0rem" : (maxDim <= 6 ? "0.85rem" : "0.75rem"));
    const coordFontSize = maxDim <= 3 ? "0.6rem" : (maxDim === 4 ? "0.55rem" : "0.45rem");
    const gapSize = maxDim <= 4 ? "8px" : "4px";

    gridWrapper.style.gap = gapSize;

    // 1. Column indices header row
    const headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.gap = gapSize;
    headerRow.style.alignItems = "center";

    const cornerSpacer = document.createElement("div");
    cornerSpacer.style.width = "40px";
    cornerSpacer.style.height = `${cellSize}px`;
    headerRow.appendChild(cornerSpacer);

    for (let c = 0; c < cols; c++) {
        const colIdx = document.createElement("div");
        colIdx.style.width = `${cellSize}px`;
        colIdx.style.display = "flex";
        colIdx.style.justifyContent = "center";
        colIdx.style.fontSize = maxDim <= 5 ? "0.85rem" : "0.7rem";
        colIdx.style.fontWeight = "bold";
        colIdx.style.color = "rgba(255, 255, 255, 0.35)";
        colIdx.innerText = `c=${c}`;
        headerRow.appendChild(colIdx);
    }
    gridWrapper.appendChild(headerRow);

    // 2. Rows with row indices and cells
    for (let r = 0; r < rows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.style.display = "flex";
        rowDiv.style.gap = gapSize;
        rowDiv.style.alignItems = "center";

        const rowLabel = document.createElement("div");
        rowLabel.style.width = "40px";
        rowLabel.style.display = "flex";
        rowLabel.style.justifyContent = "flex-end";
        rowLabel.style.paddingRight = "8px";
        rowLabel.style.fontSize = maxDim <= 5 ? "0.85rem" : "0.7rem";
        rowLabel.style.fontWeight = "bold";
        rowLabel.style.color = "rgba(255, 255, 255, 0.35)";
        rowLabel.innerText = `r=${r}`;
        rowDiv.appendChild(rowLabel);

        for (let c = 0; c < cols; c++) {
            const cellVal = matrix[r][c];
            const cellKey = `${r}_${c}`;

            const cellBox = document.createElement("div");
            cellBox.style.width = `${cellSize}px`;
            cellBox.style.height = `${cellSize}px`;
            cellBox.style.borderRadius = maxDim <= 5 ? "8px" : "4px";
            cellBox.style.position = "relative";
            cellBox.style.display = "flex";
            cellBox.style.flexDirection = "column";
            cellBox.style.alignItems = "center";
            cellBox.style.justifyContent = "center";
            cellBox.style.color = "white";
            cellBox.style.transition = "all 0.2s ease";
            
            // Only draw coordinate tag if cell size permits
            if (cellSize >= 45) {
                const coordTag = document.createElement("span");
                coordTag.style.position = "absolute";
                coordTag.style.top = "4px";
                coordTag.style.left = "6px";
                coordTag.style.fontSize = coordFontSize;
                coordTag.style.color = "rgba(255, 255, 255, 0.25)";
                coordTag.innerText = `[${r},${c}]`;
                cellBox.appendChild(coordTag);
            }

            const valText = document.createElement("span");
            valText.style.fontSize = valFontSize;
            valText.style.fontWeight = "bold";
            valText.innerText = cellVal;
            cellBox.appendChild(valText);

            let highlightState = highlightCells ? highlightCells[cellKey] : null;

            if (highlightState === 'checking') {
                cellBox.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
                cellBox.style.boxShadow = "0 0 15px rgba(245, 158, 11, 0.4)";
                cellBox.style.transform = "scale(1.08)";
                cellBox.style.border = "1px solid rgba(245, 158, 11, 0.6)";
                cellBox.style.zIndex = "10";
            } else if (highlightState === 'swapped') {
                cellBox.style.background = "linear-gradient(135deg, #10b981, #059669)";
                cellBox.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.4)";
                cellBox.style.transform = "scale(1.08)";
                cellBox.style.border = "1px solid rgba(16, 185, 129, 0.6)";
                cellBox.style.zIndex = "10";
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
    const origRows = matrix.length;
    const origCols = matrix[0].length;

    // Create an empty target matrix of size Cols x Rows
    let targetMatrix = [];
    for (let c = 0; c < origCols; c++) {
        const row = [];
        for (let r = 0; r < origRows; r++) {
            row.push(0);
        }
        targetMatrix.push(row);
    }

    // Step 1: Initial state
    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: matrix.map(row => [...row]),
        highlights: {},
        message: `Starting Transpose: converting ${origRows}x${origCols} matrix to a transposed ${origCols}x${origRows} structure.`
    });

    let currentTarget = targetMatrix.map(row => [...row]);

    for (let r = 0; r < origRows; r++) {
        for (let c = 0; c < origCols; c++) {
            const origHighlights = {};
            origHighlights[`${r}_${c}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: matrix.map(row => [...row]),
                highlights: origHighlights,
                message: `[Transpose] Reading element M[${r}][${c}] = ${matrix[r][c]}`
            });

            currentTarget[c][r] = matrix[r][c];

            const targetHighlights = {};
            targetHighlights[`${c}_${r}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: currentTarget.map(row => [...row]),
                highlights: targetHighlights,
                message: `[Transpose] Placed M[${r}][${c}] (${matrix[r][c]}) into transposed position M'[${c}][${r}]`
            });
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = currentTarget.map(row => [...row]);
        matrixRows = origCols;
        matrixCols = origRows;
        renderMatrixGrid();
        
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = `Transpose completed! Size is now ${matrixRows}x${matrixCols}.`;

        const rInput = document.getElementById("matrixRows");
        const cInput = document.getElementById("matrixCols");
        if (rInput) rInput.value = matrixRows.toString();
        if (cInput) cInput.value = matrixCols.toString();
    });
    window.engine.autoPlay();
}

function animateRotate90() {
    if (window.engine) window.engine.stop();

    const steps = [];
    const origRows = matrix.length;
    const origCols = matrix[0].length;

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: matrix.map(row => [...row]),
        highlights: {},
        message: `Rotate 90° Clockwise: First, we transpose the ${origRows}x${origCols} matrix to a ${origCols}x${origRows} structure.`
    });

    let currentTarget = [];
    for (let c = 0; c < origCols; c++) {
        const row = [];
        for (let r = 0; r < origRows; r++) {
            row.push(0);
        }
        currentTarget.push(row);
    }

    // 1. Transpose stepsnapshots
    for (let r = 0; r < origRows; r++) {
        for (let c = 0; c < origCols; c++) {
            const origHighlights = {};
            origHighlights[`${r}_${c}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: matrix.map(row => [...row]),
                highlights: origHighlights,
                message: `[Transpose Phase] Reading element M[${r}][${c}] = ${matrix[r][c]}`
            });

            currentTarget[c][r] = matrix[r][c];

            const targetHighlights = {};
            targetHighlights[`${c}_${r}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: currentTarget.map(row => [...row]),
                highlights: targetHighlights,
                message: `[Transpose Phase] Placed M[${r}][${c}] into M'[${c}][${r}]`
            });
        }
    }

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: currentTarget.map(row => [...row]),
        highlights: {},
        message: "Transpose completed! Now, we reverse each row horizontally to complete the clockwise rotation."
    });

    // 2. Reverse each row of transposed grid
    const tempRows = origCols;
    const tempCols = origRows;

    for (let r = 0; r < tempRows; r++) {
        let left = 0;
        let right = tempCols - 1;
        while (left < right) {
            const checkingHighlights = {};
            checkingHighlights[`${r}_${left}`] = 'checking';
            checkingHighlights[`${r}_${right}`] = 'checking';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: currentTarget.map(row => [...row]),
                highlights: checkingHighlights,
                message: `[Reverse Row ${r}] Swapping columns M[${r}][${left}] and M[${r}][${right}]`
            });

            const tmp = currentTarget[r][left];
            currentTarget[r][left] = currentTarget[r][right];
            currentTarget[r][right] = tmp;

            const swappedHighlights = {};
            swappedHighlights[`${r}_${left}`] = 'swapped';
            swappedHighlights[`${r}_${right}`] = 'swapped';

            steps.push({
                type: 'matrix_frame',
                matrixSnapshot: currentTarget.map(row => [...row]),
                highlights: swappedHighlights,
                message: `[Reverse Row ${r}] Swapped columns M[${r}][${left}] and M[${r}][${right}]`
            });

            left++;
            right--;
        }
    }

    window.engine.load(steps, renderMatrixStep, () => {
        matrix = currentTarget.map(row => [...row]);
        matrixRows = origCols;
        matrixCols = origRows;
        renderMatrixGrid();
        
        const out = document.getElementById("matrixOutput");
        if (out) out.innerText = `Rotate 90° Clockwise completed! Size is now ${matrixRows}x${matrixCols}.`;

        const rInput = document.getElementById("matrixRows");
        const cInput = document.getElementById("matrixCols");
        if (rInput) rInput.value = matrixRows.toString();
        if (cInput) cInput.value = matrixCols.toString();
    });
    window.engine.autoPlay();
}

function animateMirror() {
    if (window.engine) window.engine.stop();

    const steps = [];
    let tempMatrix = matrix.map(row => [...row]);
    const rows = tempMatrix.length;
    const cols = tempMatrix[0].length;

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Horizontal Mirror: We reverse elements within each row from the outer columns inward."
    });

    for (let r = 0; r < rows; r++) {
        let left = 0;
        let right = cols - 1;
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
    const rows = tempMatrix.length;
    const cols = tempMatrix[0].length;

    steps.push({
        type: 'matrix_frame',
        matrixSnapshot: tempMatrix.map(row => [...row]),
        highlights: {},
        message: "Inverting values: Negating each cell value M[r][c] = -M[r][c]."
    });

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
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

    // Auto-detect matrix dimension Cols based on Rows select value and element count
    const count = parsed.length;
    matrixCols = Math.max(1, Math.min(8, Math.ceil(count / matrixRows)));

    const colsSelect = document.getElementById("matrixCols");
    if (colsSelect) {
        colsSelect.value = matrixCols.toString();
    }

    matrix = [];
    let idx = 0;
    for (let r = 0; r < matrixRows; r++) {
        const row = [];
        for (let c = 0; c < matrixCols; c++) {
            if (idx < parsed.length) {
                row.push(parsed[idx++]);
            } else {
                row.push(0);
            }
        }
        matrix.push(row);
    }

    renderMatrixGrid();
    if (out) out.innerText = `Loaded custom ${matrixRows}x${matrixCols} matrix!`;
}

window.initMatrix = initMatrix;
window.randomizeMatrix = randomizeMatrix;
window.animateTranspose = animateTranspose;
window.animateRotate90 = animateRotate90;
window.animateMirror = animateMirror;
window.animateInvert = animateInvert;
window.loadUserMatrix = loadUserMatrix;
