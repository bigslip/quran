const Fuse = require('fuse.js');
const chaptersArray = [
  {
    "revelationPlace": "makkah",
    "transliteratedName": "Al-Fatihah",
    "versesCount": 7,
    "translatedName": "The Opener",
    "slug": "al-fatihah"
  }
];
const fuse = new Fuse(chaptersArray, {
  keys: ['transliteratedName', 'name', 'translatedName.name'],
  threshold: 0.3,
});
console.log("Match for 'The Opener':", fuse.search('The Opener').length > 0);
