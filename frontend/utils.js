const server = `http://${location.host}/`;
const status = document.getElementById("status");
const results = document.getElementById("results");
var data;
var base = 0;
const count = 100;

async function search(terms) {
  base = 0; // reset
  const loading = document.getElementById("loading");
  loading.hidden = false;
  status.style = "background-color:#fcfca4;";
  status.value = "Querying ... ";
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
    status.style = "background-color:#a4fca4;";
  } catch (error) {
    loading.hidden = true;
    status.value = error;
    status.style = "background-color:#8F1717;";
  }
}

async function displayResults() {
  const resultsList = document.createElement("ul");
  // TODO: Create existing list in the @index.html file.

  if (Array.isArray(data)) {
    const total = data.length;

    if (total == 0) {
      status.value = "No results found";
      return;
    }
    counter.textContent = `${base} / ${count}`;

    for (var n = 0; n <= count; n++) {
      status.value = `Displaying (${n}/${base + count})/${total}`;

      const listItem = document.createElement("li");
      listItem.textContent = data[n][0];
      resultsList.appendChild(listItem);

      const button = document.createElement("button");
      button.textContent = "View file";
      button.addEventListener("click", () => {
        document.getElementById("preview").src =
          server + "file?path=" + data[n][1];
      });
      listItem.appendChild(button);
    }

    if (results) {
      controller_tmp = document.getElementById("controller");
      results.innerHTML = "";
      results.appendChild(controller_tmp);
      results.appendChild(resultsList);
    }
  }
}

function step(direction) {
  // TODO: Implement a boundary check
  switch (direction) {
    case "next":
      base += 100;
    case "prev":
      base -= 100;
  }

  displayResults();
}
