import { readdir, rm } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { readdirSync, readFileSync, existsSync } from "node:fs";

async function matchesEntry(entry, terms) {
  return terms.forEach((term, t) => {
    try {
      var found = false;
      if (element.title.includes(` ${term} `)) found = true;
      if (Object.keys(element).includes("headers")) {
        if (Array.isArray(element.headers)) {
          // Treat as array
          element.headers.forEach((header) => {
            if (header != null && Object.keys(header).includes("#text")) {
              if (header["#text"].toString().includes(` ${term} `))
                found = true;
            }
          });
        } else {
          // Treat as single-element
          if (
            element.headers != null &&
            Object.keys(element.headers).includes("#text")
          ) {
            if (element.headers["#text"].toString().includes(` ${term} `))
              found = true;
          }
        }
      }
      if (Object.keys(element).includes("codesnippets")) {
        if (Array.isArray(element.codesnippets)) {
          // Treat as array
          element.codesnippets.forEach((codesnippet) => {
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
            element.codesnippets != null &&
            Object.keys(element.codesnippets).includes("#text")
          ) {
            if (element.codesnippets["#text"].toString().include(term))
              found = true;
          }
        }
      }
    } catch (error_text) {
      console.log(error_text);
      console.log(element);
    }
    return found;
  });
}

async function generateIndex() {
  console.info("Generating index file");

  const index = global.config.index_file;

  if (existsSync(index_filepath)) rm(index);

  const parsingOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    // preserveOrder: true,
    unpairedTags: ["hr", "br", "link", "meta"],
    stopNodes: ["*.pre", "*.script"],
    processEntities: true,
    isArray: (tagName) => {
      if (["title", "h2", "codesnippet"].includes(tagName)) return true;
    },
    htmlEntities: true,
  };
  const parser = new XMLParser(parsingOptions);

  var products = readdirSync(global.config.data_dir);
  products.forEach((product, p) => {
    if (!global.config.included_files.includes(product)) return;
    product = path.join(global.config.data_dir, product);

    try {
      const html = readFileSync(product);
      const root = parser.parse(html);
    } catch (error) {
      console.error(`${product}: ${error}`);
      return;
    }

    // Issue: XML-structure varies between files. Need an adaptable algorithm to handle this issue.
    try {
      var index_entry = {
        filepath: file,
        title: root.html.head.Title,
        headers: root.html.body.div.div.div.div.h2,
        codesnippets: root.html.body.div.div.div.div.codesnippet,
      };
      global.searchIndex.files.push(file);
      global.searchIndex.index_data.push(index_entry);
    } catch (error) {
      console.error(error);
      return;
    }
  });
}

async function checkIndexing() {
  console.info("Checking indexing");

  if (!existsSync(global.config.index_file)) {
    console.info("No index file found");
    await generateIndex();
    await writeFile(
      global.config.index_file,
      JSON.stringify(global.index, null, 2),
    );
  } else {
    console.info("Loading index file into memory");
    global.index = JSON.parse(readFileSync(global.config.index_file));
    console.debug("Checking validity of index");
    /*console.log("Performing validity check ... ");
    var files = readdirSync(DATA_DIR);
    files.forEach((file) => {
      if (!global.searchIndex.files.includes(file)) generate_index();
    });*/
  }
}
