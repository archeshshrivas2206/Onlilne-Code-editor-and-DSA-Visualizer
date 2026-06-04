let stack = [];
let isAnimatingStack = false;

function pushStack() {
    if (isAnimatingStack) return;
    const valueInput = document.getElementById("stackValue");
    const value = valueInput.value;
    if (value === "") return;

    stack.push(Number(value));
    valueInput.value = "";
    renderStack(stack.length - 1);
}

function popStack() {
    if (isAnimatingStack || stack.length === 0) return;

    isAnimatingStack = true;

    const holder = document.getElementById("stackHolder");
    if (holder && holder.childNodes.length > 0) {
        const topNode = holder.lastChild;
        if (topNode) {
            topNode.classList.remove('animate-push');
            topNode.classList.add('animate-pop');
        }
    }

    setTimeout(() => {
        stack.pop();
        renderStack();
        isAnimatingStack = false;
    }, 300);
}

function renderStack(newIndex) {
    const container = document.getElementById("bars");
    container.innerHTML = "";

    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.padding = "20px";
    container.style.position = "relative";

    // Premium glassmorphic cylinder/holder
    const holder = document.createElement("div");
    holder.id = "stackHolder";
    holder.style.display = "flex";
    holder.style.flexDirection = "column-reverse";
    holder.style.alignItems = "center";
    holder.style.borderLeft = "3px solid rgba(15, 23, 42, 0.12)";
    holder.style.borderRight = "3px solid rgba(15, 23, 42, 0.12)";
    holder.style.borderBottom = "3px solid rgba(15, 23, 42, 0.2)";
    holder.style.borderRadius = "0 0 12px 12px";
    holder.style.padding = "15px 12px";
    holder.style.minWidth = "150px";
    holder.style.minHeight = "220px";
    holder.style.background = "rgba(15, 23, 42, 0.02)";
    holder.style.backdropFilter = "blur(4px)";
    holder.style.boxShadow = "inset 0 0 20px rgba(15, 23, 42, 0.03)";
    holder.style.gap = "8px";

    stack.forEach((value, index) => {
        const box = document.createElement("div");
        box.style.width = "110px";
        box.style.height = "42px";
        box.style.background = "linear-gradient(135deg, #10b981, #059669)";
        box.style.boxShadow = "0 4px 10px rgba(16, 185, 129, 0.3)";
        box.style.display = "flex";
        box.style.alignItems = "center";
        box.style.justifyContent = "center";
        box.style.color = "white";
        box.style.borderRadius = "6px";
        box.style.fontWeight = "bold";
        box.style.fontSize = "1.05rem";
        box.innerText = value;

        if (newIndex !== undefined && index === newIndex) {
            box.classList.add('animate-push');
        }

        holder.appendChild(box);
    });

    container.appendChild(holder);
}

window.pushStack = pushStack;
window.popStack = popStack;