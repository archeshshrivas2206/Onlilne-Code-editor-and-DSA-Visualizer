windows.linkedList = [];
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

        // Clear previous visualization
        container.innerHTML = "";

        // Reset layout so Linked List always displays correctly
        container.style.display = "flex";
        container.style.flexDirection = "row";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.gap = "15px";
        container.style.position = "relative";

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

                // Add arrow if not last node
                if (index !== linkedList.length - 1) {

                        const arrow = document.createElement("span");
                        arrow.style.margin = "0 10px";
                        arrow.style.fontSize = "20px";
                        arrow.style.fontWeight = "bold";
                        arrow.innerText = "→";

                        node.appendChild(arrow);
                }

                container.appendChild(node);

        });

}
window.insertNode = insertNode;
window.deleteNode = deleteNode;