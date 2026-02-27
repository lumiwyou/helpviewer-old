import http from "http";
import { readdirSync, readFileSync, existsSync } from "node:fs";
const PORT = 8080;

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
  var err, text, found, filepath;
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
      found = false;
      file = "docs2/".concat(file);
      text = readFileSync(file);
      terms.forEach((term) => {
        if (text.includes(term)) {
          found = true;
        } else {
          found = false;
        }
      });
      if (found) {
        results.push(file);
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
