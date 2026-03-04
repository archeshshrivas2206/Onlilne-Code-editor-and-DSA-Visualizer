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