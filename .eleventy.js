const axios = require("axios");
const slugify = require("slugify");

module.exports = (eleventyConfig) => {
  eleventyConfig.setDataDeepMerge(true);

  loadScriptures("old-testament", eleventyConfig);

  eleventyConfig.addNunjucksAsyncShortcode("fetchBook", async (book, chapter) => {
    const res = await fetchBook(book, chapter);
    const verses = res.verses.map(verse => {
      return `<dt class="verse">${verse.chapter}:${verse.verse}</dt><dd>${ verse.text }</dd>`;
    });
    return `<dl>${ verses.join("") }</dl>`;
  });

  return {
    markdownTemplateEngine: "njk"
  };
};

function loadScriptures(dir, config) {
  const scriptureMap = require(`./_data/${dir}`);
  for (const book of scriptureMap.keys()) {
    const collectionName = slugify(book);
    const chapters = scriptureMap.get(book);
    config.addCollection(collectionName, () => indexedArray(chapters));
  }
}

function indexedArray(len, start=1) {
  const arr = Array.apply(null, Array(len));
  return arr.map((_, idx) => idx + start);
}

async function fetchBook(book, chapter=1) {
  const apiUrl = new URL(`/${ book} ${ chapter }`, "https://bible-api.com").href;
  console.info(`Fetching ${apiUrl}`);
  const res = await axios.get(apiUrl);
  return res.data;
}
