// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2026 lum1

/* helper.js
 * a script to help with installing the helpviewer documentation product files
 */
import { parse } from "node-html-parser";
const product_root = "https://services.mtps.microsoft.com/serviceapi/products";

var productLinks = [];

export async function recurIndexing(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Response status: ${res.status}`);

  const text = await res.text();
  for (let x = 0; x < text.length; x++) {
    // WARN SHIT DOES NOT WORK
    if (text.slice(x, x + 2) == "<a>") {
      do {
        x++;
        console.log(text[x]);
      } while (text.slice(x, x + 3) != "</a>");
    }
  }
}

// Start the dominoes
recurIndexing(product_root);
