let animationSteps = [];
let currentStepIndex = 0;
let isPlaying = false;
let animationTimeout = null;

async function runCode() {
    // Reset any ongoing animation
    stopAnimation();

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
            alert("Backend Error: " + data.error);
            return;
        }

        animationSteps = data.steps || [];
        currentStepIndex = 0;

        if (animationSteps.length === 0) {
            alert("No steps returned from execution.");
            return;
        }

        // Show Playback UI
        document.getElementById("playbackControls").style.display = "flex";
        
        // Start Playback automatically
        startPlayback();

    } catch (err) {
        console.error("Failed to run code:", err);
        alert("Network error: Could not connect to backend server.");
    }
}

function startPlayback() {
    isPlaying = true;
    updatePlayButtonUI();
    playLoop();
}

function stopAnimation() {
    isPlaying = false;
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    updatePlayButtonUI();
}

function togglePlay() {
    if (isPlaying) {
        stopAnimation();
    } else {
        // If completed, restart
        if (currentStepIndex >= animationSteps.length - 1) {
            currentStepIndex = 0;
        }
        startPlayback();
    }
}

function updatePlayButtonUI() {
    const btn = document.getElementById("playPauseBtn");
    if (btn) {
        btn.innerText = isPlaying ? "⏸" : "▶";
    }
}

function playLoop() {
    if (!isPlaying) return;

    if (currentStepIndex >= animationSteps.length) {
        stopAnimation();
        return;
    }

    renderStep(currentStepIndex);
    currentStepIndex++;

    const speedSliderValue = document.getElementById("speed").value;
    // Lower slider val should mean fast? Current html: min 50, max 1000.
    // Let's calculate actual delay. 1050 - val will make sliding right (large value) mean smaller interval (faster).
    // wait, user HTML usually does simple timeout. Let's just inverted so higher value means faster.
    // Original code: const speed = speedValue; setTimeout(nextStep, speed);
    // To feel logical: Invert so 1000 means fast, 50 means slow. Or keep it direct where Slider value = ms interval.
    // Let's stick to direct MS interval for simplicity, but cap it minimum 20ms for smoothness.
    const interval = Math.max(20, speedSliderValue);
    
    animationTimeout = setTimeout(playLoop, interval);
}

function stepForward() {
    stopAnimation();
    if (currentStepIndex < animationSteps.length - 1) {
        currentStepIndex++;
        renderStep(currentStepIndex);
    }
}

function stepBackward() {
    stopAnimation();
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStep(currentStepIndex);
    }
}

function renderStep(index) {
    if (index < 0 || index >= animationSteps.length) return;

    const step = animationSteps[index];
    
    // Sync line highlight in Monaco
    if (step.line && typeof highlightLine === "function") {
        highlightLine(step.line);
    }

    // Render Visual Bars
    const container = document.getElementById("bars");
    if (!container) return;
    
    container.innerHTML = "";

    const arr = step.array || [];
    const maxValue = Math.max(...arr, 1); // Avoid division by 0

    // Get container height for intelligent scaling
    const stageHeight = container.clientHeight || 400;
    const availableHeight = stageHeight - 60; // padding

    arr.forEach((val, idx) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        
        // Text Content
        bar.innerText = val;

        // Height scaling
        const hPct = (val / maxValue) * availableHeight;
        bar.style.height = Math.max(hPct, 25) + "px"; // Min height of 25px to keep it visible

        // Color States based on steps
        let isSwap = (step.swap === idx);
        let isCompare = (step.compare && step.compare.includes(idx));

        if (isSwap) {
            bar.style.background = "linear-gradient(to top, #ef4444, #b91c1c)"; // Danger Red
            bar.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.6)";
            bar.style.transform = "translateY(-4px)"; // subtle elevation effect
        } else if (isCompare) {
            bar.style.background = "linear-gradient(to top, #f59e0b, #d97706)"; // Warning Orange
            bar.style.boxShadow = "0 0 10px rgba(245, 158, 11, 0.5)";
        }
        
        container.appendChild(bar);
    });
}