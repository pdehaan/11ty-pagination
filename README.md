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
