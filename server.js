import http from "http";
import { writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
const PORT = 8080;

import {
  detectBufferMime,
  detectFileMime,
  detectFilenameMime,
} from "mime-detect";

// When using --expose-gc flag
if (global.gc) {
  global.gc(); // Force garbage collection
} else {
  console.log("Garbage collection is not exposed");
}

global.searchIndex = [];

async function generate_index() {
  console.log("Generating a search index ... this may take a while!");
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

  const files = readdirSync("docs2");
  files.forEach((file, f) => {
    process.stdout.clearLine[0];
    process.stdout.cursorTo(0);
    process.stdout.write(`${f} / ${files.length}`);
    // Exclusively iterate HTML files
    if (!file.includes(".html")) {
      return;
    }
    file = "docs2/".concat(file);

    try {
      var html = readFileSync(file);
      var root = parser.parse(html);
    } catch (error_text) {
      console.log(error_text);
      return;
    }

    try {
      var IndexEntry = {
        filepath: file,
        title: root.html.head.Title,
        headers: root.html.body.div.div.div.div.h2,
        codesnippets: root.html.body.div.div.div.div.codesnippet,
      };
      global.searchIndex.push(IndexEntry);
    } catch (error_text) {
      console.log(error_text);
      return;
    }
  });
  console.log(" Done!");
}

var index_data;
if (!existsSync("index.json")) {
  await generate_index();

  index_data = JSON.stringify(global.searchIndex, null, 2);
  writeFileSync("index.json", index_data);
} else {
  console.log("Reading search index ... ");
  index_data = readFileSync("index.json");
  global.searchIndex = JSON.parse(index_data);
}
index_data = null;

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url == "/") {
    var text = readFileSync("./index.html", "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.write(text);
  }

  var terms,
    results = [];
  if (req.url.includes("/file?path=")) {
    process.stdout.write(
      "FILE " +
        new Date().getTime() +
        ": " +
        req.url.split("/file?path=")[1] +
        ": ",
    );
    var filepath = req.url.split("/file?path=")[1];
    if (!existsSync(filepath)) {
      res.statusCode = 500;
      res.write("File does not exist");
      res.end();
      console.log("NEG");
      return;
    }
    var text = readFileSync(filepath, "utf-8");
    var contentType = await detectFileMime(filepath);
    if (contentType.localeCompare("text/xml")) contentType = "text/html";
    res.setHeader("Content-Type", contentType);
    res.write(text);
    console.log(contentType + " OK");
  }
  if (req.url.includes("/search?query=")) {
    terms = req.url.split("?query=")[1].split("+");
    process.stdout.write(`[SEARCH] ${new Date().getTime()}: ${terms}: `);

    global.searchIndex.forEach((element) => {
      terms.forEach((term, t) => {
        try {
          var found = false;
          if (element.title.includes(term)) found = true;
        } catch (error_text) {
          console.log(error_text);
          console.log(element);
        }

        if (found) {
          results.push([element.title, element.filepath]);
          return;
        }
      });
    });

    res.write(JSON.stringify(results));
    console.log("OK");
  }
  res.end();
});

server.listen(PORT, () => {
  console.log(`Service running on http://localhost:${PORT}`);
});
