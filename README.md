# 11ty-pagination

Some experiments, per https://github.com/11ty/eleventy/issues/881.

The _data/old-testament.js file contains the following data:

```js
module.exports = new Map([
  // ["Genesis", 50],
  // ["Exodus", 40],
  // ["Leviticus", 27],
  // ["Numbers", 36],
  // ["Deuteronomy", 34],
  // ["Joshua", 24],
  // ["Judges", 21],
  ["Ruth", 4],
  ["1 Samuel", 31],
  // ["2 Samuel", 24]
]);
```



Currently, if you run <kbd>npm run build</kbd>, Eleventy will generate _site/scriptures/ruth/[1..4]/index.html and _site/scriptures/1-samuel/[1..31]/index.html.
Note that the page generation is somewhat slow, since each page currently hits a random <https://bible-api.com/> to grab content for those pages (and doing 35 API requests isn't speedy). That's also the reason that most of the book's in the above snipets are commented out; 35 requests are slow, 291 is painful.
Also note that the bible-api.com requests fetch an entire BOOK in one request, and then we loop over the returned verses and create the page output. I'm not convinced any of that is the best approach since if you added all books from the bible (or even only Old or New testaments), you'd be flooding the API server with thousands of requests and almost DDoSing them. Ideally you'd have a local cache of the files (assuming the bible doesn't really change frequently), or just find a copy of the bible verses in some JSON file that you could loop over without any network requests.
I did randomly find https://github.com/thiagobodruk/bible/blob/master/json/en_kjv.json, which might work, but possibly also needs a bit of data fiddling to use it as a collection or _data/ file to suit your requirements (and it's a 4.34 MB JSON blob, so processing might be slow -- although still much faster than any network requests).

Since all the files in the ./scriptures/\*.njk currently look exactly the same (except for the frontmatter `title` and `pagination.data` collection name, I added a script which reads the _data/old-testament.js file and generates all the ./scriptures/\*.njk files based on a template (but aggressively overwrites the ./scriptures/\*.njk files, so use cautiously).

Here's a copy of the current ./scriptures/1-samuel.njk template:

```md
---
title: 1 Samuel
pagination:
  data: collections.1-Samuel
  size: 1
  alias: chapter
---

{%- fetchBook title, chapter -%}
```

There are a few repetitive frontmatter values (`layout`, `permalink`, etc) that are found in the ./scriptures/scriptures.json file to try and keep the individual .njk files as _lean_ as possible:

```json
{
  "layout": "layouts/scripture.njk",
  "permalink": "scriptures/{{ title | slug }}/{{ chapter }}/",
  "renderData": {
    "title": "{{ title }} &mdash; {{ chapter }}"
  }
}
```

So, the "pagination magic" happens in the collections. Note in the snippet above we're using `collections.1-Samuel`. The collections are all defined in the .eleventy file in the `loadScriptures()` method:

```js
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
```

Currently, we're loading the data file from "_data/old-testament.js" and looping over the Map object and converting `["1 Samuel", 31]` to `config.addCollection("1-Samuel", [1, 2, 3, ..., 31])` (where we loop over the chapter array using pagination to generate the individual pages). Also worth noting is how we "slugify" the collection name to accomodate for collection names with spaces.
