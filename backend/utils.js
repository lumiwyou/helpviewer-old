import { readdir, rm, writeFile, readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";

import { readdirSync, readFileSync, existsSync } from "node:fs";

export const matchesEntry = async function matchesEntry(entry, terms) {
  return terms.forEach((term, t) => {
    try {
      var found = false;
      console.log(entry);
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
};

export const generateIndex = function generateIndex() {
  console.info("Generating index file");

  const index = global.config.index_file;

  if (existsSync(index)) rm(index);

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
    product = global.config.data_dir.concat(product);
    if (!product.includes(".htm", ".html")) {
      rm(product);
      return;
    }

    try {
      var html = readFileSync(product);
      var root = parser.parse(html);
    } catch (error) {
      console.error(`${product}: ${error}`);
      return;
    }

    // Issue: XML-structure varies between files. Need an adaptable algorithm to handle this issue.
    try {
      var index_entry = {
        filepath: product,
        title: root.html.head.Title,
        //headers: root.html.body.div.div.div.div.h2,
        //codesnippets: root.html.body.div.div.div.div.codesnippet,
      };
      global.index.fileList.push(product);
      global.index.entries.push(index_entry);
    } catch (error) {
      console.error(error);
      return;
    }
  });
};

export const checkIndexing = async function checkIndexing() {
  console.info("Checking indexing");

  if (!existsSync(global.config.index_file)) {
    console.info("No index file found");
    generateIndex();
    await writeFile(global.config.index_file, JSON.stringify(global.index));
  } else {
    console.info("Loading index file into memory");
    global.index = JSON.parse(await readFile(global.config.index_file));
    console.debug("Checking validity of index");
    /*console.log("Performing validity check ... ");
    var files = readdirSync(global.config.data_dir);
    files.forEach((file) => {
      console.error("Invalid index file");
      if (!global.index.fileList.includes(file)) generateIndex();
      });*/
  }
};
