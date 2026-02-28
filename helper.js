import { XMLParser } from "fast-xml-parser";

const microsoft_root = "https://services.mtps.microsoft.com/serviceapi/products";

async function parsePage(url) {
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
  const res = await fetch(url);
  const html = res.body.getReader();
  console.log(html);
  var root = parser.parse(res);
}

function install() {
  parsePage(microsoft_root);
}

install();
