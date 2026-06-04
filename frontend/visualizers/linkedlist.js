let linkedList = [];

function insertNode() {
        if (window.engine) window.engine.stop();
        const value = document.getElementById("llValue").value;
        if (value === "") return;

        linkedList.push(Number(value));
        document.getElementById("llValue").value = "";
        renderLinkedList();
}

function deleteNode() {
        if (window.engine) window.engine.stop();
        const value = Number(document.getElementById("llValue").value);
        linkedList = linkedList.filter(v => v !== value);
        document.getElementById("llValue").value = "";
        renderLinkedList();
}

function renderLinkedList(highlightIndex, highlightState) {
        const container = document.getElementById("bars");

        // Clear previous visualization
        container.innerHTML = "";

        // Reset layout so Linked List always displays correctly
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.gap = "15px";
        container.style.position = "relative";
        container.style.flexWrap = "wrap";
        container.style.padding = "20px";

        linkedList.forEach((value, index) => {
                const node = document.createElement("div");
                node.style.display = "flex";
                node.style.alignItems = "center";
                node.style.margin = "10px 0";
                node.style.transition = "transform 0.3s ease";

                const box = document.createElement("div");
                box.style.width = "70px";
                box.style.height = "50px";
                box.style.color = "white";
                box.style.display = "flex";
                box.style.alignItems = "center";
                box.style.justifyContent = "center";
                box.style.borderRadius = "8px";
                box.style.fontWeight = "bold";
                box.style.fontSize = "1.1rem";
                box.style.transition = "background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease";
                box.innerText = value;

                if (highlightIndex !== undefined && index === highlightIndex) {
                        node.style.transform = "scale(1.2)";
                        if (highlightState === 'checking') {
                                box.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
                                box.style.boxShadow = "0 0 20px rgba(245, 158, 11, 0.6)";
                        } else if (highlightState === 'found') {
                                box.style.background = "linear-gradient(135deg, #10b981, #059669)";
                                box.style.boxShadow = "0 0 20px rgba(16, 185, 129, 0.6)";
                        } else if (highlightState === 'not_found') {
                                box.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
                                box.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.6)";
                        } else {
                                box.style.background = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
                                box.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.6)";
                        }
                } else if (highlightIndex !== undefined && index < highlightIndex) {
                        // Visited nodes in search/traverse
                        box.style.background = "linear-gradient(135deg, #6366f1, #4f46e5)";
                        box.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.3)";
                } else {
                        // Normal nodes
                        box.style.background = "linear-gradient(135deg, #6f42c1, #5a32a3)";
                        box.style.boxShadow = "0 2px 8px rgba(111, 66, 193, 0.3)";
                }

                node.appendChild(box);

                // Add arrow if not last node
                if (index !== linkedList.length - 1) {
                        const arrow = document.createElement("span");
                        arrow.style.margin = "0 10px";
                        arrow.style.fontSize = "22px";
                        arrow.style.fontWeight = "bold";
                        arrow.style.color = "rgba(15, 23, 42, 0.4)";
                        arrow.innerText = "→";

                        node.appendChild(arrow);
                }

                container.appendChild(node);
        });
}

function traverseLL() {
        if (linkedList.length === 0) return;

        const outputEl = document.getElementById("llTraversalOutput");
        if (outputEl) outputEl.innerText = "";

        const steps = [];
        for (let i = 0; i < linkedList.length; i++) {
                steps.push({
                        type: 'll_traverse',
                        index: i,
                        state: 'visiting',
                        value: linkedList[i],
                        message: `Visiting Node ${i + 1} with Value: ${linkedList[i]}`
                });
        }

        window.engine.load(steps, renderLLStep, () => {
                renderLinkedList();
                if (outputEl) outputEl.innerText = "Traversal Completed!";
        });
        window.engine.autoPlay();
}

function searchLL() {
        const valStr = document.getElementById("llValue").value;
        if (valStr === "") return;
        const target = Number(valStr);
        document.getElementById("llValue").value = "";

        const outputEl = document.getElementById("llTraversalOutput");
        if (outputEl) outputEl.innerText = "";

        if (linkedList.length === 0) {
                if (outputEl) outputEl.innerText = "Empty List!";
                return;
        }

        const steps = [];
        let found = false;
        for (let i = 0; i < linkedList.length; i++) {
                if (linkedList[i] === target) {
                        steps.push({
                                type: 'll_search',
                                index: i,
                                state: 'found',
                                value: linkedList[i],
                                message: `Found target ${target} at Node ${i + 1}!`
                        });
                        found = true;
                        break;
                } else {
                        steps.push({
                                type: 'll_search',
                                index: i,
                                state: 'checking',
                                value: linkedList[i],
                                message: `Node ${i + 1} (${linkedList[i]}) is not ${target}. Moving next...`
                        });
                }
        }

        if (!found) {
                steps.push({
                        type: 'll_search',
                        index: linkedList.length - 1,
                        state: 'not_found',
                        value: linkedList[linkedList.length - 1],
                        message: `Target ${target} not found in the list.`
                });
        }

        window.engine.load(steps, renderLLStep, () => {
                if (found) {
                        const lastStep = steps[steps.length - 1];
                        renderLinkedList(lastStep.index, 'found');
                } else {
                        renderLinkedList();
                }
                if (outputEl) outputEl.innerText = found ? `Found ${target}!` : `Target ${target} not found!`;
        });
        window.engine.autoPlay();
}

function renderLLStep(step, index, allSteps) {
        renderLinkedList(step.index, step.state);
        const outputEl = document.getElementById("llTraversalOutput");
        if (outputEl) {
                outputEl.innerText = step.message;
        }
}

window.insertNode = insertNode;
window.deleteNode = deleteNode;
window.searchLL = searchLL;
window.traverseLL = traverseLL;