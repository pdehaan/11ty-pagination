const fs = require("fs").promises;
const path = require("path");

const slugify = require("slugify");

const scriptureMap = require("./_data/old-testament");

main();

function template(title) {
  const collectionName = slugify(title);
  return `---
title: ${title}
pagination:
  data: collections.${collectionName}
  size: 1
  alias: chapter
---

{%- fetchBook title, chapter -%}
`;
}

async function main(outdir="./scriptures") {
  for (const [title] of scriptureMap) {
    const filename = slugify(title).toLowerCase();
    await fs.writeFile(path.join(outdir, `${filename}.njk`), template(title).trim() + "\n");
  }
}
