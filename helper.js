// SPDX-License-Identifier: GPL-3.0 WITH bison-exception
// Copyright © 2026 lum1
import { parse } from "node-html-parser";
const product_root = "https://services.mtps.microsoft.com/serviceapi/products";

export async function recurIndexing(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Response status: ${res.status}`);

    const root = await parse(await res.text());
    console.log(root.querySelectorAll("a"));
}

// Start the dominoes
recurIndexing(product_root);
