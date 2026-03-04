let graph = { };
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
