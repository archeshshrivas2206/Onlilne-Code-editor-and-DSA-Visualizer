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