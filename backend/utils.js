import { readdir, rm, writeFile, readFile } from "node:fs/promises";
import { rmSync } from "fs";
import { XMLParser } from "fast-xml-parser";
import { readdirSync, readFileSync, existsSync } from "node:fs";

export function extractTags(obj, tag) {
  let results = [];

  if (!obj || typeof obj !== "object") return results;

  for (const key in obj) {
    if (key === tag) {
      // If multiple codesnippets at this level
      if (Array.isArray(obj[key])) results.push(...obj[key]);
      else results.push(obj[key]);
    } else {
      // Dive deeper
      results.push(...extractTags(obj[key], tag));
    }
  }

  return results;
}

export async function matchesEntry(entry, terms) {
  terms.forEach((term) => {
    entry.metadata.forEach((metadata) => {
      if (!metadata.data == []) if (metadata.data.includes(term)) return true;
    });
  });
  return false;
}

export function generateIndex() {
  console.info("Generating index file");

  const index = global.config.index_file;

  if (existsSync(index)) rm(index);

  const parsingOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
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

    try {
      var index_entry = {
        filepath: product,
        // Allows for more dynamic indexing and query stuff
        metadata: [
          { tag: "title", data: extractTags(root, "title") },
          { tag: "h2", data: extractTags(root, "h2") },
          { tag: "codesnippet", data: extractTags(root, "codesnippet") },
        ],
      };
      global.index.fileList.push(product);
      global.index.entries.push(index_entry);
    } catch (error) {
      console.error(error);
      return;
    }
  });
}

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
    console.log("Performing validity check ... ");
    var files = readdirSync(global.config.data_dir);
    /*files.forEach((file) => {
            console.error("Invalid index file");
            if (!global.index.fileList.includes(file)) {
                rm(global.config.index_file);
                generateIndex();
                return;
            }
        });*/
  }
};

export function handlePargs() {
  process.argv.forEach((param) => {
    switch (param) {
      case "--index-reset":
        if (existsSync(global.config.index_file))
          rmSync(global.config.index_file);
    }
  });
}
