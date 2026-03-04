let stack = [];
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