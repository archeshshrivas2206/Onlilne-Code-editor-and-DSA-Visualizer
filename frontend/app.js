
    let stack = [];
    let queue = [];
    let linkedList = [];
    let tree = null;
    let graph = { };
    let graphNodes = [];
    let editor;

    require.config({paths: {vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {

        editor = monaco.editor.create(document.getElementById('editor'), {
            value: `def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr)-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true
        });

        });

    // ================= MODE SWITCH =================
    function changeMode(mode) {



            const sortingSection = document.getElementById("sortingSection");
    const stackSection = document.getElementById("stackControls");
    const queueSection = document.getElementById("queueControls");
    const linkedListSection = document.getElementById("linkedListControls");
    const treeSection = document.getElementById("treeControls");
    const treeTraversalSection = document.getElementById("treeTraversalControls");
    const graphSection = document.getElementById("graphControls");

    const bars = document.getElementById("bars");

    bars.innerHTML = "";

    /* Hide everything first */
    sortingSection.style.display = "none";
    stackSection.style.display = "none";
    queueSection.style.display = "none";
    linkedListSection.style.display = "none";
    treeSection.style.display = "none";
    treeTraversalSection.style.display = "none";
    graphSection.style.display = "none";

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

    bars.style.flexDirection = "row";
    bars.style.alignItems = "center";

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
    // ================= SORTING =================
    async function runCode() {
            const code = editor ? editor.getValue() : "";

    const arrayInput = document.getElementById("arrayInput").value
    .split(",")
    .map(Number);

    const algorithm = document.getElementById("algorithm").value;

    const response = await fetch("http://127.0.0.1:8000/run", {
        method: "POST",
    headers: {"Content-Type": "application/json" },
    body: JSON.stringify({
        code: code,
    input_array: arrayInput,
    algorithm: algorithm
                })
            });

    const data = await response.json();

    if (data.error) {
        alert(data.error);
    return;
            }

    animate(data.steps);
        }

    function animate(steps) {
        let i = 0;

    function nextStep() {
                if (i >= steps.length) return;

    renderBars(steps[i]);
    i++;

    const speed = document.getElementById("speed").value;
    setTimeout(nextStep, speed);
            }

    nextStep();
        }

    function renderBars(step) {
            const container = document.getElementById("bars");
    container.innerHTML = "";

    const array = step.array;
    const max = Math.max(...array);

            array.forEach((value, index) => {
                const bar = document.createElement("div");
    bar.classList.add("bar");

    const normalizedHeight = (value / max) * 300;
    bar.style.height = normalizedHeight + "px";
    bar.innerText = value;

    if (step.swap === index) {
        bar.style.background = "linear-gradient(to top, #ff4d4d, #cc0000)";
                }

    container.appendChild(bar);
            });
        }

    // ================= STACK =================
    function pushStack() {
            const value = document.getElementById("stackValue").value;
    if (value === "") return;

    stack.push(Number(value));
    document.getElementById("stackValue").value = "";
    renderStack();
        }

    function popStack() {
            if (stack.length === 0) return;

    stack.pop();
    renderStack();
        }

    function renderStack() {
            const container = document.getElementById("bars");
    container.innerHTML = "";

            stack.forEach((value) => {
                const box = document.createElement("div");
    box.style.width = "100px";
    box.style.height = "40px";
    box.style.background = "#28a745";
    box.style.margin = "5px";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.color = "white";
    box.style.borderRadius = "5px";
    box.innerText = value;

    container.appendChild(box);
            });
        }

    function enqueue() {
            const value = document.getElementById("queueValue").value;
    if (value === "") return;

    queue.push(Number(value));
    document.getElementById("queueValue").value = "";
    renderQueue();
        }

    function dequeue() {
            if (queue.length === 0) return;

    queue.shift(); // removes first element
    renderQueue();
        }

    function renderQueue() {
            const container = document.getElementById("bars");
    container.innerHTML = "";

            queue.forEach((value, index) => {
                const box = document.createElement("div");
    box.style.width = "60px";
    box.style.height = "60px";
    box.style.background = "#17a2b8";
    box.style.margin = "5px";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.color = "white";
    box.style.borderRadius = "5px";
    box.style.fontWeight = "bold";
    box.innerText = value;

    container.appendChild(box);
            });
        }

    function insertNode() {
            const value = document.getElementById("llValue").value;
    if (value === "") return;

    linkedList.push(Number(value));
    document.getElementById("llValue").value = "";
    renderLinkedList();
        }

    function deleteNode() {
            const value = Number(document.getElementById("llValue").value);
            linkedList = linkedList.filter(v => v !== value);
    document.getElementById("llValue").value = "";
    renderLinkedList();
        }

    function renderLinkedList() {
            const container = document.getElementById("bars");
    container.innerHTML = "";

            linkedList.forEach((value, index) => {
                const node = document.createElement("div");
    node.style.display = "flex";
    node.style.alignItems = "center";

    const box = document.createElement("div");
    box.style.width = "70px";
    box.style.height = "50px";
    box.style.background = "#6f42c1";
    box.style.color = "white";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.borderRadius = "5px";
    box.style.fontWeight = "bold";
    box.innerText = value;

    node.appendChild(box);

    if (index !== linkedList.length - 1) {
                    const arrow = document.createElement("span");
    arrow.style.margin = "0 10px";
    arrow.innerText = "→";
    node.appendChild(arrow);
                }

    container.appendChild(node);
            });
        }

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

    function renderTree() {

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
    nodeDiv.style.background = "#f39c12";
    nodeDiv.style.display = "flex";
    nodeDiv.style.alignItems = "center";
    nodeDiv.style.justifyContent = "center";
    nodeDiv.style.color = "white";
    nodeDiv.style.fontWeight = "bold";

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

    line.setAttribute("stroke", "#555");
    line.setAttribute("stroke-width", "2");

    svg.appendChild(line);
            }
    drawNode(tree, width / 2, 20, width / 4);
        }

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

    function runTraversal(type) {

            const result = [];

    if (type === "inorder") inorder(tree, result);
    else if (type === "preorder") preorder(tree, result);
    else if (type === "postorder") postorder(tree, result);
    else if (type === "levelorder") levelorder(tree, result);

    animateTraversal(result);
        }

    function animateTraversal(order) {

            const nodes = document.querySelectorAll("#bars div[data-value]");
    const output = document.getElementById("traversalOutput");

    output.innerText = "";

    let i = 0;

    function highlight() {

                if (i >= order.length) return;

    const value = order[i];

                nodes.forEach(node => {

                    if (Number(node.dataset.value) === value) {

        node.style.background = "#e74c3c";

                        setTimeout(() => {
        node.style.background = "#f39c12";
                        }, 700);
                    }

                });

    output.innerText += value + " ";

    i++;

    setTimeout(highlight, 800);
            }

    highlight();
        }

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

    function renderGraph() {

            const container = document.getElementById("bars");
    container.innerHTML = "";

    container.style.position = "relative";

    const radius = 150;
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    const positions = { };

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

    positions[node] = {x, y};

            });


            /* ---- DRAW EDGES ---- */

            Object.keys(graph).forEach(from => {

        graph[from].forEach(to => {

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

            line.setAttribute("x1", positions[from].x + 25);
            line.setAttribute("y1", positions[from].y + 25);

            line.setAttribute("x2", positions[to].x + 25);
            line.setAttribute("y2", positions[to].y + 25);

            line.setAttribute("stroke", "#555");
            line.setAttribute("stroke-width", "2");

            svg.appendChild(line);

        });

            });


            /* ---- DRAW NODES ---- */

            graphNodes.forEach(node => {

                const {x, y} = positions[node];

    const nodeDiv = document.createElement("div");

    nodeDiv.style.position = "absolute";
    nodeDiv.style.left = x + "px";
    nodeDiv.style.top = y + "px";

    nodeDiv.style.width = "50px";
    nodeDiv.style.height = "50px";

    nodeDiv.style.borderRadius = "50%";
    nodeDiv.style.background = "#3498db";

    nodeDiv.style.display = "flex";
    nodeDiv.style.alignItems = "center";
    nodeDiv.style.justifyContent = "center";

    nodeDiv.style.color = "white";
    nodeDiv.style.fontWeight = "bold";

    nodeDiv.dataset.value = node;

    nodeDiv.innerText = node;

    container.appendChild(nodeDiv);

            });

        }

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

    function runGraphTraversal(type) {

            const start = graphNodes[0];

    let order = [];

    if (type === "bfs") order = bfs(start);

    else {

                const visited = new Set();
    dfs(start, visited, order);

            }

    animateGraphTraversal(order);

        }

    function animateGraphTraversal(order) {

            const nodes = document.querySelectorAll("#bars div[data-value]");

    const output = document.getElementById("graphTraversalOutput");

    output.innerText = "";

    let i = 0;

    function step() {

                if (i >= order.length) return;

    const value = order[i];

                nodes.forEach(n => {

                    if (n.dataset.value === value) {

        n.style.background = "#e74c3c";

                        setTimeout(() => {

        n.style.background = "#3498db";

                        }, 600);

                    }

                });

    output.innerText += value + " ";

    i++;

    setTimeout(step, 700);

            }

    step();

        }
