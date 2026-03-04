// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2026 lum1
import { existsSync, readFileSync, readdirSync, readFile } from "node:fs";
import { detectFileMime } from "mime-detect";
import { checkIndexing, handlePargs, matchesEntry } from "./utils.js";
import express from "express";
import cors from "cors";
const app = express();

global.config = {
  blacklist: ["/backend/*"],
  endpoints: {
    root: "/",
    get_file: "/file",
    query: "/query",
  },
  bind: {
    port: 8000,
    address: "localhost",
  },
  data_dir: "helpviewer_data/",
  index_file: "backend/index.json",
  included_files: [".html", ".htm"],
};

//global.config = JSON.parse(readFileSync("backend/index.json"));
//console.log(global.config);

for (var x = 0; x < process.argv.length; x++) {
  switch (process.argv[x]) {
    case "--bind":
      global.config.bind.address = process.argv[x + 1];
    case "--port":
      global.config.bind.port = parseInt(process.argv[x + 1]);
  }
}

global.index = {
  fileList: [],
  entries: [],
};

app.use(cors());
app.use(express.static("public"));

app.get(global.config.endpoints.get_file, async (req, res) => {
  console.debug(`${new Date().getTime()} ${req.url}`);

  const file = req.query.path;
  if (!file) {
    return res.status(400).send("Path query parameter is required");
  }

  if (!existsSync(file)) {
    res.status(404);
    res.send("File not found");
    res.end();
    console.error("404");
  }

  var type = await detectFileMime(file);
  if (type.localeCompare("text/xml")) type = "text/html";
  res.header("Content-Type", type);
  res.send(readFileSync(file));
  console.info(`${type} OK`);
  res.end();
});

// QUERY ENDPOINT
app.get(global.config.endpoints.query, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var results = [];
  if (!req.query.terms) {
    return res.status(400).send("Path query parameter is required");
  }
  const terms = req.query.terms.split("+");

  console.info(`${new Date().getTime()} ${req.url}`);
  global.index.entries.forEach((entry) => {
    if (matchesEntry(entry, terms))
      results.push([entry.metadata[0].data[0], entry.filepath]);
  });
  res.send(JSON.stringify(results));
  res.end();
});

app.listen(global.config.bind.port, () => {
  handlePargs();
  checkIndexing();
  console.info(
    `Service running on http://${global.config.bind.address}:${global.config.bind.port}`,
  );
});
