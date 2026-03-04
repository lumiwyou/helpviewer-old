const server = `http://${location.host}/`;
const results = document.getElementById("results");
var data;
var base = 0;
const count = 100;

async function search(terms) {
    base = 0; // reset
    const loading = document.getElementById("loading");
    const status = document.getElementById("status");
    loading.hidden = false;
    status.style = "background-color:#fcfca4; color:#000000;";
    status.value = "Querying ... ";
    console.log("Querying terms");
    try {
        const res = await fetch(`${server}query?terms=${terms}`);

        if (!res.ok) {
            throw new Error(`Response status: ${res.status}`);
        }
        status.value = "Received ... ";

        data = await res.json();

        status.value = "Displaying ... ";
        await displayResults(data);
        status.value = "Done ! ";
        loading.hidden = true;
        status.style = "background-color:#a4fca4;  color:#000000;";
    } catch (error) {
        loading.hidden = true;
        status.value = error;
        status.style = "background-color:#8F1717;  color:#ffffff;";
    }
}

async function displayResults() {
    const resultsList = document.createElement("ul");
    const status = document.getElementById("status");
    const counter = document.getElementById("counter");
    // TODO: Create existing list in the @index.html file.

    console.log("Displaying results");
    if (Array.isArray(data)) {
        const total = data.length;

        if (total == 0) {
            status.value = "No results found";
            return;
        }
        counter.textContent = `${base} / ${count}`;

        for (let n = base; n < Math.min(base + count, data.length); n++) {
            console.log(`Displaying ${n}`);
            status.value = `Displaying (${n}/${base + count})/${total}`;

            const listItem = document.createElement("li");
            listItem.textContent = data[n][0];

            var button = document.createElement("button");
            button.textContent = "View file";
            button.addEventListener("click", () => {
                document.getElementById("preview").src =
                    server + "file?path=" + data[n][1];
            });
            listItem.appendChild(button);
            resultsList.appendChild(listItem);
        }

        const results = document.getElementById("results");
        if (results) {
            controller_tmp = document.getElementById("controller");
            results.innerHTML = "";
            results.appendChild(controller_tmp);
            results.appendChild(resultsList);
        }
    }
}

function step(direction) {
    switch (direction) {
        case "next":
            base += count;
            break;
        case "prev":
            base -= count;
            break;
    }

    // Make sure base never goes below 0 or beyond data.length
    base = Math.max(0, Math.min(base, data.length - 1));

    displayResults();
}
