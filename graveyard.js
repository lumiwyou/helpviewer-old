async function displaySearchResults(data) {
  const resultsList = document.createElement("ul");
  const status = document.getElementById("status");
  resultsList.classList.add("search-results");

  if (Array.isArray(data)) {
    const total = data.length;
    var base = 0;
    var allowed_count = 100;
    data.forEach(async (item, i) => {
      status.value = `Displaying (${i}/${base + allowed_count})/${total}`;
      if (i - base >= allowed_count) {
        return;
      }
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
    // temporary handling of the #controller cuz lazy and dumb
    const controller = document.getElementById("controller");
    resultsContainer.innerHTML = ""; // Clear previous results
    resultsContainer.appendChild(controller);
    resultsContainer.appendChild(resultsList);
  }
