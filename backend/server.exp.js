// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2024 lum1
import { existsSync, readFileSync, readdirSync, readFile } from "node:fs";
import { detectFileMime } from "mime-detect";
import { checkIndexing, generateIndex, matchesEntry } from "./utils.js";
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
    index_file: "index.json",
    included_files: [".html", ".htm"],
};

process.argv.forEach(function (value, index, array) {
    if (value.localeCompare("--bind") && array.length != index)
        global.config.bind.address = array[index + 1];
    if (value.localeCompare("--port") && array.length != index)
        global.config.bind.port = array[index + 1];
});

global.index = {
    fileList: [],
    entries: [],
};

app.use(cors());

// ROOT REDIRECT ENDPOINT
app.get(global.config.endpoints.root, (req, res) => {
    res.header("Content-Type", "text/html");
    res.send(readFileSync("frontend/index.html"));
    res.end();
});

// GET_FILE ENDPOINT
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
    // To fix the issue where documents are viewed as XML in an html client
    if (type.localeCompare("text/xml")) type = "text/xml";
    if (file.includes(".css")) type = "text/css";
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
            results.push(entry.title, entry.filepath);
    });
    res.send(JSON.stringify(results));
    res.end();
});

app.listen(global.config.bind.port, () => {
    checkIndexing();
    console.info(
        `Service running on http://${global.config.bind.address}:${global.config.bind.port}`,
    );
});
