// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2024 lum1
import { existsSync } from "node:fs";
import { detectFileMime } from "mime-detect";
import * as util from "./backend/utils.js";
import express from "express";
const app = express();

global.config = {
  blacklist: ["/backend/*"],
  endpoints: {
    root: "/",
    get_file: "/file?path=",
    query: "/query?terms=",
  },
  bind: {
    port: 8000,
    address: "localhost",
  },
  data_dir: "helpviewer_data",
  index_file: "index.json",
  included_files: [".html", ".htm"],
};

global.index = {
  fileList: [],
  entries: [],
};

// ROOT REDIRECT ENDPOINT
app.get(global.config.endpoints.root, async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.write(await readFile("/index.html"));
});

// GET_FILE ENDPOINT
app.get(global.config.endpoints.get_file, async (req, res) => {
  console.debug(`${new Date().getTime()} ${req.url}`);

  const file = req.url.split(global.config.endpoints.get_file)[1];
  if (!existsSync(file)) {
    res.status(404);
    res.send("File not found");
    res.end();
    console.error("404");
  }

  var type = await detectFileMime(file);
  // To fix the issue where documents are viewed as XML in an html client
  if (type.localeCompare("text/xml")) type = "text/xml";
  if (file.includes(".css")) type = "text/css";
  res.setHeader("Content-Type", type);
  res.write(await readFile(file));
  console.info(`${type} OK`);
});

// QUERY ENDPOINT
app.get(global.config.endpoints.query, (req, res) => {
  var results = [];
  const terms = req.url.split(global.config.endpoints.query)[1].split("+");
  console.info(`${new Date().getTime()} ${req.url}`);

  global.index.entries.forEach((entry) => {
    if (util.matchesEntry(entry, terms))
      results.push(entry.title, entry.filepath);
  });
  res.send(JSON.stringify(results));
  res.end();
});

app.listen(global.config.bind.port, () => {
  util.checkIndexing();
  console.info(
    `Service running on http://${global.config.bind.address}:${global.config.bind.port}`,
  );
});
