let tree = null;

function insertTree() {
    const value = Number(document.getElementById("treeValue").value);
    if (!value) return;

    tree = insertBST(tree, value);

    document.getElementById("treeValue").value = "";
    renderTree();
}

function insertBST(node, value) {
    if (node === null) {
        return {
            value: value,
            left: null,
            right: null
        };
    }

    if (value < node.value) {
        node.left = insertBST(node.left, value);
    } else {
        node.right = insertBST(node.right, value);
    }

    return node;
}

function deleteTreeNode() {
    const value = Number(document.getElementById("treeValue").value);
    if (!value && value !== 0) return;

    tree = deleteBST(tree, value);
    document.getElementById("treeValue").value = "";
    renderTree();
}

function deleteBST(node, value) {
    if (node === null) return null;

    if (value < node.value) {
        node.left = deleteBST(node.left, value);
    } else if (value > node.value) {
        node.right = deleteBST(node.right, value);
    } else {
        // Found the node to delete
        // Case 1: Leaf node
        if (!node.left && !node.right) return null;
        // Case 2: One child
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        // Case 3: Two children — replace with inorder successor
        const successor = findMin(node.right);
        node.value = successor.value;
        node.right = deleteBST(node.right, successor.value);
    }
    return node;
}

function findMin(node) {
    while (node.left) node = node.left;
    return node;
}

function renderTree(highlightValue, highlightColor) {

    const container = document.getElementById("bars");
    container.innerHTML = "";

    if (!tree) return;

    const width = container.clientWidth;
    container.style.position = "relative";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";

    container.appendChild(svg);

    function drawNode(node, x, y, offset) {

        if (!node) return;

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

        // Determine node color based on highlight state
        if (highlightValue !== undefined && node.value === highlightValue) {
            nodeDiv.style.background = highlightColor || "linear-gradient(135deg, #ef4444, #dc2626)";
            nodeDiv.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.6)";
            nodeDiv.style.transform = "scale(1.2)";
        } else {
            nodeDiv.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
            nodeDiv.style.boxShadow = "0 2px 8px rgba(245, 158, 11, 0.3)";
        }

        nodeDiv.innerText = node.value;
        nodeDiv.dataset.value = node.value;
        container.appendChild(nodeDiv);

        if (node.left) {
            const childX = x - offset;
            const childY = y + 80;
            drawLine(x + 25, y + 25, childX + 25, childY + 25);
            drawNode(node.left, childX, childY, offset / 2);
        }

        if (node.right) {
            const childX = x + offset;
            const childY = y + 80;
            drawLine(x + 25, y + 25, childX + 25, childY + 25);
            drawNode(node.right, childX, childY, offset / 2);
        }
    }

    function drawLine(x1, y1, x2, y2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "rgba(148, 163, 184, 0.4)");
        line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
    }

    drawNode(tree, width / 2, 20, width / 4);
}

/* ---- Traversal Algorithms ---- */

function inorder(node, result) {
    if (!node) return;
    inorder(node.left, result);
    result.push(node.value);
    inorder(node.right, result);
}

function preorder(node, result) {
    if (!node) return;
    result.push(node.value);
    preorder(node.left, result);
    preorder(node.right, result);
}

function postorder(node, result) {
    if (!node) return;
    postorder(node.left, result);
    postorder(node.right, result);
    result.push(node.value);
}

function levelorder(root, result) {
    const queue = [];
    if (root) queue.push(root);
    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.value);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
}

/* ---- Engine-Integrated Traversal ---- */

function runTraversal(type) {
    const result = [];

    if (type === "inorder") inorder(tree, result);
    else if (type === "preorder") preorder(tree, result);
    else if (type === "postorder") postorder(tree, result);
    else if (type === "levelorder") levelorder(tree, result);

    if (result.length === 0) return;

    // Convert traversal order into discrete step objects for the engine
    const outputEl = document.getElementById("traversalOutput");
    outputEl.innerText = "";

    const steps = result.map((val, idx) => ({
        type: 'tree_visit',
        value: val,
        traversalType: type,
        outputSoFar: result.slice(0, idx + 1).join(" ")
    }));

    // Load into the global engine with tree-specific renderer
    window.engine.load(steps, renderTreeStep, () => {
        // On complete: remove highlight, show full output
        renderTree();
        outputEl.innerText = result.join(" ");
    });
    window.engine.autoPlay();
}

/**
 * Tree-specific step renderer.
 * Called by the global engine for each traversal frame.
 */
function renderTreeStep(step, index, allSteps) {
    // Re-render entire tree with the current visited node highlighted
    renderTree(step.value, "linear-gradient(135deg, #ef4444, #dc2626)");

    // Update traversal output incrementally
    const outputEl = document.getElementById("traversalOutput");
    if (outputEl) {
        outputEl.innerText = step.outputSoFar;
    }
}