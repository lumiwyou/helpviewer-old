import http from "http";
import { readdirSync, readFileSync, existsSync } from "node:fs";
//import { JSDOM } from "jsdom";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
const PORT = 8080;

// When using --expose-gc flag
if (global.gc) {
  global.gc(); // Force garbage collection
} else {
  console.log("Garbage collection is not exposed");
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url == "/") {
    text = readFileSync("./index.html", "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.write(text);
  }

  var terms,
    files,
    results = [];
  var err, text, found, filepath, html, title;
  var root;
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
  if (req.url.includes("/file?path=")) {
    process.stdout.write(
      "FILE " +
        new Date().getTime() +
        ": " +
        req.url.split("/file?path=")[1] +
        ": ",
    );
    filepath = req.url.split("/file?path=")[1];
    if (!existsSync(filepath)) {
      res.statusCode = 500;
      res.write("brub, this thing does not exist...");
      res.end();
      console.log("NEG");
      return;
    }
    text = readFileSync(filepath, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.write(text);
    console.log("OK");
  }
  if (req.url.includes("/search?query=")) {
    terms = req.url.split("?query=")[1].split("+");
    process.stdout.write(
      "SEARCH " + new Date().getTime() + ": " + terms + ": ",
    );

    files = readdirSync("docs2");
    files.forEach((file) => {
      // Exclusively iterate HTML files
      if (!file.includes(".html")) {
        return;
      }
      found = false;
      file = "docs2/".concat(file);
      var error = false;

      try {
        html = readFileSync(file);
        root = parser.parse(html);
      } catch {
        error = true;
      }
      if (error) {
        return;
      }

      terms.forEach((term) => {
        if (root.html.head.Title.includes(term)) {
          found = true;
        }
      });

      // Get synopsis
      if (found) {
        results.push([root.html.head.Title, file]);
      }
    });
    res.write(JSON.stringify(results));
    console.log("OK");
  }
  res.end();
});

server.listen(PORT, () => {
  console.log("Server running on port ${PORT}");
});
