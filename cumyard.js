export async function matchesEntry(entry, terms) {
  return terms.forEach((term, t) => {
    try {
      var found = false;
      if (entry.title.includes(` ${term} `)) found = true;
      if (Object.keys(entry).includes("headers")) {
        if (Array.isArray(entry.headers)) {
          // Treat as array
          entry.headers.forEach((header) => {
            if (header != null && Object.keys(header).includes("#text")) {
              if (header["#text"].toString().includes(` ${term} `))
                found = true;
            }
          });
        } else {
          // Treat as single-element
          if (
            entry.headers != null &&
            Object.keys(entry.headers).includes("#text")
          ) {
            if (entry.headers["#text"].toString().includes(` ${term} `))
              found = true;
          }
        }
      }
      if (Object.keys(entry).includes("codesnippets")) {
        if (Array.isArray(entry.codesnippets)) {
          // Treat as array
          entry.codesnippets.forEach((codesnippet) => {
            if (
              codesnippet != null &&
              Object.keys(codesnippet).includes("#text")
            ) {
              if (codesnippet["#text"].toString().includes(term)) found = true;
            }
          });
        } else {
          // Treat as single-element
          if (
            entry.codesnippets != null &&
            Object.keys(entry.codesnippets).includes("#text")
          ) {
            if (entry.codesnippets["#text"].toString().include(term))
              found = true;
          }
        }
      }
    } catch (error_text) {
      console.log(error_text);
      console.log(entry);
    }
    return found;
  });
}
