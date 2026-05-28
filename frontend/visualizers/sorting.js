let lastKnownVariables = {};
let errorDecorations = [];

async function runCode() {
    // Stop any ongoing engine playback
    if (window.engine) window.engine.stop();
    
    // Clear previous errors
    clearEditorErrors();

    const code = editor ? editor.getValue() : "";
    const inputStr = document.getElementById("arrayInput").value.trim();
    
    if (!inputStr) {
        alert("Please enter numbers for the array input.");
        return;
    }

    const arrayInput = inputStr.split(",").map(num => Number(num.trim())).filter(val => !isNaN(val));

    const algorithm = document.getElementById("algorithm").value;

    try {
        const response = await fetch("http://127.0.0.1:8000/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: code,
                input_array: arrayInput,
                algorithm: algorithm
            })
        });

        const data = await response.json();

        if (data.error) {
            showEditorError(data.error, data.error_line, data.error_type);
            showConsoleOutput(data.console_output);
            return;
        }

        // Show console output if any
        showConsoleOutput(data.console_output);

        const steps = data.steps || [];
        lastKnownVariables = {};
        document.getElementById("variableWatch").innerHTML = "";

        if (steps.length === 0) {
            alert("No steps returned from execution.");
            return;
        }

        // Load steps into the global engine with our sorting-specific render function
        window.engine.load(steps, renderSortingStep);
        window.engine.autoPlay();

    } catch (err) {
        console.error("Failed to run code:", err);
        showEditorError("Network error: Could not connect to backend server.", null, "ConnectionError");
    }
}

/**
 * Display an error inline in Monaco editor with red squiggles + a toast banner.
 */
function showEditorError(message, line, errorType) {
    if (!editor) {
        alert(message);
        return;
    }
    
    // Add Monaco marker (red squiggly underline)
    if (line) {
        const model = editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'python-errors', [{
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: model.getLineMaxColumn(line),
                message: `${errorType || 'Error'}: ${message}`,
                severity: monaco.MarkerSeverity.Error
            }]);
        }

        // Also add a red line decoration
        errorDecorations = editor.deltaDecorations(errorDecorations, [{
            range: new monaco.Range(line, 1, line, 1),
            options: {
                isWholeLine: true,
                className: 'errorLine',
                glyphMarginClassName: 'errorGlyph'
            }
        }]);

        // Scroll to the error line
        editor.revealLineInCenter(line);
    }

    // Show error toast
    let toast = document.getElementById('errorToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'errorToast';
        toast.className = 'error-toast';
        const editorContainer = document.querySelector('.editor-container');
        if (editorContainer) {
            editorContainer.parentNode.insertBefore(toast, editorContainer.nextSibling);
        } else {
            document.body.appendChild(toast);
        }
    }
    
    toast.innerHTML = `
        <div class="error-toast-header">
            <span class="error-badge">${errorType || 'Error'}</span>
            <button class="error-dismiss" onclick="clearEditorErrors()">✕</button>
        </div>
        <pre class="error-message">${message}</pre>
        ${line ? `<span class="error-location">Line ${line}</span>` : ''}
    `;
    toast.style.display = 'block';
}

/**
 * Clear all error markers, decorations, and toast from the editor.
 */
function clearEditorErrors() {
    if (editor) {
        const model = editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'python-errors', []);
        }
        errorDecorations = editor.deltaDecorations(errorDecorations, []);
    }
    
    const toast = document.getElementById('errorToast');
    if (toast) toast.style.display = 'none';
}

/**
 * Sorting-specific step renderer.
 * Called by the global engine for each frame.
 */
function renderSortingStep(step, index, allSteps) {
    // Sync line highlight in Monaco
    if (step.line && typeof highlightLine === "function") {
        highlightLine(step.line);
    }

    // Sync Variable Tracking Display
    if (step.variables) {
        lastKnownVariables = { ...lastKnownVariables, ...step.variables };
        renderVariablesPanel();
    }

    // Render Visual Bars
    const container = document.getElementById("bars");
    if (!container) return;
    
    container.innerHTML = "";

    const arr = step.array || [];
    const maxValue = Math.max(...arr, 1);

    const stageHeight = container.clientHeight || 400;
    const availableHeight = stageHeight - 60;

    arr.forEach((val, idx) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        
        bar.innerText = val;

        const hPct = (val / maxValue) * availableHeight;
        bar.style.height = Math.max(hPct, 25) + "px";

        let isSwap = (step.swap === idx);
        let isCompare = (step.compare && step.compare.includes(idx));

        if (isSwap) {
            bar.style.background = "linear-gradient(to top, #ef4444, #b91c1c)";
            bar.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.6)";
            bar.style.transform = "translateY(-4px)";
        } else if (isCompare) {
            bar.style.background = "linear-gradient(to top, #f59e0b, #d97706)";
            bar.style.boxShadow = "0 0 10px rgba(245, 158, 11, 0.5)";
        }
        
        container.appendChild(bar);
    });
}

function renderVariablesPanel() {
    const container = document.getElementById("variableWatch");
    if (!container) return;
    
    container.innerHTML = "";
    
    const entries = Object.entries(lastKnownVariables);
    if (entries.length === 0) return;

    entries.forEach(([name, value]) => {
        if (name === 'arr' || typeof value === 'object') return;

        const pill = document.createElement("div");
        pill.className = "var-pill";
        
        pill.innerHTML = `
            <span class="var-name">${name}</span>
            <span class="var-val">${value}</span>
        `;
        
        container.appendChild(pill);
    });
}

/**
 * Display console output from print() calls in the console panel.
 */
function showConsoleOutput(output) {
    const panel = document.getElementById('consolePanel');
    const body = document.getElementById('consoleOutput');
    if (!panel || !body) return;

    if (output && output.trim().length > 0) {
        body.textContent = output;
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
        body.textContent = '';
    }
}

function clearConsole() {
    const body = document.getElementById('consoleOutput');
    if (body) body.textContent = '';
    const panel = document.getElementById('consolePanel');
    if (panel) panel.style.display = 'none';
}

function toggleConsole() {
    const body = document.getElementById('consoleOutput');
    if (body) {
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }
}