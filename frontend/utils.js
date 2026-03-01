const server = "http://localhost:8080/";
async function search(terms) {
  const loading = document.getElementById("loading");
  const status = document.getElementById("status");
  loading.hidden = false;
  status.style = "background-color:#fcfca4;";
  status.value = "Querying ... ";
  try {
    const res = await fetch(`${server}search?query=${terms}`);

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    status.value = "Received ... ";

    const data = await res.json();

    status.value = "Displaying ... ";
    await displaySearchResults(data);
    status.value = "Done ! ";
    loading.hidden = true;
    status.style = "background-color:#a4fca4;";
  } catch (error) {
    loading.hidden = true;
    status.value = error;
    status.style = "background-color:#8F1717;";
  }
}

async function displaySearchResults(data) {
  const resultsList = document.createElement("ul");
  resultsList.classList.add("search-results");

  if (Array.isArray(data)) {
    const total = data.length;
    data.forEach(async (item, i) => {
      status.value = `Displaying ${i}/${total}`;
      const listItem = document.createElement("li");
      listItem.textContent = item[0];
      resultsList.appendChild(listItem);

      const button = document.createElement("button");
      button.textContent = "View File";
      button.addEventListener("click", () => {
        document.getElementById("preview").src =
          server + "file?path=" + item[1];
      });
      listItem.appendChild(button);
    });
  } else {
    const listItem = document.createElement("li");
    listItem.textContent = "No results found";
    resultsList.appendChild(listItem);
  }

  const resultsContainer = document.getElementById("results");
  if (resultsContainer) {
    resultsContainer.innerHTML = ""; // Clear previous results
    resultsContainer.appendChild(resultsList);
  }
}
