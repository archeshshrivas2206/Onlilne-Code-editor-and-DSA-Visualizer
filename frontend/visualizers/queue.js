let queue = [];
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