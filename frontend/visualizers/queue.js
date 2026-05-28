let queue = [];
let isAnimatingQueue = false;

function enqueue() {
    if (isAnimatingQueue) return;
    const valueInput = document.getElementById("queueValue");
    const value = valueInput.value;
    if (value === "") return;

    queue.push(Number(value));
    valueInput.value = "";
    renderQueue(queue.length - 1);
}

function dequeue() {
    if (isAnimatingQueue || queue.length === 0) return;

    isAnimatingQueue = true;

    const holder = document.getElementById("queueHolder");
    if (holder && holder.childNodes.length > 0) {
        const firstNode = holder.firstChild;
        if (firstNode) {
            firstNode.classList.remove('animate-enqueue');
            firstNode.classList.add('animate-dequeue');
        }
    }

    setTimeout(() => {
        queue.shift();
        renderQueue();
        isAnimatingQueue = false;
    }, 300);
}

function renderQueue(newIndex) {
    const container = document.getElementById("bars");
    container.innerHTML = "";

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.padding = "20px";
    container.style.position = "relative";

    // Horizontal glassmorphic pipe
    const holder = document.createElement("div");
    holder.id = "queueHolder";
    holder.style.display = "flex";
    holder.style.flexDirection = "row";
    holder.style.alignItems = "center";
    holder.style.borderTop = "3px solid rgba(255, 255, 255, 0.12)";
    holder.style.borderBottom = "3px solid rgba(255, 255, 255, 0.12)";
    holder.style.padding = "12px 20px";
    holder.style.minWidth = "320px";
    holder.style.minHeight = "80px";
    holder.style.background = "rgba(255, 255, 255, 0.02)";
    holder.style.backdropFilter = "blur(4px)";
    holder.style.boxShadow = "inset 0 0 20px rgba(255, 255, 255, 0.03)";
    holder.style.borderRadius = "8px";
    holder.style.gap = "10px";

    queue.forEach((value, index) => {
        const box = document.createElement("div");
        box.style.width = "55px";
        box.style.height = "55px";
        box.style.background = "linear-gradient(135deg, #0ea5e9, #0284c7)";
        box.style.boxShadow = "0 4px 10px rgba(14, 165, 233, 0.3)";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.color = "white";
        box.style.borderRadius = "8px";
        box.style.fontWeight = "bold";
        box.style.fontSize = "1.05rem";
        box.innerText = value;

        if (newIndex !== undefined && index === newIndex) {
            box.classList.add('animate-enqueue');
        }

        holder.appendChild(box);
    });

    container.appendChild(holder);
}

window.enqueue = enqueue;
window.dequeue = dequeue;