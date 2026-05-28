let graph = {};
let graphNodes = [];

function addNode() {
    const value = document.getElementById("nodeValue").value;
    if (!value) return;

    graph[value] = [];
    graphNodes.push(value);

    document.getElementById("nodeValue").value = "";
    renderGraph();
}

function addEdge() {
    const from = document.getElementById("edgeFrom").value;
    const to = document.getElementById("edgeTo").value;

    if (!graph[from] || !graph[to]) return;

    graph[from].push(to);

    document.getElementById("edgeFrom").value = "";
    document.getElementById("edgeTo").value = "";

    renderGraph();
}

function renderGraph(highlightNode, visitedSet) {

    const container = document.getElementById("bars");
    container.innerHTML = "";

    container.style.position = "relative";

    const radius = 150;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    const positions = {};

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";

    container.appendChild(svg);

    /* ---- NODE POSITIONS ---- */
    graphNodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / graphNodes.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions[node] = { x, y };
    });

    /* ---- DRAW EDGES ---- */
    Object.keys(graph).forEach(from => {
        graph[from].forEach(to => {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            line.setAttribute("x1", positions[from].x + 25);
            line.setAttribute("y1", positions[from].y + 25);
            line.setAttribute("x2", positions[to].x + 25);
            line.setAttribute("y2", positions[to].y + 25);

            line.setAttribute("stroke", "rgba(148, 163, 184, 0.4)");
            line.setAttribute("stroke-width", "2");

            svg.appendChild(line);
        });
    });

    /* ---- DRAW NODES ---- */
    graphNodes.forEach(node => {

        const { x, y } = positions[node];

        const nodeDiv = document.createElement("div");
        nodeDiv.style.position = "absolute";
        nodeDiv.style.left = x + "px";
        nodeDiv.style.top = y + "px";
        nodeDiv.style.width = "50px";
        nodeDiv.style.height = "50px";
        nodeDiv.style.borderRadius = "50%";
        nodeDiv.style.display = "flex";
        nodeDiv.style.alignItems = "center";
        nodeDiv.style.justifyContent = "center";
        nodeDiv.style.color = "white";
        nodeDiv.style.fontWeight = "bold";
        nodeDiv.style.transition = "background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease";

        // Determine node visual state
        if (highlightNode && node === highlightNode) {
            // Currently being visited — glow red
            nodeDiv.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
            nodeDiv.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.6)";
            nodeDiv.style.transform = "scale(1.2)";
        } else if (visitedSet && visitedSet.has(node)) {
            // Already visited — fade to green
            nodeDiv.style.background = "linear-gradient(135deg, #10b981, #059669)";
            nodeDiv.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.4)";
        } else {
            // Default unvisited
            nodeDiv.style.background = "linear-gradient(135deg, #3b82f6, #2563eb)";
            nodeDiv.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.3)";
        }

        nodeDiv.dataset.value = node;
        nodeDiv.innerText = node;
        container.appendChild(nodeDiv);
    });
}

/* ---- Traversal Algorithms ---- */

function bfs(start) {
    const visited = new Set();
    const queue = [start];
    const order = [];

    while (queue.length) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            order.push(node);
            graph[node].forEach(n => queue.push(n));
        }
    }

    return order;
}

function dfs(node, visited, order) {
    visited.add(node);
    order.push(node);
    graph[node].forEach(n => {
        if (!visited.has(n)) dfs(n, visited, order);
    });
}

/* ---- Engine-Integrated Traversal ---- */

function runGraphTraversal(type) {
    const start = graphNodes[0];
    if (!start) return;

    let order = [];

    if (type === "bfs") {
        order = bfs(start);
    } else {
        const visited = new Set();
        dfs(start, visited, order);
    }

    if (order.length === 0) return;

    const outputEl = document.getElementById("graphTraversalOutput");
    outputEl.innerText = "";

    // Build discrete step objects with cumulative visited state
    const steps = order.map((val, idx) => ({
        type: 'graph_visit',
        currentNode: val,
        visitedSoFar: new Set(order.slice(0, idx)),     // nodes already done before this step
        traversalType: type,
        outputSoFar: order.slice(0, idx + 1).join(" ")
    }));

    // Load into the global engine with graph-specific renderer
    window.engine.load(steps, renderGraphStep, () => {
        // On complete: show all as visited, no active highlight
        renderGraph(null, new Set(order));
        outputEl.innerText = order.join(" ");
    });
    window.engine.autoPlay();
}

/**
 * Graph-specific step renderer.
 * Called by the global engine for each traversal frame.
 */
function renderGraphStep(step, index, allSteps) {
    // Re-render entire graph with current node highlighted + previously visited set
    renderGraph(step.currentNode, step.visitedSoFar);

    // Update traversal output incrementally
    const outputEl = document.getElementById("graphTraversalOutput");
    if (outputEl) {
        outputEl.innerText = step.outputSoFar;
    }
}
