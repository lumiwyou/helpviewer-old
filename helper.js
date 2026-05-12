// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2026 Lumi Hyväri

/* helper.js
 * a script to help with installing the helpviewer documentation product files
 */
import { parse } from "node-html-parser";
import { existsSync } from "fs";
import { mkdir, rm, writeFile, readFile } from "fs/promises";
import { md5 } from "js-md5";
const product_root = "https://services.mtps.microsoft.com/serviceapi/products";

var productLinks = [];

export async function recurIndexing(url) {
  console.log(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Response status: ${res.status}`);

  // FIX: Temporary solution to the encoding problem - write to disk and then read it and parse
  if (!existsSync("backend/tmp")) mkdir("backend/tmp");
  const filename = `backend/tmp/${md5(url + new Date().getTime())}.html`;
  await writeFile(filename, await res.text());
  const text = await readFile(filename, "utf-16le");
  const root = parse(text);
  root.getElementsByTagName("a").forEach((linkElement) => {
    const uri = `${product_root}${linkElement.getAttribute("href").split("serviceapi/products")[1]}`;
    if (!productLinks.includes(uri) && !uri.includes(".cab")) {
      productLinks.push(uri);
      recurIndexing(uri);
    }
  });
}

// Start the dominoes
recurIndexing(product_root);
